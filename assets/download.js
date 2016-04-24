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
    var devices = $("[data-type='downloader-item']");
        pid = local.pid ? local.pid : devices.eq(0).attr("data-pid"),
        defaultparam = {
            pid : pid,
            v : 2,
            ct :0
        }
    task("getremain", defaultparam);
    task("getsetting",defaultparam);
    //迅雷样式
    if (local.pid) {
      try{
        //展开默认设备
        XRD.dispatch("rClickDownloader",pid);
        //弹窗提示
        XRD.dispatch("popNewTaskOkay");
        //刷新任务列表
        XRD.dispatch("rTaskCreated");
      }catch(e){
      }
    }
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
        if(!defaultpath){ defaultpath = "C:/TDDOWNLOAD/";}
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
      var json = JSON.parse(data);
      console.log(json);
      var gettasks = (json && json.tasks) || [];
      // for (var i = 0; i < gettasks.length; i++) {
      //   var everytask = gettasks[i];
      //   alert(everytask.name + result[""+(everytask.result || 65536)]);
      // };
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
var result = {
      "0":"提交失败",
      "202":"重复提交",
      "65536":"提交成功"
    },
    remain,
    defaultpath,
    local = param(),
    pid,
    defaultparam;
startdownload();