import { logger } from "../utils/utils";
import {
  createYoutubeStylishReaderIcon,
  injectYoutubeVideoVuePage,
  registerEventListenerForBackendScript,
} from "./utils";

export function initializeYoutube() {
  logger("Initialize Youtube...");
  registerEventListenerForBackendScript();
  injectYoutubeVideoVuePage();

  setInterval(() => {
    createYoutubeStylishReaderIcon();
  }, 1000);
}
