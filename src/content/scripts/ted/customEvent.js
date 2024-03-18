export function customEventInContentScript() {
  document.addEventListener("fromInjectScript", (event) => {
    console.log("Received message from injected script:", event.detail);
  });
}

export function sendMessageFromContentScriptToInjectedScript(message) {
  const event = new CustomEvent("fromContentScript", { detail: message });
  document.dispatchEvent(event);
}
