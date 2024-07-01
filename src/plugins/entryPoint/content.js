import { initializeBBC } from "../bbcLearningEnglish";
import { initializeGeneralWebSite } from "../general";
import { initializeTed } from "../ted";
import { initializeYoutube } from "../youtube";

// 所有的网站上都执行的插件
initializeGeneralWebSite();

// 插件 Ted
if (window.location.hostname.includes("ted.com")) {
  initializeTed();
}

// 插件 BBC Learning English
if (window.location.href.includes("bbc.co.uk/learningenglish")) {
  initializeBBC();
}

// 插件 Youtube
if (window.location.hostname.includes("youtube.com")) {
  initializeYoutube();
}
