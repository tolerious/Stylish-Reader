export function initializeGuardian() {
  console.log("The guardian plugin initialized");
  console.log("HeadLine: ", getHeadLine());
  console.log("Stand First: ", getStandFirst());
  console.log("Content: ", getContent());

  console.log("Is ready to read?", isReadyToRead());
}

let isHeadLineReady = false;
let isStandFirstReady = false;
let isContentReady = false;

function isReadyToRead() {
  return isHeadLineReady && isStandFirstReady && isContentReady;
}

function getHeadLineFromHeader() {
  const headerNodeList = document.querySelectorAll("header");
  // 筛选不符合条件的header，筛选结束后，理论上应该只有一个header了
  let headerNodeArray = Array.from(headerNodeList);
  headerNodeArray = headerNodeArray.filter((node) => {
    return !node.hasAttribute("data-component");
  });
  // 筛选header的后代节点，筛选中真正的headline，header的后代节点除了headline以外，还有别的元素，例如左侧的旁白
  let headerNodeChildrenArray = Array.from(headerNodeArray[0].children);
  headerNodeChildrenArray = headerNodeChildrenArray.filter((node) => {
    return node.querySelectorAll("figure").length === 0;
  });

  // 这里经过筛选后，必须只剩下一个孩子元素了，如果剩下多个，或者一个都没有，那么就是出错了
  const headerNodeChild = headerNodeChildrenArray[0];

  let headerNodeChildChildren = Array.from(headerNodeChild.children);

  headerNodeChildChildren = headerNodeChildChildren.filter((child) => {
    return child.querySelectorAll("figcaption").length === 0;
  });

  // 筛选完，应该只剩下一个孩子节点
  const headlineNode = headerNodeChildChildren[0];

  return headlineNode.innerText;
}

function getHeadLine() {
  const nodeList = document.querySelectorAll('[data-gu-name="headline"]');
  if (nodeList.length > 1) {
    console.log("There are more than one headline");
  } else if (nodeList.length < 1) {
    console.log("There is no headline");
  } else if (nodeList[0].innerText === "") {
    const tt = getHeadLineFromHeader();
    if (tt) {
      isHeadLineReady = true;
      return getHeadLineFromHeader();
    } else {
      return "";
    }
  } else {
    isHeadLineReady = true;
    return nodeList[0].innerText;
  }
}

function getStandFirst() {
  const nodeList = document.querySelectorAll('[data-gu-name="standfirst"]');
  if (nodeList.length > 1) {
    console.log("There are more than one standfirst");
  } else if (nodeList.length < 1) {
    console.log("There is no standfirst");
  } else {
    const tl = nodeList[0].querySelectorAll("p");
    if (tl.length > 0) {
      isStandFirstReady = true;
      return Array.from(tl)
        .map((p) => p.innerText)
        .join("\n");
    } else {
      isStandFirstReady = false;
      return "";
    }
  }
}

function getContent() {
  const nodeList = document.querySelectorAll('[data-gu-name="body"]');
  if (nodeList.length > 1) {
    console.log("There are more than one body");
  } else if (nodeList.length < 1) {
    console.log("There is no body");
  } else {
    const mainContent = nodeList[0].querySelector("#maincontent");
    if (mainContent) {
      isContentReady = true;
      return mainContent.innerText;
    } else {
      isContentReady = false;
      return "";
    }
  }
}
