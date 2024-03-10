// Event Listener for the content script
export function eventListener() {
  browser.runtime.onMessage.addListener((message) => {
    switch (message.type) {
      case "show":
        break;
      case "saveArticleSuccess":
        console.log('...')
        break;
      case "urlChanged":
        // url发生变化了以后去执行逻辑
        if (message.url) {
          executedWhenPageLoad();
        }
        break;
      default:
        break;
    }
  });
}
