import {
  convertNodeContentToStringList,
  findIndexOfTargetWordInOriginalStringList,
  parseTextNode,
} from "./utils";

export function initializeGeneralWebSite() {
  console.log("initializeGeneralWebSite");
  let walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  const targetWordList = ["nation"];
  let node = walker.currentNode;
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
      parseTextNode(node, indexList);
    }
    console.log("...");
    node = walker.nextNode();
  }
}
