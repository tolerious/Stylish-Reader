export function parseWebVTT(webVTTContent) {
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
