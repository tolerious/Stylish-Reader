import { logger } from "../utils/utils";
import {
  convertNodeContentToStringList,
  findIndexOfTargetWordInOriginalStringList,
  parseTextNode,
} from "./utils";

export function initializeGeneralWebSite() {
  logger("initializeGeneralWebSite");
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
      console.log(e.target.textContent);
    });
  });
}
