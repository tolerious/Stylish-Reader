import { backendServerUrl } from "../entryPoint/constants";
import { getLoginToken } from "../entryPoint/utils/background.utils";
import { stylishReaderMainColor } from "../utils/constants";
import {
  clickableWordClassName,
  floatingIconSize,
  stylishReaderFloatingIconId,
  translationFloatingPanelId,
  translationPanelSize,
} from "./constants";

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
    if (node.textContent.trim().toLocaleLowerCase() === word.trim()) {
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
  const splitedTextContentStringList = textContent.split(" ");
  const indexList = [];
  splitedTextContentStringList.filter((s, index) => {
    /**
     *  FIXME: 这里没有处理的一点是如果是被特殊服务包裹起来的字符，
     * 例如"hello, world",这里world"会被当成一个单词，所以使用set中的has
     * 函数就无法判断出来，这里需要单独处理下这种情况
     *
     * */
    if (
      targetWordSet.has(
        s
          .toLowerCase()
          .replace(".", "")
          .replace(",", "")
          .replace('"', "")
          .replace("(", "")
          .replace(")", "")
      )
    ) {
      indexList.push(index);
    }
  });

  const currentTextNodeParentNode = textNode.parentNode;
  const newNodeList = [];
  // 遍历indexList，重新构造#text节点
  if (indexList.length > 0) {
    splitedTextContentStringList.forEach((s, index) => {
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
  customizeMouseDownEvent();
  listenFromFloatingPanelEvent();
}

/**
 * 监听mousedown事件，当用户点击悬浮图标时，显示翻译面板
 */
function customizeMouseDownEvent() {
  document.addEventListener("mousedown", async function (event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const floatingPanelContainer = document.getElementById(
      translationFloatingPanelId
    );
    const floatingPanelContainerRect =
      floatingPanelContainer.getBoundingClientRect();

    // 在floatingPanel范围内
    if (
      mouseX >= floatingPanelContainerRect.left &&
      mouseX <= floatingPanelContainerRect.right &&
      mouseY >= floatingPanelContainerRect.top &&
      mouseY <= floatingPanelContainerRect.bottom
    ) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }

    // 点击的是floatingIcon
    if ([stylishReaderFloatingIconId].includes(event.target.id)) {
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
  document.addEventListener("selectionchange", function () {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    if (selection.toString().trim()) {
      const rect = range.getBoundingClientRect();
      let x = calculateSelectionPosition(rect, floatingIconSize).x;
      let y = calculateSelectionPosition(rect, floatingIconSize).y;
      // FIXME: 这里没有考虑到selection的位置可能会超出屏幕的情况
      showFloatingIcon(x, y);
      sendMessageFromGeneralScriptToFloatingPanel({
        type: "search-word",
        word: selection.toString().trim(),
      });
    }
  });
}

function calculateSelectionPosition(rect, baseElementSize) {
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
  const floatingPanel = document.getElementById(translationFloatingPanelId);
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
  const floatingPanel = document.getElementById(translationFloatingPanelId);
  floatingPanel.style.display = "block";
  floatingPanel.style.opacity = 0;
  floatingPanel.style.top = 0;
  floatingPanel.style.left = 0;
}

// source=selection,说明点击的是floating icon
export function showTranslationFloatingPanel(
  source = "selection",
  position = { x: 0, y: 0 }
) {
  const translationPanel = document.getElementById(translationFloatingPanelId);
  translationPanel.style.display = "block";
  if (source === "selection") {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    showTranslationFloatingPanelTemporary();
    let x = calculateFloatingPanelPosition(range).x;
    let y = calculateFloatingPanelPosition(range).y;
    translationPanel.style.top = y + "px";
    translationPanel.style.left = x + "px";
    translationPanel.style.opacity = 1;
  } else {
    translationPanel.style.top = position.y + "px";
    translationPanel.style.left = position.x + "px";
    translationPanel.style.opacity = 1;
  }
}

function hideTranslationFloatingPanel() {
  const translationPanel = document.getElementById(translationFloatingPanelId);
  if (translationPanel) {
    translationPanel.style.display = "none";
  }
}

function createTranslationFloatingPanel(x = 0, y = 0) {
  const divElement = document.createElement("div");
  divElement.id = translationFloatingPanelId;
  divElement.style.display = "none";
  divElement.style.boxSizing = "border-box";
  divElement.style.borderRadius = "3px";
  divElement.style.width = translationPanelSize.width + "px";
  divElement.style.backgroundColor = "white";
  divElement.style.boxShadow = "0 0 15px 5px grey";
  divElement.style.position = "fixed";
  divElement.style.top = y + "px";
  divElement.style.left = x + "px";
  divElement.style.zIndex = "9999";
  document.body.appendChild(divElement);
}

function checkIfTranslationFloatingPanelExist() {
  return document.getElementById(translationFloatingPanelId);
}

function injectInternalCSS(css) {
  const style = document.createElement("style");
  style.setAttribute("type", "text/css");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

export function injectTranslationFloatingPanelCss() {
  fetch(
    browser.runtime.getURL(
      "assets/css/stylish-reader-translation-panel-index.css"
    )
  )
    .then((response) => response.text())
    .then((css) => injectInternalCSS(css))
    .catch((error) => console.error("Error injecting CSS:", error));
}

export function injectTranslationFloatingPanelVuePage() {
  if (checkIfTranslationFloatingPanelExist()) {
    return;
  }
  createTranslationFloatingPanel();
}

export function listenFromFloatingPanelEvent() {
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

export function checkAuthorize() {
  sendMessageToBackgroundScript("check-authorize", "");
}

function sendMessageToBackgroundScript(type, message) {
  browser.runtime.sendMessage({ type, message });
}
