export function createVideoPagePopup() {
  const videoPagePopup = document.createElement("div");
  videoPagePopup.id = "stylish-reader-video-page-root";
  videoPagePopup.style.position = "fixed";
  videoPagePopup.style.top = 0;
  videoPagePopup.style.left = 0;
  //   videoPagePopup.style.transform = "translate(-50%, -50%)";
  videoPagePopup.style.zIndex = "9999";
  videoPagePopup.style.width = "100%";
  videoPagePopup.style.height = "50%";
  //   videoPagePopup.style.display = "none";
  document.body.appendChild(videoPagePopup);
}

export function showVideoPagePopup() {
  document.getElementById("stylish-reader-video-page-root").style.display =
    "block";
}

export function hideVideoPagePopup() {
  document.getElementById("stylish-reader-video-page-root").style.display =
    "none";
}
