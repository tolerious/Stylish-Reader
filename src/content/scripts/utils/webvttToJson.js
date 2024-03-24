export function parseWebVTT(vttString) {
  // 去除文件开始的WEBVTT标记
  let vttData = vttString.replace(/WEBVTT\n\n/, "");

  // 按行分割
  let lines = vttData.split("\n");

  // 用于存储解析后的字幕项
  let cues = [];

  for (let i = 0; i < lines.length; i++) {
    // 匹配时间戳行的正则表达式
    let timeCodeMatch = lines[i].match(
      /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/
    );
    if (timeCodeMatch) {
      // 捕获时间戳和文本
      let startTime = timeCodeMatch[1];
      let endTime = timeCodeMatch[2];
      let text = lines[++i];

      // 将此字幕项添加到数组
      cues.push({
        startTime: startTime,
        endTime: endTime,
        text: text,
        id: i,
      });
    }
  }

  // 将结果转换为JSON字符串
  return JSON.stringify(cues, null, 2);
}
