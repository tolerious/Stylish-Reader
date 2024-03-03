// Put all the javascript code here, that you want to execute after page load.

let supportedDomains = ["www.ted.com"];

// 判断是否已经添加了stylish-reader-icon
let hasAppendedStylishIcon = false;

// 监听来自background的消息
browser.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case "show":
      break;
    case "saveArticleSuccess":
      if (checkStylishBarIsExist()) {
        removeStylishBar();
      }
      createBar();
      createTopBarScript();
      break;
    case "urlChanged":
      // url发生变化了以后去执行逻辑
      if (message.url) {
        executedWhenPageLoad();
      }
      break;
    default:
      break;
  }
});

// 检查stylish-reader-bar是否存在
function checkStylishBarIsExist() {
  const stylishReaderBar = document.getElementById("stylish-reader-bar");
  return stylishReaderBar !== null;
}

// 移除stylish-reader-bar
function removeStylishBar() {
  let stylishReaderBar = document.getElementById("stylish-reader-bar");
  let parentElement = stylishReaderBar.parentNode;
  parentElement.removeChild(stylishReaderBar);
}

// 创建收藏文章时页面顶部的工具栏
function createBar() {
  // 创建stylish-reader-bar元素
  let stylishReaderBar = document.createElement("div");
  stylishReaderBar.id = "stylish-reader-bar";
  stylishReaderBar.style.cssText =
    "height: 30px; background-color: #f8f9fa; position: fixed; z-index: 99999; width: 100%; border-bottom: 1px solid grey; top: 0; padding: 0 10px; box-sizing: border-box; display: grid; grid-template-columns: 250px minmax(0, 1fr) 50px; grid-template-rows: 1fr;";

  // 创建左侧内容
  let leftContent = document.createElement("div");
  leftContent.style.cssText =
    "cursor: pointer; display: flex; flex-direction: row; justify-content: flex-start; align-items: center; height: 100%;";

  let leftContentImage = document.createElement("img");
  leftContentImage.style.height = "25px";
  leftContentImage.src = browser.runtime.getURL("assets/stylish-reader-48.png");
  leftContentImage.alt = "";

  let leftContentSpan = document.createElement("span");
  leftContentSpan.style.cssText =
    "margin: 0 3px; font-weight: bold; text-decoration: underline;";
  leftContentSpan.textContent = "Open in Stylish Reader";

  let leftContentArrow = document.createElement("img");
  leftContentArrow.style.height = "10px";
  leftContentArrow.src = browser.runtime.getURL("assets/right-arrow.png");
  leftContentArrow.alt = "";

  leftContent.appendChild(leftContentImage);
  leftContent.appendChild(leftContentSpan);
  leftContent.appendChild(leftContentArrow);

  // 创建中间内容
  let middleContent = document.createElement("div");
  middleContent.style.lineHeight = "30px";
  let countdownElement = document.createElement("div");
  countdownElement.id = "stylish-reader-bar-message";
  middleContent.appendChild(countdownElement);

  // 创建右侧内容
  let rightContent = document.createElement("div");
  rightContent.style.cssText =
    "display: flex; flex-direction: row; align-items: center; justify-content: flex-end; cursor: pointer;";

  let rightContentImage = document.createElement("img");
  rightContentImage.id = "stylish-reader-bar-cancel-button";
  rightContentImage.style.height = "20px";
  rightContentImage.src = browser.runtime.getURL("assets/cancel-button.png");
  rightContentImage.alt = "";

  rightContent.appendChild(rightContentImage);

  stylishReaderBar.appendChild(leftContent);
  stylishReaderBar.appendChild(middleContent);
  stylishReaderBar.appendChild(rightContent);

  document.body.appendChild(stylishReaderBar);
}

// 创建收藏文件时页面顶部工具栏的脚本
function createTopBarScript() {
  // 创建一个 <script> 元素
  let scriptElement = document.createElement("script");

  // 设置脚本内容
  let scriptContent = `
  let cancelButton = document.getElementById("stylish-reader-bar-cancel-button");
  cancelButton.addEventListener("click", function () {
    let stylishReaderBar = document.getElementById("stylish-reader-bar");
    let parentElement = stylishReaderBar.parentNode;
    parentElement.removeChild(stylishReaderBar);
  });

  let countdownElement = document.getElementById("stylish-reader-bar-message");
  let totalTimeInSeconds = 5;

  function startCountdown() {
    let currentTime = totalTimeInSeconds;

    function updateCountdown() {
      countdownElement.textContent =
        "Article added, this message will disappear in " +
        currentTime +
        " seconds.";

      if (currentTime <= 0) {
        clearInterval(intervalId);
        countdownElement.textContent = "倒计时结束!";
        countdownElement.style.display = "none";
      } else {
        currentTime--;
      }
    }

    updateCountdown();
    let intervalId = setInterval(updateCountdown, 1000);
  }

  startCountdown();
`;

  // 将脚本内容设置为 <script> 元素的文本内容
  scriptElement.text = scriptContent;

  // 将 <script> 元素插入到页面的 <head> 元素中
  document.head.appendChild(scriptElement);
}

// 获取当前网页的domain
function getCurrentDomain() {
  let domain = "";
  let url = window.location.href;
  if (url.indexOf("://") > -1) {
    domain = url.split("/")[2];
  } else {
    domain = url.split("/")[0];
  }
  domain = domain.split(":")[0];
  return domain;
}

function executedWhenPageLoad() {
  // 这里是处理在访问受支持的视频网站的时候，向video元素添加Stylish Reader按钮
  if (supportedDomains.includes(getCurrentDomain())) {
    console.log("Supported domain");
    removeAllStylishReaderButtonOnTed();
    createStylishReaderButtonOnTed();
  }
  browser.runtime.sendMessage({ type: "page-load" });
}

executedWhenPageLoad();
// ----------------- TED website related -----------------
function getReadTranscriptButtonAndClick() {
  const divElement = document.querySelector(
    '[data-testid="paragraphs-container"]'
  );
  if (divElement !== null) {
    return;
  }
  // 获取所有按钮元素
  const buttons = document.querySelectorAll("button");

  // 遍历每个按钮
  buttons.forEach(function (button) {
    // 检查按钮文本是否为 "Read transcript"
    if (button.textContent === "Read transcript") {
      // 找到了匹配的按钮，可以进行你想要的操作
      button.click();
      // 如果只需要第一个匹配的按钮，可以在这里返回或者进行其他操作
    }
  });
}
function removeAllStylishReaderButtonOnTed() {
  // 找到所有类名为"node"的元素
  const elements = document.querySelectorAll(".stylish-reader-button");

  // 遍历这些元素
  elements.forEach(function (element) {
    // 从其父元素中删除当前元素
    element.parentNode.removeChild(element);
  });
}
function addVideoEventListener() {
  const video = document.querySelector("video");
  video.addEventListener("timeupdate", function (e) {
    let input = document.querySelector(".video-player-range-input");
    if (input !== null) {
      // 真正的视频开始播放了
      // console.log(`现在视频播放到了: ${input.value} 秒`);
    } else {
      // console.log("广告时间");
    }
  });
}

function getTranslation() {
  let url = `https://www.ted.com/graphql`;
  let id = window.location.href.split("/")[4].split("?")[0];
  let body = {
    operationName: "Transcript",
    variables: {
      id: id,
      language: "zh-cn",
    },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash:
          "5f6ae435c55824ea2754c9fdba3941597255adf547f92ed8f43c3fac29c7003e",
      },
    },
  };
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  return new Promise((resolve) => {
    fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    }).then((res) => {
      res.json().then((r) => {
        resolve(r);
      });
    });
  });
}

async function traverseParagraphsContainerElement() {
  let translationResult = await getTranslation();
  const translation = translationResult.data.translation;
  if (translation === null) {
    alert("没有中文翻译");
    return;
  }
  // paragraphs 是一个数组，每个元素是一个段落
  const paragraphs = translation.paragraphs;
  const divElement = document.querySelector(
    '[data-testid="paragraphs-container"]'
  );
  divElement.childNodes.forEach((node, index) => {
    // node就是一个个段落，node的第一个孩子节点是显示时间的，第二个节点是包含真正内容
    // 我需要处理的就是这个contentParagraph，把翻译内容更新到这个节点
    // contentParagraph就是除去显示时间的那个节点
    let divClassWFull = node.childNodes[1];
    let divClassWFullClone = divClassWFull.cloneNode(true);
    divClassWFullClone.id = "stylish-reader-paragraph";
    let spanClassTextTextPrimary = divClassWFullClone.childNodes[0];
    spanClassTextTextPrimary.childNodes.forEach((childNode, indicator) => {
      // 这里的childNode就是每一个小小的cues
      childNode.childNodes[0].textContent =
        paragraphs[index].cues[indicator].text;
    });
    node.appendChild(divClassWFullClone);
  });
}
function createStylishReaderButtonOnTed() {
  let tedPlayer = document.getElementById("talk-title");
  let button = document.createElement("button");
  button.className = "stylish-reader-button"; // 设置按钮的类名
  button.id = "stylish-reader-button"; // 设置按钮的id
  button.textContent = "Stylish Reader"; // 设置按钮文本
  // 设置按钮的样式
  button.style.backgroundColor = "#FAFAFA"; // 背景颜色
  button.style.color = "#F80061"; // 文字颜色
  button.style.fontWeight = "bold"; // 字体粗细
  button.style.border = "2px solid #E0E0E0"; // 边框样式
  button.style.padding = "10px 20px"; // 内边距
  button.style.fontSize = "16px"; // 字体大小
  button.style.cursor = "pointer"; // 鼠标悬停时的指针样式
  button.style.transition = "background-color 0.3s, border-color 0.3s"; // 过渡效果
  // 添加点击事件监听器
  getReadTranscriptButtonAndClick();

  button.addEventListener("mousedown", function () {
    // addVideoEventListener();
    traverseParagraphsContainerElement();
    this.style.backgroundColor = "#E0E0E0"; // 点击时的背景颜色
    this.style.borderColor = "#C0C0C0"; // 点击时的边框颜色
  });

  button.addEventListener("mouseup", function () {
    this.style.backgroundColor = "#FAFAFA"; // 松开鼠标时恢复背景颜色
    this.style.borderColor = "#E0E0E0"; // 松开鼠标时恢复边框颜色
  });

  button.addEventListener("mouseout", function () {
    this.style.backgroundColor = "#FAFAFA"; // 鼠标离开时恢复背景颜色
    this.style.borderColor = "#E0E0E0"; // 鼠标离开时恢复边框颜色
  });
  tedPlayer.appendChild(button);
}
