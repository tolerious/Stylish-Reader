import { logger } from "../utils/utils";
import {
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
  }, 1000);
}
