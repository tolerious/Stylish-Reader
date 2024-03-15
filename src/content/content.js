// content.js

import { eventListener } from "./scripts/eventListener.js";
import { ted } from "./scripts/ted/ted.js";

// 监听来自background的消息
eventListener();

ted();

