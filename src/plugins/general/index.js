import { logger, waitEventFromBackgroundScriptInContentScript } from "../utils/utils";
import {
  checkAuthorize,
  customizeGeneralEvent,
  getWordList,
  goThroughDomAndGenerateCustomElement,
  injectTranslationFloatingPanelToShadowDom,
} from "./utils";

export async function initializeGeneralWebSite() {
  logger("initializeGeneralWebSite");
  waitEventFromBackgroundScriptInContentScript();
  checkAuthorize();
  await injectTranslationFloatingPanelToShadowDom();
  customizeGeneralEvent();
  goThroughDomAndGenerateCustomElement(await getWordList());
}
