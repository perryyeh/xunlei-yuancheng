function param(){
    var url = window.location.search,
        regexpParam = /([^&\?]*)=([^&]*)/g,
        parse = {};
    if(!url || url.indexOf("=")<0){
      return parse;
    }
    var reg = url.match(regexpParam);
    if (!reg) {
      return parse;
    }
    for (var i = reg.length - 1; i >= 0; i--) {
        var item = reg[i],
            itemSplit = item.split('='),
            itemKey = itemSplit[0],
            itemVal = itemSplit[1];
        parse[itemKey] = decodeURIComponent(itemVal);
    }
    return parse;
}
function startdownload(){
    if(!local.download){
        return;
    }
    var devices = $("[data-type='downloader-item'");
        pid = devices.eq(0).attr("data-pid"),
        defaultparam = {
            pid : pid,
            v : 2,
            ct :0
        }
    task("getremain", defaultparam);
    task("getsetting",defaultparam);
}
var api = {
  server : "http://homecloud.yuancheng.xunlei.com/",
  getremain :{
    path : "boxSpace",
    method : "get",
    param : {},
    type : "jsonp",
    callback : function(data){
        var json = JSON.parse(data);
        remain = json.space && json.space[0] && json.space[0].remain;
        if(!!defaultpath){
            defaultparam.url = local.download;
            defaultparam.type = 1;
            task("checkurl", defaultparam);
        }
    }
  },
  getsetting : {
    path : "settings",
    method : "get",
    param : {},
    type : "jsonp",
    callback : function(data){
        var json = JSON.parse(data);
        defaultpath = json.defaultPath;
        if(!!remain){
            defaultparam.url = local.download;
            defaultparam.type = 1;
            task("checkurl", defaultparam);
        }
    }
  },
  checkurl : {
    path : "urlCheck",
    method : "get",
    param : {
      url : "",
      type : ""
    },
    type : "jsonp",
    callback : function(data){
      var json = JSON.parse(data),
          tasks = json.taskInfo;
      var size = tasks && tasks.size,
          name = tasks && tasks.name;
      if (size >= remain) {
        return;
      }
      var t = {
        "path":defaultpath,
        "tasks":[]
      };
      t.tasks.push({
                "url":local.download,
                "name":name,
                "gcid":"",
                "cid":"",
                "filesize":size
      });
      defaultparam.json = JSON.stringify(t);
      task("createtask",defaultparam);
    }
  },
  createtask :{
    path : "createTask?pid={pid}&v={v}&ct={ct}",
    method : "post",
    param : {
      json : ""
    },
    type : "text",
    callback : function(data){
      console.log(data);
    }
  }
}
function task(name,params){
  var apis = api[name];
  if (!apis) { return;}
  var url = api.server + apis.path,
      method = apis.method.toUpperCase(),
      type = apis.type,
      callback = apis.callback,
      param = apis.param;
  if (!!params) {
    for (key in params) {
      param[key] = params[key];
    };
  }
  if (!!param) {
    for (key in param) {
      if( url.indexOf("{"+key+"}") > 0){
        url = url.replace("{"+key+"}", param[key]);
      }
    };
  }
  $.ajax({
      type: method,
      url: url,
      data: param,
      //dataType: type,
      success: callback
    });
}
var remain,
    defaultpath,
    local = param(),
    pid,
    defaultparam;
startdownload();