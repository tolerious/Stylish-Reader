import { baseUrl } from "./constants";
import {
  clearTranslationContainerContent,
  generateTranslationContent,
  hideLikeIcon,
  hideUnLikeIcon,
  playAudio,
  setPhoneticContent,
  showLikeIcon,
  showUnLikeIcon,
} from "./elementControl";
import { FetchWrapper } from "./fetchWrapper";

export async function getAudioStream(word: string) {
  const client = new FetchWrapper(baseUrl);
  const response = await client.post(
    "/youdao",
    { word },
    undefined,
    undefined,
    "blob"
  );
  const audioBlob = response.data;
  const u = URL.createObjectURL(audioBlob);
  playAudio(u);
}

export async function getTranslationFromYouDao(word: string) {
  console.log("youdao...");
  setPhoneticContent("");
  clearTranslationContainerContent();
  const client = new FetchWrapper(baseUrl);
  const data = await client.post("/translation/content", { word });
  const phonetic = data.data.data.phonetic;
  const translationContentList = data.data.data.dicList;
  setPhoneticContent(phonetic);

  generateTranslationContent(translationContentList);
}

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

export async function searchWord(word: string) {
  const client = new FetchWrapper(baseUrl);
  const t = await client.post("/word/search", { en: word });
  return t;
}

export function sendMessageToGeneralScript(message: any) {
  const event = new CustomEvent("floatingPanelEvent", {
    detail: JSON.stringify(message),
  });
  document.dispatchEvent(event);
}

export async function favourWord() {
  const client = new FetchWrapper(baseUrl);
  const t = await client.post("/word", {
    en: convertStringToLowerCaseAndRemoveSpecialCharacter(
      localStorage.getItem("currentWord")!
    ),
    groupId: localStorage.getItem("groupId"),
  });
  // 收藏成功
  if (t.data.code === 200) {
    sendMessageToGeneralScript({ type: "save-word" });
    showLikeIcon();
    hideUnLikeIcon();
  }
}

export async function deleteWord() {
  const client = new FetchWrapper(baseUrl);

  const d = await client.post("/word/word/id", {
    en: localStorage.getItem("currentWord"),
  });

  const wordId = d.data.data._id;

  const t = await client.post("/word/delete", {
    id: wordId,
    groupId: localStorage.getItem("groupId"),
  });

  if (t.data.code === 200) {
    showUnLikeIcon();
    hideLikeIcon();
    sendMessageToGeneralScript({
      type: "remove-word",
      message: localStorage.getItem("currentWord"),
    });
  }
}
