function extensionIconClicked() {
  browser.tabs.executeScript({
    code: 'alert("Extension icon clicked!");console.error("error...");',
  });
}
browser.browserAction.onClicked.addListener(extensionIconClicked);
