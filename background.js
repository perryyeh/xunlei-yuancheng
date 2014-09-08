function openYuancheng(info, tab) {
  var url = "http://yc.xunlei.com/?download="+ encodeURIComponent(info.linkUrl);
  chrome.tabs.create({"url": url});
}

var title = chrome.i18n.getMessage("context_title");
chrome.contextMenus.create({type: "normal", title: title, contexts: ["link"], onclick: openYuancheng});