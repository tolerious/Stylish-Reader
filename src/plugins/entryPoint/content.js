import { initializeNYTimes } from "nytimes";
import { initializeBBC } from "../bbcLearningEnglish";
import { initializeGeneralWebSite } from "../general";
import { initializeGuardian } from "../guardian/src/main";
import { initializeTed } from "../ted";
import {
  checkUserLoginStatus,
  isBBCLearningEnglishWebSite,
  isGuardianWebSite,
  isNYTimesWebSite,
  isTedWebSite,
  isYouTubeWebSite,
} from "../utils/utils";
import { initializeYoutube } from "../youtube";

// 判断用户是否登录
checkUserLoginStatus().then(() => {
  // 所有的网站上都执行的插件
  initializeGeneralWebSite();

  // 插件 Ted
  if (isTedWebSite()) {
    initializeTed();
  }

  // 插件 BBC Learning English
  if (isBBCLearningEnglishWebSite()) {
    initializeBBC();
  }

  // 插件 Youtube
  if (isYouTubeWebSite()) {
    initializeYoutube();
  }

  // 插件 NYTimes
  if (isNYTimesWebSite()) {
    initializeNYTimes();
  }

  // 插件 The Guardian
  if (isGuardianWebSite()) {
    initializeGuardian();
  }
});
