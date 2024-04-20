// 此处存放工具函数供所有plugin使用

// 创建一个Stylish Reader图标元素,不包括事件监听器,事件监听器在各个plugin中自行添加
export function createStylishIconElement(
  elementId = "default-stylish-reader-icon-id",
  additionalClassNameList = "media-subtitles-wrapper flex items-center justify-center"
) {
  let divElement = document.createElement("div");
  divElement.classList = [additionalClassNameList];
  divElement.style.paddingLeft = "8px";
  divElement.id = elementId;
  let imgElement = document.createElement("img");
  imgElement.src = browser.runtime.getURL("assets/stylish-reader-48.png");
  imgElement.style.cursor = "pointer";
  imgElement.style.width = "24px";
  imgElement.style.height = "24px";
  imgElement.style.marginLeft = "0.75rem";
  imgElement.style.marginRight = "0.75rem";
  imgElement.style.boxSizing = "border-box";
  imgElement.style.backgroundColor = "#05010d";
  imgElement.style.borderRadius = "5px";
  divElement.append(imgElement);
  return divElement;
}
