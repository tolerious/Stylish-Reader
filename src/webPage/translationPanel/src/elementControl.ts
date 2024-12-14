export function showUnLikeIcon() {
  const shadow = document.getElementById(
    "stylish-reader-translation-panel-shadow-root"
  )?.shadowRoot;
  if (shadow) {
    const icon = shadow.querySelector("#unlike-icon") as HTMLElement;
    icon.style.display = "block";
  }
}

export function playAudio(data: any) {
  const shadow = document.getElementById(
    "stylish-reader-translation-panel-shadow-root"
  )?.shadowRoot;
  if (shadow) {
    const audio = shadow.querySelector("#audioPlayer") as HTMLAudioElement;
    audio.setAttribute("src", data);
    audio.play();
  }
}

export function hideUnLikeIcon() {
  const shadow = document.getElementById(
    "stylish-reader-translation-panel-shadow-root"
  )?.shadowRoot;
  if (shadow) {
    const icon = shadow.querySelector("#unlike-icon") as HTMLElement;
    icon.style.display = "none";
  }
}
export function showLikeIcon() {
  const shadow = document.getElementById(
    "stylish-reader-translation-panel-shadow-root"
  )?.shadowRoot;
  if (shadow) {
    const icon = shadow.querySelector("#like-icon") as HTMLElement;
    icon.style.display = "block";
  }
}
export function hideLikeIcon() {
  const shadow = document.getElementById(
    "stylish-reader-translation-panel-shadow-root"
  )?.shadowRoot;
  if (shadow) {
    const icon = shadow.querySelector("#like-icon") as HTMLElement;
    icon.style.display = "none";
  }
}

function generateTranslationItem(pos: string, zh: string) {
  const div = document.createElement("div");
  div.className = "flex flex-row flex-nowrap";
  const child1 = document.createElement("div");
  const child2 = document.createElement("div");
  child1.textContent = pos;
  child2.textContent = zh;

  div.appendChild(child1);
  div.appendChild(child2);
  return div;
}

export function clearTranslationContainerContent() {
  const shadow = document.getElementById(
    "stylish-reader-translation-panel-shadow-root"
  )?.shadowRoot;
  if (shadow) {
    const translationContainer = shadow.querySelector(
      "#translation-container"
    ) as HTMLElement;
    translationContainer.replaceChildren();
  }
}

export function generateTranslationContent(translations: []) {
  clearTranslationContainerContent();

  const shadow = document.getElementById(
    "stylish-reader-translation-panel-shadow-root"
  )?.shadowRoot;
  if (shadow) {
    const translationContainer = shadow.querySelector(
      "#translation-container"
    ) as HTMLElement;
    translations.forEach((translation: { pos: string; zh: string }) => {
      translationContainer.appendChild(
        generateTranslationItem(translation.pos, translation.zh)
      );
    });
  }
}

export function setPhoneticContent(content: string) {
  const shadow = document.getElementById(
    "stylish-reader-translation-panel-shadow-root"
  )?.shadowRoot;
  if (shadow) {
    const phonetic = shadow.querySelector("#phonetic") as HTMLElement;
    phonetic.textContent = content;
  }
}
