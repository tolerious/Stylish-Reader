export function convertStringToLowerCaseAndRemoveSpecialCharacter(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/,/g, "")
    .replace(/"/g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .replace(/:/g, "")
    .replace(/'/g, "")
    .replace(/\?/g, "")
    .replace(/!/g, "");
}

export function goToLangManWebsite() {
  const word = localStorage.getItem("currentWord")!;
  if (word) {
    window.open(`https://www.ldoceonline.com/dictionary/${word}`);
  }
}

export function goToCambridgeWebsite() {
  const word = localStorage.getItem("currentWord")!;
  if (word) {
    window.open(`https://dictionary.cambridge.org/dictionary/english/${word}`);
  }
}

export function goToGoogleTranslate() {
  const word = localStorage.getItem("currentWord")!;
  if (word) {
    window.open(
      `https://translate.google.com/?sl=auto&tl=zh-CN&text=${word}&op=translate`
    );
  }
}

export function goToReviewWordWebsite() {
  window.open(`https://app.stylishreader.com/today`);
}

export function sendMessageToGeneralScript(message: any) {
  const event = new CustomEvent("floatingPanelEvent", {
    detail: JSON.stringify(message),
  });
  document.dispatchEvent(event);
}
