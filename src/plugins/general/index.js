import { listenEventFromBackgroundScript, logger } from "../utils/utils";
import {
  createAndSetDefaultGroupForCurrentPage,
  createAudioTagForFloatingPanel,
  customizeGeneralEvent,
  getWordList,
  goThroughDomAndGenerateCustomElement,
  injectPhraseFloatingPanelToShadowDom,
  injectTranslationFloatingPanelToShadowDom,
  listenEventFromOfficialWebsite,
} from "./utils";

export async function initializeGeneralWebSite() {
  logger("initializeGeneralWebSite");
  listenEventFromBackgroundScript();
  listenEventFromOfficialWebsite();
  await injectTranslationFloatingPanelToShadowDom();
  customizeGeneralEvent();
  await createAndSetDefaultGroupForCurrentPage();
  goThroughDomAndGenerateCustomElement(await getWordList());
  createAudioTagForFloatingPanel();
  // await injectPhraseFloatingPanelToShadowDom();
}
