(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function o(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(t){if(t.ep)return;t.ep=!0;const r=o(t);fetch(t.href,r)}})();function u(){browser.runtime.onMessage.addListener(e=>{switch(e.type){case"show":break;case"saveArticleSuccess":console.log("...");break;case"urlChanged":console.log(e),ted();break}})}const a=["www.ted.com"];let c=null;function f(){let e="",i=window.location.href;return i.indexOf("://")>-1?e=i.split("/")[2]:e=i.split("/")[0],e=e.split(":")[0],e}function h(){if(s()===0){let e=document.createElement("img");return e.className="stylish-reader-icon",e.src=browser.runtime.getURL("assets/stylish-reader-48.png"),e.style.cursor="pointer",e.style.width="24px",e.style.height="24px",e.style.marginLeft="0.75rem",e.style.marginRight="0.75rem",e.style.boxSizing="border-box",e.style.backgroundColor="#05010d",e.style.borderRadius="5px",e}else return null}function y(){if(s()===0){let e=document.querySelector("#ted-player");if(e!==null){clearInterval(c);let o=e.childNodes[2].childNodes[0];const n=h();n&&o.appendChild(n)}}}function s(){return document.querySelectorAll(".stylish-reader-icon").length}setInterval(()=>{s()===0&&d()},800);function d(){a.includes(f())&&(c=setInterval(()=>{y()},300))}u();d();console.log("content.js is running...");
