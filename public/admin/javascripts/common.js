var USER_ID_COOKIE = "User_id_cookie"
var AUTH_TYPE_COOKIE = "Auth_type_cookie"
if (($.cookie(USER_ID_COOKIE) == undefined || 
    $.cookie(USER_ID_COOKIE) == "undefined") &&
    window.location.href != "login") {
        console.log(window.location.href);
        window.location.href = "login";
}


var account_maneger_page = function () {
    window.location.href = "./account_manager";
}

var daily_work = function () {
    var href = window.location.href;
    if (href.split("/").pop() === "daily_work") {
        return
    }
    window.location.href = "./daily_work";
}

var driver_manager_page = function () {
    window.location.href = "./driver_manager";
}

var sign_out = function () {
    $.cookie(USER_ID_COOKIE, undefined);
    window.location.href = "./";
}

var leave_record = function () {
    window.location.href = "./leave_record";
}

var automobile_manager = function () {
    window.location.href = "./automobile_manager"
}

var accident = function () {
    window.location.href = "./accident"
}


var client_maneger_page = function () {
    window.location.href = "./client_manager"
}

if ($.cookie(AUTH_TYPE_COOKIE) == 'CLIENT B') {
    daily_work()
}











Date.prototype.pattern=function(fmt) {         
    var o = {         
    "M+" : this.getMonth()+1, //月份         
    "d+" : this.getDate(), //日         
    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时         
    "H+" : this.getHours(), //小时         
    "m+" : this.getMinutes(), //分         
    "s+" : this.getSeconds(), //秒         
    "q+" : Math.floor((this.getMonth()+3)/3), //季度         
    "S" : this.getMilliseconds() //毫秒         
    };         
    var week = {         
    "0" : "/u65e5",         
    "1" : "/u4e00",         
    "2" : "/u4e8c",         
    "3" : "/u4e09",         
    "4" : "/u56db",         
    "5" : "/u4e94",         
    "6" : "/u516d"        
    };         
    if(/(y+)/.test(fmt)){         
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));         
    }         
    if(/(E+)/.test(fmt)){         
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);         
    }         
    for(var k in o){         
        if(new RegExp("("+ k +")").test(fmt)){         
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));         
        }         
    }         
    return fmt;         
}    

function GetQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}



