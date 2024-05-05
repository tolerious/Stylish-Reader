// 此处存放工具函数供所有plugin使用

import { fetchTranscript, sendMessageToBackground } from "../ted/utils";

// 创建一个Stylish Reader图标元素,不包括事件监听器,事件监听器在各个plugin中自行添加
export function createStylishIconElement(
  elementId = "default-stylish-reader-icon-id",
  additionalClassNameList = "media-subtitles-wrapper flex items-center justify-center"
) {
  let divElement = document.createElement("div");
  divElement.classList = [additionalClassNameList];
  divElement.style.paddingLeft = "8px";
  divElement.id = elementId;
  let imgElement = document.createElement("img");
  imgElement.src = browser.runtime.getURL("assets/stylish-reader-48.png");
  imgElement.style.cursor = "pointer";
  imgElement.style.width = "24px";
  imgElement.style.height = "24px";
  imgElement.style.marginLeft = "0.75rem";
  imgElement.style.marginRight = "0.75rem";
  imgElement.style.boxSizing = "border-box";
  imgElement.style.backgroundColor = "#05010d";
  imgElement.style.borderRadius = "5px";
  divElement.append(imgElement);
  return divElement;
}

export async function getPreparedDataForVuePage() {
  const title = getTitleFromTedUrl();
  const sharedLinkObject = await fetchSharedLink(title);
  sendMessageToBackground("contentLoaded", "content script loaded");
  const transcriptUrl = await getTranscriptUrlFromStorage();

  const subtitles = await fetchTranscript(transcriptUrl);
  const promiseArray = subtitles.map((subtitle) =>
    fetchTextData(subtitle.webvtt, subtitle.code)
  );
  const transcript = await Promise.all(promiseArray);
  return new Promise((resolve) => {
    const videoNodes = sharedLinkObject.data.videos.nodes;
    let sharedLink = null;
    if (videoNodes.length > 0) {
      const nativeDownloads =
        sharedLinkObject.data.videos.nodes[0].nativeDownloads;
      sharedLink =
        nativeDownloads?.high ||
        nativeDownloads?.medium ||
        nativeDownloads?.low;
    }
    resolve({
      sharedLink,
      transcript,
    });
  });
}

export function getTitleFromTedUrl() {
  const url = new URL(window.location.href);
  const pathname = url.pathname;
  const targetString = pathname.split("/")[2];
  return targetString;
}

export function fetchSharedLink(title, language = "en") {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // 根据你的需求设置请求头
    },
    body: JSON.stringify({
      operationName: "shareLinks",
      variables: {
        slug: title,
        language: language,
      },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash:
            "96c07cb20b68847421892cb57738cd2c10b238af01764abf77dddffa46331b46",
        },
      },
    }),
  };

  return new Promise((resolve) => {
    fetch(`https://www.ted.com/graphql`, requestOptions)
      .then((response) => {
        // 检查请求是否成功
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // 解析 text 格式的响应
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        // 在这里处理请求失败的情况
        console.error("Fetch webvtt failed:", error);
      });
  });
}

export function logger(message) {
  console.log(`%c${message}`)
}

function getTranscriptUrlFromStorage() {
  return new Promise((resolve) => {
    browser.storage.local.get("ted-transcript-url", (result) => {
      resolve(result["ted-transcript-url"]);
    });
  });
}

function parseWebVTT(webVTTContent) {
  // Split the content by lines
  const lines = webVTTContent.split("\n").map((line) => line.trim());
  const subtitles = [];
  let currentSubtitle = null;

  lines.forEach((line) => {
    // Check if line is a time range
    if (line.includes("-->")) {
      // Start a new subtitle object
      currentSubtitle = { start: "", end: "", text: "" };
      const times = line.split("-->");
      currentSubtitle.start = times[0].trim();
      currentSubtitle.end = times[1].trim();
    } else if (line && currentSubtitle) {
      // If there is text, append it to the current subtitle's text
      currentSubtitle.text += (currentSubtitle.text ? " " : "") + line;
    } else if (!line && currentSubtitle) {
      // If line is empty and there is a current subtitle, it means the subtitle ended
      subtitles.push(currentSubtitle);
      currentSubtitle = null; // Reset for the next subtitle
    }
  });

  // Check if there is a dangling subtitle without an empty line at the end
  if (currentSubtitle && currentSubtitle.text) {
    subtitles.push(currentSubtitle);
  }

  return JSON.stringify(subtitles, null, 2);
}

function fetchTextData(url, code) {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "text/vtt; charset=utf-8", // 根据你的需求设置请求头
    },
  };
  return new Promise((resolve, reject) => {
    fetch(url, requestOptions)
      .then((response) => {
        // 检查请求是否成功
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // 解析 text 格式的响应
        return response.text();
      })
      .then((data) => {
        resolve({
          code,
          // data: JSON.stringify(parseWebVTT(data)),
          data: parseWebVTT(data),
        });
      })
      .catch((error) => {
        // 在这里处理请求失败的情况
        console.error("Fetch webvtt failed:", error);
        reject(error);
      });
  });
}
