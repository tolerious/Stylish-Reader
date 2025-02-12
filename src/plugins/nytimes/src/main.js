export function initializeNYTimes() {
  console.log("NY Times plugin initialized");
  console.log("Title: ", getArticleTitle());
  console.log("Summary: ", getSummary());
  setTimeout(() => {
    console.log(getImageUrl());
  }, 1500);
  getContentNodes();
}

export function getArticleTitle() {
  const nodeList = document.querySelectorAll('[data-testid="headline"]');
  let targetNodeList = Array.from(nodeList);
  targetNodeList = targetNodeList.filter(
    (node) => node.clientHeight > 0 && node.clientWidth > 0
  );
  console.log(targetNodeList);
  console.log(targetNodeList.length);
  if (targetNodeList.length > 1) {
    alert("There are more than one title element in the page");
  } else {
    return targetNodeList[0].innerText;
  }
}

function getArticleNode() {
  const nodeList = document.querySelectorAll('[data-testid="headline"]');
  let targetNodeList = Array.from(nodeList);
  targetNodeList = targetNodeList.filter(
    (node) => node.clientHeight > 0 && node.clientWidth > 0
  );
  if (targetNodeList.length > 1) {
    alert("There are more than one title element in the page");
  } else {
    return targetNodeList[0];
  }
}

export function getSummary() {
  const summaryNode = document.getElementById("article-summary");
  if (summaryNode) {
    return summaryNode.innerText;
  }

  const node = getArticleNode();
  const nextSibling = node.nextElementSibling;
  return nextSibling.innerText;
}

export function getImageUrl() {
  const nodeList = document.querySelectorAll(
    '[data-testid="imageblock-wrapper"]'
  );
  const list = [];
  nodeList.forEach((node) => {
    const pic = node.querySelector("img");
    console.log(pic);
    const description = node.querySelector("figcaption");
    if (pic && description) {
      list.push({
        picUrl: pic.src,
        description: description.innerText,
      });
    }
  });
  return list;
}

export function getContentNodes() {
  const elements = document.querySelectorAll(
    '[data-testid^="companionColumn-"]'
  );
  console.log(elements);
}
