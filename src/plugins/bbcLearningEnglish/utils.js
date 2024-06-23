import { logger } from "../utils/utils";
import { sixMinutesEnglishToolBarIconId } from "./constants";

export function initializeSixMinsEnglish() {
  logger("six minutes...");
  setInterval(() => {
    createSixMinsEnglishToolbarIcon();
  }, 1000);
}

function checkSixMinsEnglishToolBarIconExist() {
  const iframeElement = document.getElementById(
    "smphtml5iframebbcMediaPlayer0"
  );
  const iframeParentDocument = iframeElement.contentDocument;
  return (
    iframeParentDocument.getElementById(sixMinutesEnglishToolBarIconId) !== null
  );
}

function createSixMinsEnglishToolbarIcon() {
  if (checkSixMinsEnglishToolBarIconExist()) {
    return;
  }
  const iframeElement = document.getElementById(
    "smphtml5iframebbcMediaPlayer0"
  );
  const iframeParentDocument = iframeElement.contentDocument;
  const parentElement = iframeParentDocument.querySelector(
    ".p_playerControlBarHolder"
  );
  const iconElement = createSixMinusToolBarIcon(sixMinutesEnglishToolBarIconId);
  parentElement.appendChild(iconElement);
}

function onStylishReaderIconClick() {}

function createSixMinusToolBarIcon(elementId) {
  let divElement = document.createElement("div");
  divElement.classList = ["p_button p_controlBarButton p_embedButton"];
  divElement.id = elementId;
  divElement.style.display = "flex";
  divElement.style.alignItems = "center";
  divElement.style.justifyContent = "center";
  let imgElement = document.createElement("img");
  imgElement.src = browser.runtime.getURL("assets/stylish-reader-48.png");
  imgElement.style.cursor = "pointer";
  imgElement.style.width = "24px";
  imgElement.style.height = "24px";
  imgElement.style.marginLeft = "0.75rem";
  imgElement.style.marginRight = "0.75rem";
  imgElement.style.boxSizing = "border-box";
  imgElement.style.backgroundColor = "#05010d";
  imgElement.style.borderRadius = "5px";
  divElement.append(imgElement);
  divElement.addEventListener("click", onStylishReaderIconClick);
  return divElement;
}
