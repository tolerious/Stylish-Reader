import { fetchTextData } from "../utils/fetchData";

export let supportedLanguages = [];

export function fetchTranscript(url) {
  // console.log(url);
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
      // 通知Vue页面支持哪些语言
      supportedLanguages = data.subtitles
        .filter((item) => item.code == "en" || item.code == "zh-cn")
        .reduce((acc, item) => {
          acc.push({ code: item.code });
          return acc;
        }, []);
      console.log(supportedLanguages);
      console.log(subtitles);
      subtitles.forEach((subtitle) => {
        fetchTextData(subtitle.webvtt);
      });
    })
    .catch((error) => {
      // 在这里处理请求失败的情况
      console.error("There was a problem with the fetch operation:", error);
    });
}
