// TED 网站上的操作

const supportedDomains = ["www.ted.com"];

let videoElementIsValidInterval = null;

function getCurrentDomain() {
  let domain = "";
  let url = window.location.href;
  if (url.indexOf("://") > -1) {
    domain = url.split("/")[2];
  } else {
    domain = url.split("/")[0];
  }
  domain = domain.split(":")[0];
  return domain;
}

function createStylishIconElement() {
  if (checkStylishIconLength() === 0) {
    let divElement = document.createElement("div");
    divElement.classList = [
      "media-subtitles-wrapper       flex       items-center       justify-center",
    ];
    divElement.style.paddingLeft = "8px";
    let imgElement = document.createElement("img");
    imgElement.className = "stylish-reader-icon";
    imgElement.src = browser.runtime.getURL("assets/stylish-reader-48.png");
    imgElement.style.cursor = "pointer";
    imgElement.style.width = "24px";
    imgElement.style.height = "24px";
    imgElement.style.marginLeft = "0.75rem";
    imgElement.style.marginRight = "0.75rem";
    imgElement.style.boxSizing = "border-box";
    imgElement.style.backgroundColor = "#05010d";
    imgElement.style.borderRadius = "5px";
    imgElement.addEventListener("click", () => {
      console.log("...");
    });
    divElement.append(imgElement);
    return divElement;
  } else {
    return null;
  }
}

function addStylishBarIconToToolBar() {
  if (checkStylishIconLength() === 0) {
    let tedMediaControlBar = document.getElementById("media-control-bar");
    if (tedMediaControlBar !== null) {
      clearInterval(videoElementIsValidInterval);

      const node = createStylishIconElement();
      if (node) {
        tedMediaControlBar?.appendChild(node);
      }
    }
  }
}

function checkStylishIconLength() {
  return document.querySelectorAll(".stylish-reader-icon").length;
}

setInterval(() => {
  if (checkStylishIconLength() === 0) {
    ted();
  }
}, 800);

export function ted() {
  if (supportedDomains.includes(getCurrentDomain())) {
    videoElementIsValidInterval = setInterval(() => {
      addStylishBarIconToToolBar();
    }, 300);
  }
}
