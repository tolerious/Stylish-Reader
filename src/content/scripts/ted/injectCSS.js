function injectInternalCSS(css) {
  const style = document.createElement("style");
  style.setAttribute("type", "text/css");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

export function injectCSS() {
  // 从文件中读取CSS并注入到页面中
  fetch(chrome.runtime.getURL("assets/css/plyr.css"))
    .then((response) => response.text())
    .then((css) => injectInternalCSS(css))
    .catch((error) => console.error("Error injecting CSS:", error));
}
