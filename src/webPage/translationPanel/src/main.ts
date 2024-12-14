import { initControl } from "./condition";
import { addEventListener } from "./eventListener";
import "./style.css";

const shadow = document.getElementById(
  "stylish-reader-translation-panel-shadow-root"
)?.shadowRoot;

const mountPoint =
  shadow?.getElementById("stylish-reader-translation-panel") ??
  document.getElementById("stylish-reader-translation-panel");

mountPoint!.innerHTML = `
    <div class="container mx-auto bg-white px-1 py-1 text-[16px]">
    <div class="flex columns-2 flex-row">
      <div class="basis-4/5 flex-col text-[18px]" id="current-word"></div>
      <div class="flex grow cursor-pointer select-none flex-row justify-around" id="mark-word">
   
    <span id="like-icon">❤️</span> 
    <span id="unlike-icon">🤍</span>
      </div>
    </div>
    <div class="my-2 flex cursor-pointer flex-row space-x-2">
      <div>
        <span id="phonetic">&nbsp;</span>
      </div>
      <div id="play-audio" >🔊</div>
    </div>
    <div class="my-2 flex justify-start gap-5 text-pink-500">
      <span class="cursor-pointer underline" id="goToLangManWebsite">🔗朗文词典</span>
      <span class="cursor-pointer underline" id="goToCambridgeWebsite">🔗剑桥词典</span>
      <span class="cursor-pointer underline" id="goToGoogleTranslate">🔗Google翻译</span>
    </div>
    <div id="translation-container">
      <div class="flex flex-row flex-nowrap" v-for="item in dic" :key="item.pos">
        <div>{{ item.pos }}</div>
        <div>{{ item.zh }}</div>
      </div>
    </div>
    
    <audio autoplay id="audioPlayer"></audio>
  </div>
`;

addEventListener();
initControl();
