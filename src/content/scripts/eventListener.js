// Event Listener for the content script

export function eventListener() {
  browser.runtime.onMessage.addListener((message) => {
    switch (message.type) {
      case "show":
        break;
      case "saveArticleSuccess":
        break;
      case "urlChanged":
        // url发生变化了以后去执行逻辑
        ted();
        break;
      default:
        break;
    }
  });
}
