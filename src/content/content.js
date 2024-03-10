// content.js

import { eventListener } from "./scripts/eventListener.js";
import { findRealVideoBar } from "./scripts/ted/ted.js";

// 监听来自background的消息
eventListener();

findRealVideoBar();
