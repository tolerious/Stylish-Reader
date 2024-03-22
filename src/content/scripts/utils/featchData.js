import { parseWebVTT } from "./webvttToJson";

export function fetchData(url) {
  console.log(url);
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
      // 解析 JSON 格式的响应
      return response.text();
    })
    .then((data) => {
      console.log(parseWebVTT(data));
    })
    .catch((error) => {
      // 在这里处理请求失败的情况
      console.error("There was a problem with the fetch operation:", error);
    });
}
