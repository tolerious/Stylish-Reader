import { listenEventFromBackgroundScript, logger } from "../utils/utils";
import {
  createAndSetDefaultGroupForCurrentPage,
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
  await injectPhraseFloatingPanelToShadowDom();
  customizeGeneralEvent();
  await createAndSetDefaultGroupForCurrentPage();
  goThroughDomAndGenerateCustomElement(await getWordList());
}
