// TED 网站上的操作

const supportedDomains = ["www.ted.com"];

let findRealVideoBarInterval = null;

export function findRealVideoBar() {
  if (findRealVideoBarInterval) {
    clearInterval(findRealVideoBarInterval);
  }
  findRealVideoBarInterval = setInterval(() => {
    // const videoBar = document.querySelector(".video__bar");
    // if (videoBar) {
    //   clearInterval(findRealVideoBarInterval);
    //   videoBar.style.display = "block";
    // }
    let tedPlayerDiv = document.querySelector("#ted-player");
    let tedPlayerDivThirdChild = tedPlayerDiv.childNodes[2];
    let tedPlayerDivThirdChildSectionChild =
      tedPlayerDivThirdChild.childNodes[0];
    console.log(tedPlayerDivThirdChildSectionChild);
    if (
      tedPlayerDivThirdChild.className ===
      "absolute bottom-0 z-20 w-full transition-opacity opacity-100"
    ) {
      console.log("视频开始播放了");
    }
  }, 1000);
}
