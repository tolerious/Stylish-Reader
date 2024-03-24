// content.js

import { listenEventFromBackground } from "./scripts/backgroundEventListener.js";
import { customEventInContentScript } from "./scripts/ted/customEvent.js";
import { injectCss } from "./scripts/ted/injectCSS.js";
import { injectScript } from "./scripts/ted/injectJS.js";
import { ted } from "./scripts/ted/ted.js";
import { sendMessage } from "./scripts/utils/sendMessageToBackground.js";

// 告诉background，我已经load了
sendMessage("contentLoaded", "content script loaded");
// 注册自定义事件
customEventInContentScript();
// 注入自定义css和js
injectCss();
injectScript();

// 监听来自background的消息
listenEventFromBackground();

// 执行ted函数

ted();
