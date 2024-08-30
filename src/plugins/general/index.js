import { listenEventFromBackgroundScript, logger } from "../utils/utils";
import {
  customizeGeneralEvent,
  getWordList,
  goThroughDomAndGenerateCustomElement,
  injectTranslationFloatingPanelToShadowDom,
} from "./utils";

export async function initializeGeneralWebSite() {
  logger("initializeGeneralWebSite");
  listenEventFromBackgroundScript();
  await injectTranslationFloatingPanelToShadowDom();
  customizeGeneralEvent();
  goThroughDomAndGenerateCustomElement(await getWordList());
}
