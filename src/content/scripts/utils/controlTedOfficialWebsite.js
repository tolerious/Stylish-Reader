export function pauseTedOfficialWebsiteVideo() {
  const video = document.querySelector("video");
  if (video) {
    video.pause();
  }
}
