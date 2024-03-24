import { hideVideoPagePopup } from "./videoPage";

export function customEventInContentScript() {
  document.addEventListener("fromInjectScript", (event) => {
    switch (event.detail.type) {
      case "close-popup":
        hideVideoPagePopup();
        break;
      default:
        break;
    }
  });
}

export function sendMessageFromContentScriptToInjectedScript(message) {
  const event = new CustomEvent("fromContentScript", { detail: message });
  document.dispatchEvent(event);
}
