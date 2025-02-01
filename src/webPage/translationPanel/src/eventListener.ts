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
  deleteWord,
  favourWord,
  getAudioStream,
  getTranslationFromYouDao,
  goToCambridgeWebsite,
  goToGoogleTranslate,
  goToLangManWebsite,
  searchWord,
  sendMessageToGeneralScript,
} from "./utils";

export function addEventListener() {
  document.addEventListener("generalScriptEvent", async (e: Event) => {
    console.log(e);
    const ee = e as CustomEvent;
    const data = JSON.parse(ee.detail);
    switch (data.type) {
      case "search-word-result":
        console.log(data);
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

          // getTranslationFromYouDao(
          //   convertStringToLowerCaseAndRemoveSpecialCharacter(data.word.trim())
          // );
        } else {
          localStorage.setItem(
            "currentWord",
            convertStringToLowerCaseAndRemoveSpecialCharacter(data.word)
          );
          setCurrentWord(localStorage.getItem("currentWord")!);
          const t = await searchWord(
            convertStringToLowerCaseAndRemoveSpecialCharacter(data.word)
          );
          if (t.data.data.isLiked) {
            hideUnLikeIcon();
            showLikeIcon();
          } else {
            showUnLikeIcon();
            hideLikeIcon();
          }
          // getAudioStream(localStorage.getItem("currentWord")!);
        }
        // getTranslationFromYouDao(
        //   convertStringToLowerCaseAndRemoveSpecialCharacter(data.word)
        // );
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
    langMan.addEventListener("click", () => goToLangManWebsite());
  }

  const cambridge = shadow?.querySelector("#goToCambridgeWebsite");
  if (cambridge) {
    cambridge.addEventListener("click", () => goToCambridgeWebsite());
  }

  const google = shadow?.querySelector("#goToGoogleTranslate");
  if (google) {
    google.addEventListener("click", () => goToGoogleTranslate());
  }

  const playButton = shadow?.querySelector("#play-audio") as HTMLElement;
  playButton.addEventListener("click", () => {
    sendMessageToGeneralScript({ type: "http-request-from-floating-panel" });
    getAudioStream(localStorage.getItem("currentWord")!);
  });

  const likeIcon = shadow?.querySelector("#like-icon") as HTMLElement;
  likeIcon.addEventListener("click", () => {
    deleteWord();
  });

  const unLikeIcon = shadow?.querySelector("#unlike-icon") as HTMLElement;
  unLikeIcon.addEventListener("click", () => {
    favourWord();
  });
}
