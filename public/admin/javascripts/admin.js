if ($.cookie(USER_ID_COOKIE) == undefined || 
$.cookie(USER_ID_COOKIE) == "undefined") {
    window.location.href = "login";
}else {
    window.location.href = "index";
}