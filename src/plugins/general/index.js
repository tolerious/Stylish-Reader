import { logger } from "../utils/utils";
import {
  addSelectionChangeEvent,
  convertNodeContentToStringList,
  customizeMouseDownEvent,
  findIndexOfTargetWordInOriginalStringList,
  getTranslationFromYouDao,
  injectTranslationFloatingPanelCss,
  injectTranslationFloatingPanelVuePage,
  parseTextNode,
} from "./utils";

export async function initializeGeneralWebSite() {
  logger("initializeGeneralWebSite");
  addSelectionChangeEvent();
  customizeMouseDownEvent();
  injectTranslationFloatingPanelCss();
  await injectTranslationFloatingPanelVuePage();
  let walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  const targetWordList = ["nation", "boost", "for", "china"];
  let node = walker.currentNode;
  let index = 0;
  let map = new Map();
  while (node) {
    let indexList = findIndexOfTargetWordInOriginalStringList(
      convertNodeContentToStringList(node),
      targetWordList
    );
    if (
      !["SCRIPT", "HTML"].includes(node.parentNode.nodeName) &&
      node.textContent.trim() !== "" &&
      indexList.length > 0
    ) {
      let r = parseTextNode(node, indexList);
      map.set(index, r);
      index++;
    }
    node = walker.nextNode();
  }
  for (const [_, value] of map) {
    value.node.parentNode.innerHTML = value.p;
  }
  document.querySelectorAll(".clickable").forEach((e) => {
    e.addEventListener("click", (e) => {
      logger(e.target.textContent);
      getTranslationFromYouDao(e.target.textContent);
    });
  });
}
