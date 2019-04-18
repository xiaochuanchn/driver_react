$("#account_maneger_page").addClass("select_li")
$("#account_maneger_page img").attr("src", 'images/admin_light.png')

var auth_type = $.cookie(AUTH_TYPE_COOKIE);

var permission = (auth_type === 'CLIENT A')

var change_id = ""

var delete_click = function (sender) {
    if (!permission) {
        alert("permission denied")
        return;
    }
    var user_id = $.cookie(USER_ID_COOKIE);
    var id = sender.getAttribute('user_id');
    if (user_id == id) {
        alert("CANT DELETE YOURSELF")
        return;
    }

    layer.open({
        content:"Are you sure to delete this account?",
        title: "Confirm",
        btn:['Yes','No'],
        yes: function (index, layero) {
            layer.close(index)
            url = 'user/' + id
            $.ajax({
                url: url,
                type: "DELETE",
                success: function (response) {
                    window.location.href = "account_manager"
                }
            })
        }
    })
    

}

var edit_click = function (sender) {
    if (!permission) {
        alert("permission denied")
        return;
    }
    $("#user_name").val(sender.getAttribute('user_name'))
    $("#password").val(sender.getAttribute('password'))
    var id = sender.getAttribute('user_id');
    $("#create_account_title").empty()
    $("#create_account_title").append("EDIT ACCOUNT")
    $("#create_toast").css("visibility", "visible");
    change_id = id;
}

var get_all_user = function () {
    $.post('all_users', {user_id: $.cookie(USER_ID_COOKIE), type: "CLIENT A"}, function (response) {
        var dataArray = response.data;
        create_table(dataArray)
    })
}

var create_table = function (dataArray) {
    var account_container = $("#account_container");


    for (var i = 0; i < dataArray.length; i++) {
        var obj = dataArray[i];
        var line_div = $("<div class='line' id='line" + (i + 1) + "'></div>")
        line_div.appendTo(account_container);
        var p = $("<p class='content_p'>" + (i + 1) + "</p>")
        p.appendTo(line_div);
        var p1 = $("<p class='content_p'>" + "ADMIN" + "</p>")
        p1.appendTo(line_div);
        var p2 = $("<p class='content_p'>" + obj.user + "</p>")
        p2.appendTo(line_div);
        var p3 = $("<p class='content_p'>" + "******" + "</p>")
        p3.appendTo(line_div);
        var p4 = $("<div style='width: 190px;padding-left:10px'><button class='pointer' onclick='edit_click(this)' id='edit' user_id='" + obj._id + "' + user_name='" + obj.user +"' password='" + obj.password + "'>" + "EDIT" + "</button></div>")
        p4.appendTo(line_div);
        var p5 = $("<div style='width: 190px;padding-left:10px'><button class='pointer' onclick='delete_click(this)' id='delete' user_id='" + obj._id + "'>" + "DELETE" + "</button></div>")
        p5.appendTo(line_div);

        var line = $("<div class='line_little'></div>")
        line.appendTo(account_container);
    }
}

get_all_user()

var create_admin_account = function () {
    if (!permission) {
        alert("permission denied")
        return
    }
    $("#create_account_title").empty()
    $("#create_account_title").append("CREATE A NEW ACCOUNT")
    $("#create_toast").css("visibility", "visible");
}

var hidden_toast = function () {
    $("#create_toast").css("visibility", "hidden");
    change_id = ''
}

var creat_account = function () {
    var name = $("#user_name").val();
    var password = $("#password").val();
    var type = "CLIENT A"
    var param = {user: name, password: password, auth_type: type};
    var user_id = change_id
    if (user_id.length > 0) {
        console.log(user_id);
        param.id = user_id
        $.post("update_account", param, function (response) {
            if (!response.success) {
                alert(response.msg)
            }else {
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