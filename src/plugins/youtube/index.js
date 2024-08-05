import { logger } from "../utils/utils";
import {
  addTranscriptStatusElementIfNotExist,
  createYoutubeStylishReaderIcon,
  injectYoutubeVideoVuePage,
  registerEventListenerForBackendScript,
  toggleSubtitleBtn,
} from "./utils";

export function initializeYoutube() {
  logger("Initialize Youtube...");
  registerEventListenerForBackendScript();
  injectYoutubeVideoVuePage();

  setInterval(() => {
    createYoutubeStylishReaderIcon();
    toggleSubtitleBtn();
    addTranscriptStatusElementIfNotExist();
  }, 1000);
}
