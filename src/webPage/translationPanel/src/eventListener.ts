import { setCurrentWord } from "./condition";
import {
  clearTranslationContainerContent,
  generateTranslationContent,
  hideLikeIcon,
  hideUnLikeIcon,
  setPhoneticContent,
  showLikeIcon,
  showUnLikeIcon,
} from "./elementControl";
import {
  convertStringToLowerCaseAndRemoveSpecialCharacter,
  goToCambridgeWebsite,
  goToGoogleTranslate,
  goToLangManWebsite,
  goToReviewWordWebsite,
  sendMessageToGeneralScript,
} from "./utils";

export function addEventListener() {
  document.addEventListener("generalScriptEvent", async (e: Event) => {
    const ee = e as CustomEvent;
    const data = JSON.parse(ee.detail);
    switch (data.type) {
      case "delete-word-success":
        showUnLikeIcon();
        hideLikeIcon();
        sendMessageToGeneralScript({
          type: "delete-word-success",
          message: localStorage.getItem("currentWord"),
        });
        break;
      case "favour-word-success":
        showLikeIcon();
        hideUnLikeIcon();
        sendMessageToGeneralScript({
          type: "save-word",
        });
        break;
      case "is-liked":
        const isLiked = data.message.data.isLiked;
        if (isLiked) {
          hideUnLikeIcon();
          showLikeIcon();
        } else {
          showUnLikeIcon();
          hideLikeIcon();
        }
        break;
      case "search-word-result":
        setPhoneticContent("");
        clearTranslationContainerContent();
        const phonetic = data.message.data.phonetic;
        const translationContentList = data.message.data.dicList;
        setPhoneticContent(phonetic);
        generateTranslationContent(translationContentList);
        break;
      case "search-word":
        localStorage.setItem("dic", JSON.stringify([]));
        if (data.word.trim().split(" ").length > 1) {
          localStorage.setItem(
            "currentWord",
            convertStringToLowerCaseAndRemoveSpecialCharacter(data.word)
          );
          hideLikeIcon();
          hideUnLikeIcon();
          setCurrentWord(localStorage.getItem("currentWord")!);
        } else {
          localStorage.setItem(
            "currentWord",
            convertStringToLowerCaseAndRemoveSpecialCharacter(data.word)
          );
          setCurrentWord(localStorage.getItem("currentWord")!);
        }
        break;
      default:
        break;
    }
  });

  const shadow = document.getElementById(
    "stylish-reader-translation-panel-shadow-root"
  )?.shadowRoot;

  const langMan = shadow?.querySelector("#goToLangManWebsite");
  if (langMan) {
    langMan.addEventListener("click", function () {
      goToLangManWebsite();
    });
  }

  const cambridge = shadow?.querySelector("#goToCambridgeWebsite");
  if (cambridge) {
    cambridge.addEventListener("click", function () {
      goToCambridgeWebsite();
    });
  }

  const google = shadow?.querySelector("#goToGoogleTranslate");
  if (google) {
    google.addEventListener("click", function () {
      goToGoogleTranslate();
    });
  }

  const reviewWord = shadow?.querySelector("#reviewWord");
  if (reviewWord) {
    reviewWord.addEventListener("click", function () {
      goToReviewWordWebsite();
    });
  }

  const playButton = shadow?.querySelector("#play-audio") as HTMLElement;
  playButton.addEventListener("click", () => {
    sendMessageToGeneralScript({
      type: "play-audio-from-floating-panel",
      message: localStorage.getItem("currentWord"),
    });
  });

  const likeIcon = shadow?.querySelector("#like-icon") as HTMLElement;
  likeIcon.addEventListener("click", () => {
    // deleteWord();
    sendMessageToGeneralScript({
      type: "delete-word",
      message: localStorage.getItem("currentWord"),
    });
  });

  const unLikeIcon = shadow?.querySelector("#unlike-icon") as HTMLElement;
  unLikeIcon.addEventListener("click", () => {
    // favourWord();
    sendMessageToGeneralScript({
      type: "favour-word",
      message: localStorage.getItem("currentWord"),
    });
  });
}
