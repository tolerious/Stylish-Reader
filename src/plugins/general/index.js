import {
  logger,
  waitEventFromBackgroundScriptInContentScript,
} from "../utils/utils";
import {
  customizeGeneralEvent,
  getWordList,
  goThroughDomAndGenerateCustomElement,
  injectTranslationFloatingPanelToShadowDom,
} from "./utils";

export async function initializeGeneralWebSite() {
  logger("initializeGeneralWebSite");
  waitEventFromBackgroundScriptInContentScript();
  await injectTranslationFloatingPanelToShadowDom();
  customizeGeneralEvent();
  goThroughDomAndGenerateCustomElement(await getWordList());
}
