export function getTitleFromTedUrl() {
  const url = new URL(window.location.href);
  const pathname = url.pathname;
  const targetString = pathname.split("/").pop();
  return targetString;
}
