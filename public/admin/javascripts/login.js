
var USER_ID_COOKIE = "User_id_cookie"
var AUTH_TYPE_COOKIE = "Auth_type_cookie"

var loginAct = function () {
    var account = $("#account").val()
    var password = $("#password").val();
    $.post("login/auth", {account: account, password: password}, function (response) {
        console.log(response);
        if (response.success) {
            $.cookie(USER_ID_COOKIE, response.id, {expires: 10});
            $.cookie(AUTH_TYPE_COOKIE, response.auth_type, {expires: 10});
            window.location = "index";
        }else {
            alert(response.msg)
        }
        
    })
}