// Ted 插件的工具函数

import {
  popupVideoVuePageMountPointId,
  tedMediaControlBarStylishReaderIconId,
} from "./constants";

export function findMediaControlBar() {
  return new Promise((resolve) => {
    const elements = document.querySelectorAll("#media-control-bar");
    elements.forEach((element) => {
      if (!element.classList.contains("lg-tui:hidden")) {
        resolve(element);
      }
    });
  });
}

export function isStylishReaderMediaControlBarIconExist() {
  return document.getElementById(tedMediaControlBarStylishReaderIconId);
}

export function checkIfVideoPopupExist() {
  return document.getElementById(popupVideoVuePageMountPointId);
}
export function createVideoPagePopup() {
  const videoPagePopup = document.createElement("div");
  videoPagePopup.id = popupVideoVuePageMountPointId;
  videoPagePopup.style.position = "fixed";
  videoPagePopup.style.top = 0;
  videoPagePopup.style.left = 0;
  videoPagePopup.style.zIndex = "9999";
  videoPagePopup.style.width = "100%";
  videoPagePopup.style.height = "100%";
  document.body.appendChild(videoPagePopup);
}

export function showVideoPagePopup() {
  document.getElementById(popupVideoVuePageMountPointId).style.display =
    "block";
}

export function hideVideoPagePopup() {
  document.getElementById(popupVideoVuePageMountPointId).style.display = "none";
}

export function pauseTedOfficialWebsiteVideo() {
  const video = document.querySelector("video");
  if (video) {
    video.pause();
  }
}
