// Put all the javascript code here, that you want to execute after page load.

browser.runtime.onMessage.addListener((message) => {
  console.log(message);
});
