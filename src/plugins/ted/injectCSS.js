export function injectCSS() {
  injectPlyrCss();
  injectVideoVueCss();
}

function injectVideoVueCss() {
  fetch(
    browser.runtime.getURL("assets/css/stylish-reader-video-page-index.css")
  )
    .then((response) => response.text())
    .then((css) => injectInternalCSS(css))
    .catch((error) => console.error("Error injecting CSS:", error));
}

function injectPlyrCss() {
  fetch(browser.runtime.getURL("assets/css/plyr.css"))
    .then((response) => response.text())
    .then((css) => injectInternalCSS(css))
    .catch((error) => console.error("Error injecting CSS:", error));
}

function injectInternalCSS(css) {
  const style = document.createElement("style");
  style.setAttribute("type", "text/css");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}
