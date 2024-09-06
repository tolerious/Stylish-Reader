import { backendServerUrl } from "../entryPoint/constants";
import { getLoginToken } from "../entryPoint/utils/background.utils";
import { stylishReaderMainColor } from "../utils/constants";
import { checkUserLoginStatus } from "../utils/utils";
import {
  clickableWordClassName,
  floatingIconSize,
  phraseFloatingIconSize,
  phraseFloatingPanelId,
  phraseFloatingPanelShadowRootId,
  phraseFloatingPanelSize,
  stylishReaderFloatingIconId,
  translationFloatingPanelId,
  translationFloatingPanelShadowRootId,
  translationPanelSize,
} from "./constants";

let currentSelectionContent = "";

let selectionRange = null;

let gSelectionPosition = { x: 0, y: 0 };

let isPhraseFloatingPanelOpen = false;

/**
 * 遍历页面上所有dom节点， 根据单词列表，构建自定义元素
 * @param {Array} targetWordList 目标词典单词列表
 */

export function goThroughDomAndGenerateCustomElement(targetWordList) {
  let walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  let node = walker.currentNode;
  let map = new Map();
  let index = 0;
  // 找到所有符合要求的#text节点，并保存在Map中
  while (node) {
    if (
      !["SCRIPT", "HTML"].includes(node.parentNode.nodeName) &&
      node.textContent.trim() !== ""
    ) {
      map.set(index, node);
      index++;
    }
    node = walker.nextNode();
  }
  // 判断#text是否包含目标单词
  for (const [_, value] of map) {
    convertCurrentTextNodeContent(value, targetWordList);
  }

  document.querySelectorAll(`.${clickableWordClassName}`).forEach((e) => {
    e.addEventListener("click", (e) => {
      hideFloatingIcon();
      sendMessageFromGeneralScriptToFloatingPanel({
        type: "search-word",
        word: e.target.textContent,
      });
    });
  });
}

function removeUnMarkedWord(word) {
  const markedNodeList = document.querySelectorAll(
    `.${clickableWordClassName}`
  );
  markedNodeList.forEach((node) => {
    // 说明取消的是这个节点
    if (
      convertStringToLowerCaseAndRemoveSpecialCharacter(node.textContent) ===
      convertStringToLowerCaseAndRemoveSpecialCharacter(word)
    ) {
      const targetParentNode = node.parentNode;
      // 重新把被自定义span标签包裹的文本系欸但替换回来
      const textNode = document.createTextNode(` ${word} `);
      targetParentNode.replaceChild(textNode, node);
    }
  });
}

function convertCurrentTextNodeContent(textNode, targetWordList) {
  // 判断并找出当前文本节点中包含的目标单词
  const textContent = textNode.textContent;
  const targetWordSet = new Set(targetWordList);
  const splittedTextContentStringList = textContent.split(" ");
  // 存放的是目标单词在splittedTextContentStringList中的索引
  const indexList = [];
  splittedTextContentStringList.filter((s, index) => {
    if (
      targetWordSet.has(convertStringToLowerCaseAndRemoveSpecialCharacter(s))
    ) {
      indexList.push(index);
    }
  });

  const currentTextNodeParentNode = textNode.parentNode;
  const newNodeList = [];
  // 遍历indexList，重新构造#text节点
  if (indexList.length > 0) {
    splittedTextContentStringList.forEach((s, index) => {
      // 这段文本不包含目标单词
      const stt = s + " ";
      if (indexList.indexOf(index) > -1) {
        const spanElement = document.createElement("span");
        spanElement.textContent = stt;
        spanElement.style.color = stylishReaderMainColor;
        spanElement.classList = [clickableWordClassName];
        spanElement.style.cursor = "pointer";
        newNodeList.push(spanElement);
      } else {
        const textNode = document.createTextNode(stt);
        newNodeList.push(textNode);
      }
    });
    /**
     * FIXME: 这里再最外层添加了一个span元素，是有一些问题的，因为增加了一个原本dom中不存在的元素
     * 有可能会改变原有dom的样式，这里最好是插入一个自定义的dom元素，这样不会改变原有dom的结构。
     */
    const temporaryDivElement = document.createElement("span");
    newNodeList.forEach((node) => {
      temporaryDivElement.append(node);
    });
    if (!currentTextNodeParentNode.classList.contains(clickableWordClassName)) {
      currentTextNodeParentNode.replaceChild(temporaryDivElement, textNode);
    }
  }
}

export function customizeGeneralEvent() {
  addSelectionChangeEvent();
  addMouseDownEvent();
  listenEventFromFloatingPanelEvent();
  listenEventFromPhraseFloatingPanelEvent();
}

/**
 * 监听mousedown事件，当用户点击悬浮图标时，显示翻译面板
 */
function addMouseDownEvent() {
  document.addEventListener("mousedown", async function (event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const floatingPanelContainer = document.getElementById(
      translationFloatingPanelShadowRootId
    );
    const floatingPanelContainerRect =
      floatingPanelContainer.getBoundingClientRect();

    // 在floatingPanel范围内
    if (
      mouseX >= floatingPanelContainerRect.left &&
      mouseX <= floatingPanelContainerRect.right &&
      mouseY >= floatingPanelContainerRect.top &&
      mouseY <= floatingPanelContainerRect.bottom &&
      event.target.id === translationFloatingPanelShadowRootId
    ) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }

    // 点击的是floatingIcon
    if ([stylishReaderFloatingIconId].includes(event.target.id)) {
      sendMessageFromGeneralScriptToFloatingPanel({
        type: "search-word",
        word: currentSelectionContent.toString().trim(),
      });
      showTranslationFloatingPanel();
      sendMessageFromGeneralScriptToFloatingPanel({
        type: "play",
      });
      sendMessageFromGeneralScriptToFloatingPanel({
        type: "token",
        message: await getLoginToken(),
      });
      event.stopPropagation();
      event.preventDefault();
      return;
    }

    // 点击的是单词列表中的单词，即已经高亮的单词，需要显示翻译面板
    if (event.target.classList.toString().includes(clickableWordClassName)) {
      hideTranslationFloatingPanel();
      setTimeout(async () => {
        showTranslationFloatingPanel(
          "word",
          calculateFloatingPanelPosition(event.target)
        );
        sendMessageFromGeneralScriptToFloatingPanel({
          type: "token",
          message: await getLoginToken(),
        });
        sendMessageFromGeneralScriptToFloatingPanel({
          type: "play",
        });
      }, 500);
      return;
    }

    // 如果点击在别处，隐藏floatingPanel和floatingIcon

    hideFloatingIcon();
    hideTranslationFloatingPanel();
  });
}

/**
 * 监听selectionchange事件，当用户选中文本时，显示悬浮图标
 */
function addSelectionChangeEvent() {
  document.addEventListener("selectionchange", async function () {
    sendMessageFromGeneralScriptToFloatingPanel({
      type: "token",
      message: await getLoginToken(),
    });
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    if (selection.toString().trim()) {
      const rect = range.getBoundingClientRect();
      let x = calculateFloatingIconPosition(rect, floatingIconSize).x;
      let y = calculateFloatingIconPosition(rect, floatingIconSize).y;
      gSelectionPosition = calculateFloatingPanelPosition(range);
      gSelectionPosition.y = rect.top;
      // FIXME: 这里没有考虑到selection的位置可能会超出屏幕的情况
      showFloatingIcon(x, y);
      currentSelectionContent = selection.toString().trim();
    }
  });
}

function calculateFloatingIconPosition(rect, baseElementSize) {
  return {
    x: (rect.right - rect.left) / 2 + rect.left - baseElementSize.width / 2,
    y: rect.top - baseElementSize.height,
  };
}

function createFloatingIcon(x, y) {
  const div = document.createElement("div");
  div.id = stylishReaderFloatingIconId;
  div.style.display = "block";
  div.style.position = "fixed";
  div.style.top = y + "px";
  div.style.left = x + "px";
  div.style.height = floatingIconSize.height + "px";
  div.style.width = floatingIconSize.width + "px";
  div.style.borderRadius = "5px";
  div.style.cursor = "pointer";
  div.style.zIndex = 9998;
  div.style.border = "2px solid " + stylishReaderMainColor;
  div.style.backgroundColor = "white";
  div.style.backgroundImage =
    "url('https://stylishreader.oss-cn-beijing.aliyuncs.com/stylish-reader-48.png')";
  div.style.backgroundSize = "cover";
  document.body.appendChild(div);
}

function showFloatingIcon(x, y) {
  const floatingIcon = document.getElementById(stylishReaderFloatingIconId);
  if (floatingIcon) {
    floatingIcon.style.display = "block";
    floatingIcon.style.top = y + "px";
    floatingIcon.style.left = x + "px";
  } else {
    createFloatingIcon(x, y);
  }
}

function hideFloatingIcon() {
  const floatingIcon = document.getElementById(stylishReaderFloatingIconId);
  if (floatingIcon) {
    floatingIcon.style.display = "none";
  }
}

function calculateFloatingPanelPosition(targetElement) {
  const x = targetElement.getBoundingClientRect().left;
  const y = targetElement.getBoundingClientRect().top;
  showTranslationFloatingPanelTemporary();
  const floatingPanel = document.getElementById(
    translationFloatingPanelShadowRootId
  );
  const floatingPanelHeight = floatingPanel.offsetHeight;
  const floatingPanelWidth = floatingPanel.offsetWidth;
  let positionX = x - floatingPanelWidth / 2;
  let positionY = y - floatingPanelHeight;
  if (
    x - floatingPanelWidth / 2 + floatingPanelWidth >
    document.body.clientWidth
  ) {
    positionX = document.body.clientWidth - floatingPanelWidth;
  }
  return {
    x: positionX < 0 ? 0 : positionX,
    y: positionY < 0 ? 0 : positionY,
  };
}

// 临时显示下panel，但是是透明的，所以用户不会感觉到知识为了获取到它的宽高
function showTranslationFloatingPanelTemporary() {
  const floatingPanel = document.getElementById(
    translationFloatingPanelShadowRootId
  );
  floatingPanel.style.display = "block";
  floatingPanel.style.opacity = 0;
  floatingPanel.style.top = 0;
  floatingPanel.style.left = 0;
  floatingPanel.style.boxShadow = "none";
  floatingPanel.style.zIndex = 1;
}

// source=selection,说明点击的是floating icon
export async function showTranslationFloatingPanel(
  source = "selection",
  position = { x: 0, y: 0 }
) {
  await checkUserLoginStatus();

  const translationPanel = document.getElementById(
    translationFloatingPanelShadowRootId
  );
  translationPanel.style.display = "block";
  if (source === "selection") {
    showTranslationFloatingPanelTemporary();
    let x = gSelectionPosition.x;
    let y = gSelectionPosition.y;
    translationPanel.style.top = y + "px";
    translationPanel.style.left = x + "px";
    translationPanel.style.opacity = 1;
    translationPanel.style.boxShadow = "0 0 15px 5px grey";
  } else {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    position.x = calculateFloatingPanelPosition(range).x;
    position.y = calculateFloatingPanelPosition(range).y;

    translationPanel.style.top = position.y + "px";
    translationPanel.style.left = position.x + "px";
    translationPanel.style.opacity = 1;
    translationPanel.style.boxShadow = "0 0 15px 5px grey";
  }
}

function hideTranslationFloatingPanel() {
  const translationPanel = document.getElementById(
    translationFloatingPanelShadowRootId
  );
  if (translationPanel) {
    translationPanel.style.display = "none";
  }
}

let isDragging = false;

function phraseFloatingPanelMouseDownHandler(e) {
  e.preventDefault();
  const shadowRoot = document.getElementById(phraseFloatingPanelShadowRootId);
  shadowRoot.style.cursor = "grabbing";
  isDragging = true;
}

function documentMouseMoveHandler(e) {
  if (isDragging) {
    const shadowRoot = document.getElementById(phraseFloatingPanelShadowRootId);
    shadowRoot.style.cursor = "grabbing";
    setPhrasePanelPosition(
      e.clientX - phraseFloatingIconSize.width / 2,
      e.clientY - phraseFloatingIconSize.height / 2
    );
  }
}

function phraseFloatingPanelClickHandler(e) {
  if (!isPhraseFloatingPanelOpen) {
    sendMessageFromGeneralScriptToPhraseFloatingPanelShadowDom({
      type: "show-or-hide-phrase-icon",
    });
    showPhraseFloatingPanel();
    isPhraseFloatingPanelOpen = true;
  }
}

function phraseFloatingPanelMouseUpHandler(e) {
  isDragging = false;
  const shadowRoot = document.getElementById(phraseFloatingPanelShadowRootId);
  shadowRoot.style.cursor = "grab";
}

function setPhrasePanelPosition(x, y) {
  const shadowRoot = document.getElementById(phraseFloatingPanelShadowRootId);
  shadowRoot.style.top = y + "px";
  shadowRoot.style.left = x + "px";
}

function showPhraseFloatingPanel() {
  const shadowRoot = document.getElementById(phraseFloatingPanelShadowRootId);
  shadowRoot.style.height = `${phraseFloatingPanelSize.height}px`;
  shadowRoot.style.width = `${phraseFloatingPanelSize.width}px`;
  shadowRoot.style.borderRadius = 0;
  shadowRoot.style.cursor = "default";
}

function showPhraseFloatingIcon() {
  const shadowRoot = document.getElementById(phraseFloatingPanelShadowRootId);
  shadowRoot.style.height = `${phraseFloatingIconSize.height}px`;
  shadowRoot.style.width = `${phraseFloatingIconSize.width}px`;
  shadowRoot.style.borderRadius = `${phraseFloatingIconSize.width}px`;
  shadowRoot.style.cursor = "grab";
}

async function createPhraseFloatingPanelToShadowDom() {
  const shadowRoot = document.createElement("div");
  shadowRoot.id = phraseFloatingPanelShadowRootId;
  shadowRoot.style.height = `${phraseFloatingIconSize.height}px`;
  shadowRoot.style.width = `${phraseFloatingIconSize.width}px`;
  shadowRoot.style.borderRadius = `${phraseFloatingIconSize.width}px`;
  shadowRoot.style.boxShadow = "0 0 15px 5px grey";
  shadowRoot.style.position = "fixed";
  shadowRoot.style.top = `${window.innerHeight / 3}px`;
  shadowRoot.style.cursor = "grab";
  shadowRoot.style.right = "20px";
  shadowRoot.style.zIndex = "9999";
  shadowRoot.style.backgroundColor = "white";
  const shadow = shadowRoot.attachShadow({ mode: "open" });

  // 创建挂载点
  const mountPoint = document.createElement("div");
  mountPoint.id = phraseFloatingPanelId;

  // 创建脚本挂载点
  const vueScript = document.createElement("script");

  // 创建样式挂载点
  const styleElement = document.createElement("style");
  styleElement.setAttribute("type", "text/css");
  const cssCode = await injectCssToShadowDom(
    "assets/css/stylish-reader-phrase-floating-panel-index.css"
  );
  styleElement.appendChild(document.createTextNode(cssCode));

  // 在shadow dom中添加挂载点
  shadow.appendChild(mountPoint);

  // 在shadow dom中添加脚本挂载点
  const jsCode = await injectJsToShadowDom(
    "assets/js/stylish-reader-phrase-floating-panel.js"
  );

  vueScript.textContent = jsCode;
  shadow.appendChild(vueScript);

  // 在shadow dom中添加样式挂载点
  shadow.appendChild(styleElement);

  // 添加到页面上
  document.body.appendChild(shadowRoot);

  // 添加mousedown事件监听
  shadowRoot.addEventListener("mousedown", phraseFloatingPanelMouseDownHandler);

  // 添加 document mousemove事件监听
  document.addEventListener("mousemove", documentMouseMoveHandler);

  // 添加mouseup事件监听
  shadowRoot.addEventListener("mouseup", phraseFloatingPanelMouseUpHandler);

  // 添加click事件监听
  shadowRoot.addEventListener("click", phraseFloatingPanelClickHandler);

  eval(vueScript.textContent);
}

async function createTranslationFloatingPanelToShadowDom(x = 0, y = 0) {
  const shadowRoot = document.createElement("div");
  shadowRoot.id = translationFloatingPanelShadowRootId;
  shadowRoot.style.display = "none";
  shadowRoot.style.boxSizing = "border-box";
  shadowRoot.style.borderRadius = "3px";
  shadowRoot.style.width = translationPanelSize.width + "px";
  shadowRoot.style.backgroundColor = "white";
  shadowRoot.style.boxShadow = "0 0 15px 5px grey";
  shadowRoot.style.position = "fixed";
  shadowRoot.style.top = y + "px";
  shadowRoot.style.left = x + "px";
  shadowRoot.style.zIndex = "9999";
  const shadow = shadowRoot.attachShadow({ mode: "open" });

  // 创建挂载点
  const mountPoint = document.createElement("div");
  mountPoint.id = translationFloatingPanelId;

  // 创建脚本挂载点
  const vueScript = document.createElement("script");

  // 创建样式挂载点
  const styleElement = document.createElement("style");
  styleElement.setAttribute("type", "text/css");
  const cssCode = await injectCssToShadowDom(
    "assets/css/stylish-reader-translation-panel-index.css"
  );
  styleElement.appendChild(document.createTextNode(cssCode));

  // 在shadow dom中添加挂载点
  shadow.appendChild(mountPoint);

  // 在shadow dom中添加脚本挂载点
  const jsCode = await injectJsToShadowDom(
    "assets/js/stylish-reader-translation-panel.js"
  );
  vueScript.textContent = jsCode;
  shadow.appendChild(vueScript);

  // 在shadow dom中添加样式挂载点
  shadow.appendChild(styleElement);

  // 添加到页面上
  document.body.appendChild(shadowRoot);

  eval(vueScript.textContent);
}

function checkIfTranslationFloatingPanelExist() {
  return document.getElementById(translationFloatingPanelShadowRootId);
}

function checkIfPhraseFloatingPanelExist() {
  return document.getElementById(phraseFloatingPanelShadowRootId);
}

function injectCssToShadowDom(cssFileUrl) {
  return new Promise((resolve) => {
    fetch(browser.runtime.getURL(cssFileUrl))
      .then((response) => response.text())
      .then((css) => resolve(css))
      .catch((error) => console.error("Error injecting CSS:", error));
  });
}

export function listenEventFromPhraseFloatingPanelEvent() {
  document.addEventListener("eventSendFromPhraseFloatingPanel", (e) => {
    const detail = JSON.parse(e.detail);
    if (detail.type === "phrase-floating-panel-show-icon") {
      showPhraseFloatingIcon();
      isPhraseFloatingPanelOpen = false;
    }
  });
}

function listenEventFromFloatingPanelEvent() {
  document.addEventListener("floatingPanelEvent", async (event) => {
    const detail = JSON.parse(event.detail);
    switch (detail.type) {
      case "get-translation-done":
        break;
      case "remove-word":
        removeUnMarkedWord(detail.message);
        break;
      case "save-word":
        goThroughDomAndGenerateCustomElement(await getWordList());
        break;
      default:
        break;
    }
  });
}

function sendMessageFromGeneralScriptToFloatingPanel(message) {
  const event = new CustomEvent("generalScriptEvent", {
    detail: JSON.stringify(message),
  });
  document.dispatchEvent(event);
}

function sendMessageFromGeneralScriptToPhraseFloatingPanelShadowDom(message) {
  const event = new CustomEvent("phraseFloatingPanelEvent", {
    bubbles: true,
    composed: true,
    detail: JSON.stringify(message),
  });
  document.dispatchEvent(event);
}

export async function getWordList() {
  const token = await getLoginToken();
  const userSetting = await getUserSettings(token);
  const r = await fetch(`${backendServerUrl}/word/bygroup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ groupID: userSetting.defaultGroupID }),
  });
  const j = await r.json();
  return j.data ? j.data.map((word) => word.en) : [];
}

async function getUserSettings(token) {
  const r = await fetch(backendServerUrl + "/usersetting", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const j = await r.json();
  return j.data;
}

function injectJsToShadowDom(jsFileUrl) {
  return new Promise((resolve) => {
    fetch(browser.runtime.getURL(jsFileUrl))
      .then((response) => response.text())
      .then((js) => {
        resolve(js);
      });
  });
}

export async function injectPhraseFloatingPanelToShadowDom() {
  if (checkIfPhraseFloatingPanelExist()) {
    return;
  }
  await createPhraseFloatingPanelToShadowDom();
}

export async function injectTranslationFloatingPanelToShadowDom() {
  if (checkIfTranslationFloatingPanelExist()) {
    return;
  }
  await createTranslationFloatingPanelToShadowDom();
}

function convertStringToLowerCaseAndRemoveSpecialCharacter(s) {
  return s
    .trim()
    .toLowerCase()
    .replaceAll(".", "")
    .replaceAll(",", "")
    .replaceAll('"', "")
    .replaceAll("(", "")
    .replaceAll(")", "")
    .replaceAll(":", "");
}
