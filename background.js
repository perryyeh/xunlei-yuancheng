//config
var config = {
  //device list
  "device" : "http://homecloud.yuancheng.xunlei.com/listPeer?type=0&v=2&ct=0&_=" + Date.parse(new Date()),
  //download url
  "yuancheng" : "http://yc.xunlei.com/?download={download}&pid={pid}"
}

//get thunder device
function getDevice(){
  var json = [{
    "name" : chrome.i18n.getMessage("defaultdevice"),
    "pid" : "",
    "online" : "65535"
  }];

  var url = config.device;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", config.device, false);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var data = JSON.parse(xhr.responseText);
      if (data && data.peerList) {
        json =  data.peerList;
      }
    }
  }
  xhr.send();
  return json;
}

function openYuancheng(info, tab) {
  var url = config.yuancheng;
  url = url.replace("{download}", encodeURIComponent(info.linkUrl));
  url = url.replace("{pid}",info.menuItemId);
  chrome.tabs.create({"url": url});
}

//manage menu
function manageMenu(){
  chrome.contextMenus.removeAll();

  var title = chrome.i18n.getMessage("context_title");
  var device = getDevice();
  //add multiple device menu
  //but chrome collapses them to single, f**k
  for (var i = 0; i < device.length; i++) {
    var menuTitle = title;
    menuTitle = menuTitle.replace("{device}",device[i].name);
    menuTitle = menuTitle.replace("{status}", chrome.i18n.getMessage("status"+device[i].online));
    chrome.contextMenus.create({type: "normal", id: device[i].pid, title: menuTitle, contexts: ["link"], onclick: openYuancheng});
  }
  //alert(JSON.stringify(device));
}

//sync device & status @ 30s
manageMenu();
setInterval(manageMenu, 30000);
