import { fetchData } from "../utils/featchData";

const supportedLanguages = new Map([
  ["en", "English"],
  ["zh-cn", "简体中文"],
  ["zh-tw", "繁體中文"],
]);
export function fetchTranscript(url) {
  console.log(url);
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json", // 根据你的需求设置请求头
    },
    //   body: JSON.stringify({ key: "value" }), // 设置请求的 payload
  };
  fetch(url, requestOptions)
    .then((response) => {
      // 检查请求是否成功
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      // 解析 JSON 格式的响应
      return response.json();
    })
    .then((data) => {
      // 在这里处理解析后的数据
      const subtitles = data.subtitles.filter(
        (item) => item.code == "en" || item.code == "zh-cn"
      );
      console.log(subtitles);
      subtitles.forEach((subtitle) => {
        fetchData(subtitle.webvtt);
      });
    })
    .catch((error) => {
      // 在这里处理请求失败的情况
      console.error("There was a problem with the fetch operation:", error);
    });
}
