$("#account_maneger_page").addClass("select_li")
$("#account_maneger_page img").attr("src", 'images/admin_light.png')

var creat_account = function () {
    var name = $("#user_name").val();
    var password = $("#password").val();
    var type = $("#type").val();

    var param = {user: name, password: password, auth_type: type};
    var user_id = GetQueryString("id");
    if (user_id) {
        console.log(user_id);
        param.id = user_id
        $.post("update_account", param, function (response) {
            if (!response.success) {
                alert(response.msg)
            }else {
                console.log("跳转")
                window.location.href = "account_manager";
            }
        })
    }else {
        $.post("create_account_query", param, function (response) {
            if (!response.success) {
                alert(response.msg)
            }else {
                console.log("跳转")
                window.location.href = "account_manager";
            }
        });
    }
}
