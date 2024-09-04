import { listenEventFromBackgroundScript, logger } from "../utils/utils";
import {
  customizeGeneralEvent,
  getWordList,
  goThroughDomAndGenerateCustomElement,
  injectPhraseFloatingPanelToShadowDom,
  injectTranslationFloatingPanelToShadowDom,
} from "./utils";

export async function initializeGeneralWebSite() {
  logger("initializeGeneralWebSite");
  listenEventFromBackgroundScript();
  await injectTranslationFloatingPanelToShadowDom();
  await injectPhraseFloatingPanelToShadowDom();
  customizeGeneralEvent();
  goThroughDomAndGenerateCustomElement(await getWordList());
}
