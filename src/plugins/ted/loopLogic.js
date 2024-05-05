/**
 * 这个脚本就是为了检查页面上的 @tedMediaControlBarStylishReaderIconId 元素是否是唯一存在的。
 * 如果不存在就在工具栏上创建一个，但是必须保证的是当前页面只有一个这样的元素。
 */

import {
  createStylishIconElement,
  getPreparedDataForVuePage,
  logger,
} from "../utils/utils";
import { tedMediaControlBarStylishReaderIconId } from "./constants";
import { sendMessageFromContentScriptToVuePage } from "./eventListener";
import {
  findMediaControlBar,
  isStylishReaderMediaControlBarIconExist,
  pauseTedOfficialWebsiteVideo,
  showVideoPagePopup,
} from "./utils";

export function createTedStylishReaderVideoToolbarIcon() {
  // 由于用户可能使用了一些第三方插件影响了页面结构，所以这里无限循环来确保
  // 创建元素成功

  setInterval(async () => {
    // 找到真正的 media control bar
    const mediaControlBar = await findMediaControlBar();
    if (!isStylishReaderMediaControlBarIconExist()) {
      const iconElement = createStylishIconElement(
        tedMediaControlBarStylishReaderIconId
      );
      //  #region 添加点击事件处理函数
      //   添加点击事件处理函数
      iconElement.addEventListener("click", async function () {
        logger("Show Stylish Reader Video Page.");
        sendMessageFromContentScriptToVuePage({
          type: "cleanup",
          data: "",
        });
        const preparedData = await getPreparedDataForVuePage();
        if (!preparedData.sharedLink) {
          alert("Video link is not available, please try another video.");
          return;
        }

        pauseTedOfficialWebsiteVideo();
        showVideoPagePopup();
        setTimeout(() => {
          sendMessageFromContentScriptToVuePage({
            type: "prepare",
            data: preparedData,
          });
        }, 1000);
      });
      //  #endregion
      //   添加到工具栏上
      mediaControlBar.appendChild(iconElement);
    }
  }, 300);
}
