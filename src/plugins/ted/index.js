// Entry point for this plugin.

import { registerEventFromBackground } from "../utils/utils";
import { registerReceiveMessageFromVuePage } from "./eventListener";
import { injectCSS } from "./injectCSS";
import { injectScript, injectVideoVueScript } from "./injectJS";
import { createTedStylishReaderVideoToolbarIcon } from "./loopLogic";
import { sendMessageToBackground } from "./utils";

export async function initializeTed() {
  sendMessageToBackground("tedContentScriptLoaded", "content script loaded");

  // 创建事件监听器(自定义事件，background 脚本的监听事件等)
  registerReceiveMessageFromVuePage();
  registerEventFromBackground();

  // 注入Vue界面需要的JS和CSS
  injectCSS();
  injectScript();
  await injectVideoVueScript();

  // 创建视频工具栏Stylish Reader图标
  createTedStylishReaderVideoToolbarIcon();
}
