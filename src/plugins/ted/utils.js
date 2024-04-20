// Ted 插件的工具函数

import { tedMediaControlBarStylishReaderIconId } from "./constants";

export function findMediaControlBar() {
  return new Promise((resolve) => {
    const elements = document.querySelectorAll("#media-control-bar");
    elements.forEach((element) => {
      if (!element.classList.contains("lg-tui:hidden")) {
        console.log(element);
        resolve(element);
      }
    });
  });
}

export function isStylishReaderMediaControlBarIconExist() {
  return document.getElementById(tedMediaControlBarStylishReaderIconId);
}
