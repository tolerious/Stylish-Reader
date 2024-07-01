import { logger } from "../utils/utils";
import {
  createYoutubeStylishReaderIcon,
  registerEventListenerForBackendScript,
} from "./utils";

export function initializeYoutube() {
  logger("Initialize Youtube...");
  registerEventListenerForBackendScript();
  setInterval(() => {
    createYoutubeStylishReaderIcon();
  }, 1000);
}
