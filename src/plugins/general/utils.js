export function parseTextNode(node, indexList) {
  console.log("==============================================");
  console.log("==============================================");
  console.log(node); // 对每个元素进行操作，例如打印元素
  //   console.log(`Text Content: ${node.textContent.trim()}`);
  //   console.log(`Node Name: ${node.nodeName}`);
  //   console.log(node.parentNode.innerHTML);
  node.parentElement.style.color = "red";
  console.log(indexList);
  console.log("==============================================");
  console.log("==============================================");
  let t = convertNodeContentToStringList(node);
  indexList.forEach((i) => {
    t[i] = `<span style="color:red">${t[i]}</span>`;
  });
  let p = t.join(" ");
  console.log(p);
  node.parentNode.innerHTML = p;
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
