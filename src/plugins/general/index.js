import { listenEventFromBackgroundScript, logger } from "../utils/utils";
import { StylishReaderSpan } from "./stylishReaderSpan";
import {
  createAndSetDefaultGroupForCurrentPage,
  createAudioTagForFloatingPanel,
  customizeGeneralEvent,
  getWordList,
  goThroughDomAndGenerateCustomElement,
  injectTranslationFloatingPanelToShadowDom,
  listenEventFromOfficialWebsite,
  removeAllClickableWordEventListener,
} from "./utils";

export async function initializeGeneralWebSite() {
  customElements.define("stylish-reader-span", StylishReaderSpan);
  logger("initializeGeneralWebSite");
  listenEventFromBackgroundScript();
  listenEventFromOfficialWebsite();
  await injectTranslationFloatingPanelToShadowDom();
  customizeGeneralEvent();
  await createAndSetDefaultGroupForCurrentPage();
  goThroughDomAndGenerateCustomElement(await getWordList());
  createAudioTagForFloatingPanel();
  // await injectPhraseFloatingPanelToShadowDom();
  setInterval(async () => {
    console.log("Go through...");
    removeAllClickableWordEventListener();
    goThroughDomAndGenerateCustomElement(await getWordList());
  }, 5000);
}
