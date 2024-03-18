// content.js

import { listenEventFromBackground } from "./scripts/backgroundEventListener.js";
import { injectCSS } from "./scripts/ted/injectCSS.js";
import { injectScript } from "./scripts/ted/injectJS.js";
import { ted } from "./scripts/ted/ted.js";
import {
  customEventInContentScript,
  sendMessageFromContentScriptToInjectedScript,
} from "./scripts/ted/customEvent.js";

// 注册自定义事件
customEventInContentScript();
injectCSS();
injectScript();

// 监听来自background的消息
listenEventFromBackground();

// 执行ted函数

ted();
