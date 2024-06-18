import { logger } from "../utils/utils";
import {
  checkAuthorize,
  customizeGeneralEvent,
  getWordList,
  goThroughDomAndGenerateCustomElement,
  injectTranslationFloatingPanelVuePage,
} from "./utils";

export async function initializeGeneralWebSite() {
  logger("initializeGeneralWebSite");
  checkAuthorize();
  customizeGeneralEvent();
  injectTranslationFloatingPanelVuePage();
  goThroughDomAndGenerateCustomElement(await getWordList());
}
