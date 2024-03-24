import { sendMessageFromContentScriptToInjectedScript } from "../ted/customEvent";
import { parseWebVTT } from "./webvttToJson";

export function fetchTextData(url, code) {
  // console.log(url);
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "text/vtt; charset=utf-8", // 根据你的需求设置请求头
    },
  };
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
      console.log(parseWebVTT(data));
    })
    .catch((error) => {
      // 在这里处理请求失败的情况
      console.error("Fetch webvtt failed:", error);
    });
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
