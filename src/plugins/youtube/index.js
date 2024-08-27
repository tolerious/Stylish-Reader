import { logger } from "../utils/utils";
import {
  addTranscriptStatusElementIfNotExist,
  createYoutubeStylishReaderIcon,
  injectYoutubeVideoVuePage,
  toggleSubtitleBtn,
} from "./utils";

export function initializeYoutube() {
  logger("Initialize Youtube...");
  injectYoutubeVideoVuePage();

  setInterval(() => {
    createYoutubeStylishReaderIcon();
    toggleSubtitleBtn();
    addTranscriptStatusElementIfNotExist();
  }, 1000);
}
