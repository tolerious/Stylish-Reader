export function sendMessageFromPopupToBackgroundScript(
  type: string,
  message = {},
) {
  browser.runtime.sendMessage({ type, message })
}
