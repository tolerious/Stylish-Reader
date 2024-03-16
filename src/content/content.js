// content.js

import { listenEventFromBackground } from "./scripts/backgroundEventListener.js";
import { ted } from "./scripts/ted/ted.js";

// 监听来自background的消息
listenEventFromBackground();

// 执行ted函数

ted();
