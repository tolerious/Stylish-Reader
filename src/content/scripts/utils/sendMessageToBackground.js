export function sendMessage(type, message) {
  browser.runtime.sendMessage({ type, message });
}
