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
