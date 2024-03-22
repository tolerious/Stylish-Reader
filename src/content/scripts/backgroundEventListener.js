// Event Listener for the content script

import { fetchTranscript } from "./ted/fetchTranscript";
import { ted } from "./ted/ted";

export function listenEventFromBackground() {
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
      case "intercept":
        fetchTranscript(message.url);
        break;
      default:
        break;
    }
  });
}
