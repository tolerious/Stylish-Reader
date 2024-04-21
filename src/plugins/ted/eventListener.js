import { hideVideoPagePopup } from "./utils";

export function registerReceiveMessageFromVuePage() {
  document.addEventListener("fromInjectScript", (event) => {
    const detail = JSON.parse(event.detail);
    switch (detail.type) {
      case "close-popup":
        hideVideoPagePopup();
        break;
      default:
        break;
    }
  });
}

export function sendMessageFromContentScriptToVuePage(message) {
  const event = new CustomEvent("fromContentScript", {
    detail: JSON.stringify(message),
  });
  document.dispatchEvent(event);
}

export function registerEventFromBackground() {
  browser.runtime.onMessage.addListener((message) => {
    switch (message.type) {
      case "show":
        break;
      case "saveArticleSuccess":
        break;
      case "urlChanged":
        // url发生变化了以后去执行逻辑
        console.log("background script detect url changed.");
        break;
      case "intercept":
        break;
      default:
        break;
    }
  });
}
