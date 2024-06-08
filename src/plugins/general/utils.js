import { stylishReaderMainColor } from "../utils/constants";
import { logger } from "../utils/utils";
import {
  floatingIconSize,
  stylishReaderFloatingIconId,
  translationFloatingPanelId,
  translationPanelSize,
} from "./constants";

export function parseTextNode(node, indexList) {
  let t = convertNodeContentToStringList(node);
  indexList.forEach((i) => {
    t[i] = createCustomElement(t[i]).outerHTML;
  });
  let p = t.join(" ");

  return { node, p };
}

function createCustomElement(textContent) {
  const spanElement = document.createElement("span");
  spanElement.classList = ["clickable"];
  spanElement.style.color = "pink";
  spanElement.style.cursor = "pointer";
  spanElement.style.fontWeight = "bold";
  spanElement.innerHTML = textContent;
  return spanElement;
}

export function convertNodeContentToStringList(node) {
  return node.textContent.trim().split(" ");
}

export function findIndexOfTargetWordInOriginalStringList(
  originalStringList,
  targetStringList
) {
  const targetStringSet = new Set(targetStringList);
  const indexList = [];
  originalStringList.filter((s, index) => {
    if (targetStringSet.has(s.toLowerCase())) {
      indexList.push(index);
    }
  });
  return indexList;
}

export function customizeMouseDownEvent() {
  document.addEventListener("mousedown", function (event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const floatingPanelContainer = document.getElementById(
      translationFloatingPanelId
    );
    const floatingPanelContainerRect =
      floatingPanelContainer.getBoundingClientRect();
    if (
      mouseX >= floatingPanelContainerRect.left &&
      mouseX <= floatingPanelContainerRect.right &&
      mouseY >= floatingPanelContainerRect.top &&
      mouseY <= floatingPanelContainerRect.bottom
    ) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (
      [stylishReaderFloatingIconId, translationFloatingPanelId].includes(
        event.target.id
      )
    ) {
      showTranslationFloatingPanel();
      event.stopPropagation();
      event.preventDefault();
    }
  });
}

export function addSelectionChangeEvent() {
  document.addEventListener("selectionchange", function () {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    if (selection.toString().trim()) {
      const rect = range.getBoundingClientRect();
      let x = calculateSelectionPosition(rect, floatingIconSize).x;
      let y = calculateSelectionPosition(rect, floatingIconSize).y;
      // FIXME: 这里没有考虑到selection的位置可能会超出屏幕的情况
      showFloatingIcon(x, y);
      logger(selection.toString().trim());
    } else {
      hideFloatingIcon();
      hideTranslationFloatingPanel();
    }
  });
}

function calculateSelectionPosition(rect, baseElementSize) {
  return {
    x: (rect.right - rect.left) / 2 + rect.left - baseElementSize.width / 2,
    y: rect.top - baseElementSize.height,
  };
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

function createFloatingIcon(x, y) {
  const divElement = document.createElement("div");
  divElement.id = stylishReaderFloatingIconId;
  divElement.style.display = "block";
  divElement.style.position = "fixed";
  divElement.style.top = y + "px";
  divElement.style.left = x + "px";
  divElement.style.height = floatingIconSize.width + "px";
  divElement.style.width = floatingIconSize.height + "px";
  divElement.style.backgroundColor = stylishReaderMainColor;
  divElement.style.cursor = "pointer";
  divElement.addEventListener("click", function (event) {
    event.stopPropagation();
  });
  document.body.appendChild(divElement);
}

function showTranslationFloatingPanel() {
  const translationPanel = document.getElementById(translationFloatingPanelId);
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  let x = calculateSelectionPosition(rect, translationPanelSize).x;
  let y = calculateSelectionPosition(rect, translationPanelSize).y;
  if (translationPanel) {
    translationPanel.style.display = "block";
    translationPanel.style.top = y + "px";
    translationPanel.style.left = x + "px";
  } else {
    createTranslationFloatingPanel(x, y);
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
  // 这里的宽高，不应该固定，应该根据内容动态计算出来。
  divElement.style.height = translationPanelSize.height + "px";
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

export function getTranslationFromYouDao(textToBeTranslated) {
  // 使用 fetch 方法发送 GET 请求
  fetch(`https://dict.youdao.com/result?word=${textToBeTranslated}&lang=en`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.text();
    })
    .then((html) => {
      // 输出获取到的 HTML 内容
      const parse = new DOMParser();
      const doc = parse.parseFromString(html, "text/html");
      const dictBook = doc.querySelectorAll(".basic .word-exp");
      dictBook.forEach((book) => {
        const pos = book.querySelector(".pos");
        const translation = book.querySelector(".trans");
        logger(pos.textContent);
        logger(translation.textContent);
      });
      // 你可以在这里处理 HTML，比如插入到 DOM 中
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}
