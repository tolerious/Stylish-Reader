import { getLoginToken } from "../../background/background.utils";
import { backendServerUrl } from "../entryPoint/constants";
import { stylishReaderMainColor } from "../utils/constants";
import {
  checkUserLoginStatus,
  getCurrentPageUrl,
  sendMessageFromContentScriptToBackgroundScript,
} from "../utils/utils";
import {
  clickableWordClassName,
  floatingIconSize,
  floatingPanelAudioTagId,
  phraseFloatingIconSize,
  phraseFloatingPanelId,
  phraseFloatingPanelShadowRootId,
  phraseFloatingPanelSize,
  stylishReaderFloatingIconId,
  translationFloatingPanelId,
  translationFloatingPanelShadowRootId,
  translationPanelSize,
  translationParagraphClassName,
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
    /**
     * 找到当前node的父亲元素并排除script,HTML标签，这里排除HTML标签是因为HTML会包含所有文档元素，这不是我们想要的
     * 且排除node的文本内容是空元素的
     *  */
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

  // 为所有高亮单词添加点击事件
  document.querySelectorAll(`.${clickableWordClassName}`).forEach((e) => {
    const newElement = e.cloneNode(true);
    e.parentNode.replaceChild(newElement, e);
    newElement.addEventListener("click", (e1) => {
      hideFloatingIcon();
      sendMessageFromGeneralScriptToFloatingPanel({
        type: "search-word",
        word: e1.target.textContent,
      });

      sendMessageFromContentScriptToBackgroundScript("search-word", {
        word: e1.target.textContent,
      });
      sendMessageFromContentScriptToBackgroundScript(
        "play-audio-from-floating-panel",
        e1.target.textContent.toString().trim()
      );
    });
  });
}

let isTranslationParagraphOn = false;
let translationParagraphList = [];
export async function addTranslationParagraph() {
  if (!isTranslationParagraphOn) {
    const paragraphNodeList = document.querySelectorAll("p");
    const headerNodeList = document.querySelectorAll("h1,h2,h3");
    const nodeList = [...headerNodeList, ...paragraphNodeList];
    for (let index = 0; index < nodeList.length; index++) {
      let node = nodeList[index];
      const parent = node.parentNode;
      const newNode = document.createElement("span");
      // 调翻译API
      translationParagraphList.push({
        content: node.textContent,
        classId: translationParagraphClassName + `-${index}`,
      });
      sendMessageFromContentScriptToBackgroundScript(
        "translate-paragraph-from-content",
        {
          content: node.textContent,
          classId: translationParagraphClassName + `-${index}`,
        }
      );
      newNode.textContent = node.textContent;
      newNode.classList.add(translationParagraphClassName + `-${index}`);
      newNode.classList.add(translationParagraphClassName);
      newNode.style.color = "oklch(0.704 0.04 256.788)";
      if (parent.childNodes.length > 1) {
        const sibling = node.nextSibling;
        parent.insertBefore(newNode, sibling);
      } else {
        parent.appendChild(newNode);
      }
      await waitForSeconds(1000);
    }
    isTranslationParagraphOn = true;
  } else {
    const nodeList = document.querySelectorAll(
      `.${translationParagraphClassName}`
    );
    nodeList.forEach((node) => {
      node.remove();
    });
    isTranslationParagraphOn = false;
  }
}

export function addTranslationContentBelowParagraph(
  classId,
  translationContent
) {
  const domElement = document.querySelector(`.${classId}`);
  domElement.textContent = translationContent;
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
  const textContent = textNode.textContent;
  const targetWordSet = new Set(targetWordList);
  const splittedTextContentStringList = textContent.split(" ");
  // 存放的是目标单词在splittedTextContentStringList中的索引
  const indexList = [];
  // 这个splittedTextContentStringList里面可能会包含类似如下的字符串
  // "highlighting,\nindentation,",没有把这个字符串正确的拆分成两个字符串，所以在处理前
  // 需要进一步遍历splittedTextContentStringList，构建新的数组把这种字符串拆分成两个字符串
  let latestSplittedTextContentStringList = [];
  splittedTextContentStringList.forEach((item) => {
    if (item.includes("\n") || item.includes("\t")) {
      const tempList = splitWithWhitespace(item);
      tempList.forEach((s) => {
        latestSplittedTextContentStringList.push(s);
      });
    } else {
      latestSplittedTextContentStringList.push(item);
    }
  });
  latestSplittedTextContentStringList.filter((s, index) => {
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
    latestSplittedTextContentStringList.forEach((s, index) => {
      // 这段文本不包含目标单词
      const stt = s + " ";
      if (indexList.indexOf(index) > -1) {
        // const spanElement = document.createElement("span");
        const spanElement = document.createElement("stylish-reader-span");
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

    const temporaryCustomSpanElement = document.createElement(
      "stylish-reader-span"
    );
    newNodeList.forEach((node) => {
      temporaryCustomSpanElement.append(node);
    });
    if (!currentTextNodeParentNode.classList.contains(clickableWordClassName)) {
      currentTextNodeParentNode.replaceChild(
        temporaryCustomSpanElement,
        textNode
      );
    }
  }
}

function splitWithWhitespace(str) {
  return str
    .split(/(\n|\t|\s+)/)
    .filter((item) => item.trim() || item === "\n" || item === "\t");
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
      sendMessageFromContentScriptToBackgroundScript("search-word", {
        word: currentSelectionContent.toString().trim(),
      });
      const ww = currentSelectionContent.toString().trim();
      if (ww.split(" ").length < 2) {
        sendMessageFromContentScriptToBackgroundScript(
          "play-audio-from-floating-panel",
          ww
        );
      }

      sendMessageFromGeneralScriptToFloatingPanel({
        type: "search-word",
        word: currentSelectionContent.toString().trim(),
      });

      showTranslationFloatingPanel();

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
      }, 500);
      return;
    }

    // 如果点击在别处，隐藏floatingPanel和floatingIcon

    hideFloatingIcon();
    hideTranslationFloatingPanel();
  });
}

export function listenEventFromOfficialWebsite() {
  document.addEventListener(
    "officialWebsiteYouTubeVideoPageReady",
    async function () {
      // TODO: 这里需要等待页面加载完成，然后再去遍历dom节点，生成自定义元素，临时解决方案是等待2.5s
      setTimeout(async () => {
        goThroughDomAndGenerateCustomElement(await getWordList());
      }, 2500);
      console.log("go through dom and generate custom element");
    }
  );
}

/**
 * 监听selectionchange事件，当用户选中文本时，显示悬浮图标
 */
function addSelectionChangeEvent() {
  document.addEventListener("selectionchange", async function () {
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
  div.style.zIndex = 9999;
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
  floatingPanel.style.zIndex = 99;
}

// source=selection,说明点击的是floating icon
export async function showTranslationFloatingPanel(
  source = "selection",
  position = { x: 0, y: 0 }
) {
  await createAndSetDefaultGroupForCurrentPage();
  await checkUserLoginStatus();

  const translationPanel = document.getElementById(
    translationFloatingPanelShadowRootId
  );
  translationPanel.style.display = "block";
  if (source === "selection") {
    let x = gSelectionPosition.x;
    let y = gSelectionPosition.y;
    translationPanel.style.top = y + "px";
    translationPanel.style.left = x + "px";
    translationPanel.style.opacity = 1;
    translationPanel.style.boxShadow = "0 0 15px 5px grey";
    translationPanel.style.zIndex = 9999;
    translationPanel.style.width = translationPanelSize.width + "px";
  } else {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    position.x = calculateFloatingPanelPosition(range).x;
    position.y = calculateFloatingPanelPosition(range).y;

    translationPanel.style.top = position.y + "px";
    translationPanel.style.left = position.x + "px";
    translationPanel.style.opacity = 1;
    translationPanel.style.zIndex = 9999;
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

  sendMessageFromGeneralScriptToPhraseFloatingPanelShadowDom({
    type: "token",
    message: await getLoginToken(),
  });
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
    "assets/css/translation-panel-index.css"
  );
  styleElement.appendChild(document.createTextNode(cssCode));

  // 在shadow dom中添加挂载点
  shadow.appendChild(mountPoint);

  // // 在shadow dom中添加脚本挂载点
  // const jsCode = await injectJsToShadowDom("assets/js/translation-panel.js");
  // vueScript.textContent = jsCode;
  // shadow.appendChild(vueScript);

  const script = document.createElement("script");
  script.src = browser.runtime.getURL("assets/js/translation-panel.js");
  shadow.appendChild(script);

  // 在shadow dom中添加样式挂载点
  shadow.appendChild(styleElement);

  // 添加到页面上
  document.body.appendChild(shadowRoot);

  // eval(vueScript.textContent);
  return Promise.resolve();
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

// 接收来自floating panel的事件
function listenEventFromFloatingPanelEvent() {
  document.addEventListener("floatingPanelEvent", async (event) => {
    const detail = JSON.parse(event.detail);
    switch (detail.type) {
      case "get-translation-done":
        break;
      case "delete-word-success":
        removeUnMarkedWord(detail.message);

        break;
      case "delete-word":
        sendMessageFromContentScriptToBackgroundScript(
          "delete-word",
          detail.message
        );
        break;
      case "save-word":
        goThroughDomAndGenerateCustomElement(await getWordList());
        break;
      case "go-through-content":
        goThroughDomAndGenerateCustomElement(await getWordList());
        break;
      case "play-audio-from-floating-panel":
        /**
         * detail对象结构为: {type:'',url:'',method:'',body:''}
         */
        sendMessageFromContentScriptToBackgroundScript(
          "play-audio-from-floating-panel",
          detail.message
        );
        break;
      case "favour-word":
        sendMessageFromContentScriptToBackgroundScript(
          "favour-word",
          detail.message
        );
        break;
      default:
        break;
    }
  });
}

export function sendMessageFromGeneralScriptToFloatingPanel(message) {
  const event = new CustomEvent("generalScriptEvent", {
    detail: JSON.stringify(message),
    bubbles: true,
    composed: true,
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
  const r = await fetch(`${backendServerUrl}/word/whole`, {
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
    .replaceAll("!", "")
    .replaceAll("'", "")
    .replaceAll(":", "")
    .replaceAll("’", "")
    .replaceAll("'", "")
    .replaceAll("?", "");
}

/**
 * 为当前页面创建group，如果词组已经存在，则不创建，如果词组不存在，则创建。
 * 并且设置默认的group为当前页面的group
 */
export async function createAndSetDefaultGroupForCurrentPage() {
  const g = await createGroup();

  sendMessageFromGeneralScriptToPhraseFloatingPanelShadowDom({
    type: "group-id",
    groupId: g.data._id,
  });
  await setDefaultGroup(g.data._id);
  return g;
}

async function setDefaultGroup(groupId) {
  await fetchWrapper(`${backendServerUrl}/usersetting`, "POST", {
    defaultGroupID: groupId,
  });
}

async function createGroup() {
  const g = await fetchWrapper(`${backendServerUrl}/wordgroup/`, "POST", {
    name: document.title,
    createdSource: "extension",
    originalPageUrl: getCurrentPageUrl(),
  });
  return g;
}

async function fetchWrapper(url, method = "GET", body = {}) {
  const token = await getLoginToken();
  const requestOptions = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  };
  return new Promise(async (resolve, reject) => {
    const r = await fetch(url, requestOptions);
    if (!r.ok) {
      reject(-1);
    }
    const j = await r.json();
    resolve(j);
  });
}

export function createAudioTagForFloatingPanel() {
  const element = document.getElementById(floatingPanelAudioTagId);
  if (!element) {
    // 创建 audio 元素
    const audio = document.createElement("audio");

    // 设置初始属性
    audio.controls = true; // 显示播放控件
    audio.autoplay = false; // 不自动播放
    audio.preload = "auto"; // 预加载音频
    audio.style.display = "none"; // 不显示
    audio.id = floatingPanelAudioTagId;

    // 将 audio 元素添加到页面中
    document.body.appendChild(audio);
  }
}

export function playAudioFromFloatingPanel(response) {
  const audio = document.getElementById(floatingPanelAudioTagId);
  const u = URL.createObjectURL(response);
  audio.src = u;
  audio.play();
}

export function waitForSeconds(number) {
  return new Promise((resolve) => setTimeout(resolve, number));
}
