// Put all the javascript code here, that you want to execute after page load.

browser.runtime.onMessage.addListener((message) => {
  console.log(message);
  if (message.actionType === "saveArticleSuccess") {
    if (checkStylishBarIsExist()) {
      removeStylishBar();
    }
    createBar();
    createScript();
  }
});

function checkStylishBarIsExist() {
  const stylishReaderBar = document.getElementById("stylish-reader-bar");
  console.log(stylishReaderBar);
  return stylishReaderBar !== null;
}

function removeStylishBar() {
  var stylishReaderBar = document.getElementById("stylish-reader-bar");
  var parentElement = stylishReaderBar.parentNode;
  parentElement.removeChild(stylishReaderBar);
}

function createBar() {
  // 创建stylish-reader-bar元素
  var stylishReaderBar = document.createElement("div");
  stylishReaderBar.id = "stylish-reader-bar";
  stylishReaderBar.style.cssText =
    "height: 30px; background-color: #f8f9fa; position: fixed; z-index: 99999; width: 100%; border-bottom: 1px solid grey; top: 0; padding: 0 10px; box-sizing: border-box; display: grid; grid-template-columns: 250px minmax(0, 1fr) 50px; grid-template-rows: 1fr;";

  // 创建左侧内容
  var leftContent = document.createElement("div");
  leftContent.style.cssText =
    "cursor: pointer; display: flex; flex-direction: row; justify-content: flex-start; align-items: center; height: 100%;";

  var leftContentImage = document.createElement("img");
  leftContentImage.style.height = "25px";
  leftContentImage.src = browser.runtime.getURL("assets/stylish-reader-48.png");
  leftContentImage.alt = "";

  var leftContentSpan = document.createElement("span");
  leftContentSpan.style.cssText =
    "margin: 0 3px; font-weight: bold; text-decoration: underline;";
  leftContentSpan.textContent = "Open in Stylish Reader";

  var leftContentArrow = document.createElement("img");
  leftContentArrow.style.height = "10px";
  leftContentArrow.src = browser.runtime.getURL("assets/right-arrow.png");
  leftContentArrow.alt = "";

  leftContent.appendChild(leftContentImage);
  leftContent.appendChild(leftContentSpan);
  leftContent.appendChild(leftContentArrow);

  // 创建中间内容
  var middleContent = document.createElement("div");
  middleContent.style.lineHeight = "30px";
  var countdownElement = document.createElement("div");
  countdownElement.id = "stylish-reader-bar-message";
  middleContent.appendChild(countdownElement);

  // 创建右侧内容
  var rightContent = document.createElement("div");
  rightContent.style.cssText =
    "display: flex; flex-direction: row; align-items: center; justify-content: flex-end; cursor: pointer;";

  var rightContentImage = document.createElement("img");
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

function createScript() {
  // 创建一个 <script> 元素
  var scriptElement = document.createElement("script");

  // 设置脚本内容
  var scriptContent = `
  var cancelButton = document.getElementById("stylish-reader-bar-cancel-button");
  cancelButton.addEventListener("click", function () {
    var stylishReaderBar = document.getElementById("stylish-reader-bar");
    var parentElement = stylishReaderBar.parentNode;
    parentElement.removeChild(stylishReaderBar);
  });

  var countdownElement = document.getElementById("stylish-reader-bar-message");
  var totalTimeInSeconds = 5;

  function startCountdown() {
    var currentTime = totalTimeInSeconds;

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
    var intervalId = setInterval(updateCountdown, 1000);
  }

  startCountdown();
`;

  // 将脚本内容设置为 <script> 元素的文本内容
  scriptElement.text = scriptContent;

  // 将 <script> 元素插入到页面的 <head> 元素中
  document.head.appendChild(scriptElement);
}
