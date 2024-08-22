import { logger } from "../utils/utils";
import {
  checkAuthorize,
  customizeGeneralEvent,
  getWordList,
  goThroughDomAndGenerateCustomElement,
  injectTranslationFloatingPanelToShadowDom,
} from "./utils";

export async function initializeGeneralWebSite() {
  logger("initializeGeneralWebSite");
  checkAuthorize();
  customizeGeneralEvent();
  injectTranslationFloatingPanelToShadowDom();
  goThroughDomAndGenerateCustomElement(await getWordList());
}
