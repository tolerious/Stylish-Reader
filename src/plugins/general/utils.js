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

// TODO: 可以把创建这个panel的代码放到单独的仓库中进行管理
function createTranslationFloatingPanel(x, y) {
  const divElement = document.createElement("div");
  divElement.id = translationFloatingPanelId;
  divElement.style.display = "block";
  divElement.style.padding = "10px";
  divElement.style.boxSizing = "border-box";
  divElement.style.borderRadius = "3px";
  divElement.style.height = translationPanelSize.height + "px";
  divElement.style.width = translationPanelSize.width + "px";
  divElement.style.backgroundColor = "white";
  divElement.style.border = "1px solid " + stylishReaderMainColor;
  divElement.style.position = "fixed";
  divElement.style.top = y + "px";
  divElement.style.left = x + "px";
  document.body.appendChild(divElement);
}
