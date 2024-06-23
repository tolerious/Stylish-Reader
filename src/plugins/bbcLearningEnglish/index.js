import { logger } from "../utils/utils";
import { initializeSixMinsEnglish } from "./utils";

export function initializeBBC() {
  logger("initializeBBC called");
  if (window.location.href.includes("6-minute-english")) {
    initializeSixMinsEnglish();
  }
}
