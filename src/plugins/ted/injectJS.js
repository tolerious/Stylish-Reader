import {
  checkIfVideoPopupExist,
  createVideoPagePopup,
  showVideoPagePopup,
} from "./utils";

export function injectVideoVueScript() {
  return new Promise((resolve) => {
    if (checkIfVideoPopupExist()) {
      showVideoPagePopup();
      resolve(true);
      return;
    }
    createVideoPagePopup();
    // 此js就是Vue项目build好的js文件
    fetch(browser.runtime.getURL("assets/js/stylish-reader-video-page.js"))
      .then((response) => response.text())
      .then((js) => {
        injectInternalModuleScript(js);
        resolve(true);
      })
      .catch((error) => {
        console.error("Error injecting video vue script:", error);
        resolve(false);
      });
  });
}

// 从文件中读取JavaScript并注入到页面中

export function injectScript() {
  fetch(browser.runtime.getURL("assets/js/plyr.js"))
    .then((response) => response.text())
    .then((js) => {
      injectInternalScript(js);
    })
    .catch((error) => console.error("Error injecting script:", error));
}

// 在页面中注入JavaScript
function injectInternalScript(code) {
  const script = document.createElement("script");
  script.textContent = code;
  document.body.appendChild(script);
  //  FIXME: Remove test code
  // injectOtherScript();
}

function injectInternalModuleScript(code) {
  const script = document.createElement("script");
  script.type = "module";
  script.textContent = code;
  document.body.appendChild(script);
}

//  FIXME: Remove test code
function injectOtherScript() {
  const code = `
  // 监听来自内容脚本的消息
// document.addEventListener('fromContentScript', (event) => {
//   console.log('Received message from content script:', event.detail);
// });

// 发送消息到内容脚本
function sendMessageToContentScript(message) {
  const event = new CustomEvent('fromInjectScript', { detail: message });
  document.dispatchEvent(event);
}

     const player = new Plyr("#player", {
        title: "123",
        debug:false,
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "mute",
          "volume",
          "captions",
          "settings",
          "pip",
          "airplay",
          "fullscreen",
          // additional controls
          "rewind",
          "fast-forward",
          "duration",
          "restart",
        ],
        loadSprite: false,
        iconUrl: "./plyr.svg",
      });
      player.on("timeupdate", (event) => {
        //   console.log(player.currentTime, player.duration);
          sendMessageToContentScript(player.currentTime)
        });


        
      `;
  const script = document.createElement("script");
  script.textContent = code;
  document.body.appendChild(script);
}
