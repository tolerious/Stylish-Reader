// Entry point for this plugin.

import { createTedStylishReaderVideoToolbarIcon } from "./loopLogic";

export function initializeTed() {
  // 创建事件监听器(自定义事件，background 脚本的监听事件等)

  // 注入Vue界面需要的JS和CSS

  // 创建视频工具栏Stylish Reader图标
  createTedStylishReaderVideoToolbarIcon();
}
