import { setCurrentWord } from "./condition";
import {
  hideLikeIcon,
  hideUnLikeIcon,
  showLikeIcon,
  showUnLikeIcon,
} from "./elementControl";
import {
  convertStringToLowerCaseAndRemoveSpecialCharacter,
  deleteWord,
  favourWord,
  getAudioStream,
  getTranslationFromYouDao,
  searchWord,
} from "./utils";

export function addEventListener() {
  console.log("......");
  window.addEventListener("generalScriptEvent", async (e: Event) => {
    const ee = e as CustomEvent;
    const data = JSON.parse(ee.detail);
    console.log(data);
    switch (data.type) {
      case "group-id":
        localStorage.setItem("groupId", data.groupId);
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
          getTranslationFromYouDao(
            convertStringToLowerCaseAndRemoveSpecialCharacter(data.word.trim())
          );
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
          getAudioStream(localStorage.getItem("currentWord")!);
        }
        getTranslationFromYouDao(
          convertStringToLowerCaseAndRemoveSpecialCharacter(data.word)
        );
        break;
      case "play":
        // if (isPlayAudioIconVisible) {

        // }
        break;
      case "token":
        localStorage.setItem("floatingPanelToken", data.message);
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
      const word = localStorage.getItem("currentWord")!;
      if (word) {
        window.open(`https://www.ldoceonline.com/dictionary/${word}`);
      }
    });
  }

  const cambridge = shadow?.querySelector("#goToCambridgeWebsite");
  if (cambridge) {
    cambridge.addEventListener("click", function () {
      const word = localStorage.getItem("currentWord")!;
      if (word) {
        window.open(
          `https://dictionary.cambridge.org/dictionary/english/${word}`
        );
      }
    });
  }

  const google = shadow?.querySelector("#goToGoogleTranslate");
  if (google) {
    google.addEventListener("click", function () {
      console.log("go to google...");
      const word = localStorage.getItem("currentWord")!;
      // @ts-ignore
      // const domain = window.location.hostname;
      if (word) {
        window.open(
          `https://translate.google.com/?sl=auto&tl=zh-CN&text=${word}&op=translate`
        );
      }
    });
  }

  const playButton = shadow?.querySelector("#play-audio") as HTMLElement;
  playButton.addEventListener("click", () =>
    getAudioStream(localStorage.getItem("currentWord")!)
  );

  const likeIcon = shadow?.querySelector("#like-icon") as HTMLElement;
  likeIcon.addEventListener("click", () => {
    deleteWord();
  });

  const unLikeIcon = shadow?.querySelector("#unlike-icon") as HTMLElement;
  unLikeIcon.addEventListener("click", () => {
    favourWord();
  });
}
