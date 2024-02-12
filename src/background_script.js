function extensionIconClicked() {
  console.log("...");
}
browser.browserAction.onClicked.addListener(extensionIconClicked);
