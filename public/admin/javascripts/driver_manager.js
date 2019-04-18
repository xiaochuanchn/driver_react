$("#drver_maneger_page").addClass("select_li")
$("#drver_maneger_page img").attr("src", 'images/driver_light.png')

var auth_type = $.cookie(AUTH_TYPE_COOKIE);

var permission = (auth_type === 'CLIENT A')

function get_cars () {
    $.post("get_all_car", {}, function (result) {
        var select = $("#car_plate_number");
        for (var i = 0; i < result.length; i++) {
            var car = result[i]
            var option = $("<option>" + car.plate_number + "</option>")
            option.appendTo(select)
        }
    })
}

get_cars()

function get_dirver_users () {
    $.get('driver_users', {}, function (response) {
        handle_view(response.data);
    });
}

function submit_edt_user () {
    var user = $('#edit_user_name').val()
    var password = $("#edit_password").val()
    var param = {user: user, password:password}
    $.post("update_user", param, function (result) {
        window.location.href = "driver_manager"
    })
}

function onclick_user_name (sender) {
    var user_name = sender.getAttribute("user_name")
    var user = sender.getAttribute("user")
    $("#edit_user_title").empty()
    $("#edit_user_title").append(user_name)
    $("#edit_user_name").val(user)
    $("#edit_password").val("")
    $("#edit_user_password").css("visibility", "visible")
}

function hidden_edit_toast () {
    $("#edit_user_password").css("visibility", "hidden")
}

function handle_view (dataArray) {
    var driver_container = $("#driver_container");

    for (var i = 0; i < dataArray.length; i++) {
        var obj = dataArray[i];
        var line_div = $("<div class='line' id='line" + (i + 1) + "'></div>")
        line_div.appendTo(driver_container);
        var p = $("<p class='content_p' style='cursor:pointer' onclick='onclick_user_name(this)' user=" + obj.user + " user_name=" + obj.user_name + ">" + obj.user_name + "</p>")
        p.appendTo(line_div);
        var p1 = $("<p class='content_p'>" + obj.sex + "</p>")
        p1.appendTo(line_div);
        var p2 = $("<p class='content_p'>" + obj.age + "</p>")
        p2.appendTo(line_div);
        var p3 = $("<p class='content_p'>" + obj.phone_number + "</p>")
        p3.appendTo(line_div);
        var p4 = $("<p class='content_p'>" + obj.car_plate_number + "</p>")
        p4.appendTo(line_div);
        var p5 = $("<div style='width:200px;'><button class='pointer' user_id='" + obj._id + "' name='" + obj.user_name + "' phone_number='" + obj.phone_number + "' onclick='view_more(this)'>" + "VIEW MORE" + "</button></div>")
        p5.appendTo(line_div);

        var line = $("<div class='line_little'></div>")
        line.appendTo(driver_container);
    }

}

get_dirver_users()

var create_driver_account = function () {
    if (!permission) {
        alert("permission denied")
        return;
    }
    $("#create_toast").css("visibility", "visible");
}

var submit_driver_account = function () {
    
    var user_name = $("#user_name").val()
    var sex = $("#sex").val()
    var age = $("#age").val()
    var phone_number = $("#phone_number").val()
    var user = $("#user").val()
    var password = $("#password").val()
    var car_plate_number = $("#car_plate_number").val()

    var param = {
        user_name: user_name,
        sex: sex,
        age: age,
        phone_number: phone_number,
        user: user,
        password: password,
        car_plate_number: car_plate_number
    };
    $.post("create_driver_account", param, function (response) {
        if (!response.success) {
            alert(response.msg)
        }else {
            hidden_toast()
            window.location.href = "driver_manager";
        }
    });

}

var hidden_toast = function() {
    $("#create_toast").css("visibility", "hidden");
}

var view_more = function (sender) {
    var user_id = sender.getAttribute("user_id")
    var name = sender.getAttribute("name")
    var phone_number = sender.getAttribute("phone_number")
    window.location.href = "driver_viewmore?id=" + user_id + "&user_name=" + name + "&phone_number=" + phone_number;
}