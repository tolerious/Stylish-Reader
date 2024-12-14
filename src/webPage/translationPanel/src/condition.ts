import { hideUnLikeIcon } from "./elementControl";

export function initControl() {
  hideUnLikeIcon();
}

export function setCurrentWord(word: string) {
  const shadow = document.getElementById(
    "stylish-reader-translation-panel-shadow-root"
  )?.shadowRoot;
  if (shadow) {
    const icon = shadow.querySelector("#current-word") as HTMLElement;
    icon.textContent = word;
  }
}
