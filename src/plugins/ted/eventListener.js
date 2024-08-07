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
