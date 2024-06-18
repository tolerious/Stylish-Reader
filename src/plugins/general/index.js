import { logger } from "../utils/utils";
import {
  customizeGeneralEvent,
  getWordList,
  goThroughDomAndGenerateCustomElement,
  injectTranslationFloatingPanelVuePage,
} from "./utils";

export async function initializeGeneralWebSite() {
  logger("initializeGeneralWebSite");
  customizeGeneralEvent();
  injectTranslationFloatingPanelVuePage();
  goThroughDomAndGenerateCustomElement(await getWordList());
}
