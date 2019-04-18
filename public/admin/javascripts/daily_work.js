var page = 1
var filter_name;
var filter_date = {};
var today = new Date()
filter_date.year = parseInt(today.pattern("yyyy"))
filter_date.month = parseInt(today.pattern("M"))
filter_date.date = parseInt(today.pattern('d'))


$("#page_calendar").val("" + filter_date.year + "-" + filter_date.month + "-" + filter_date.date)

var auth_type = $.cookie(AUTH_TYPE_COOKIE);

var permission = (auth_type === 'CLIENT A')

$("#daily_work").addClass("select_li")
$("#daily_work img").attr("src", 'images/work_light.png')
$("#filter_tag").on("keydown", function(event) {
    var keyCode = event.keyCode || event.which;
    if (keyCode == 13) {
        filter_task()
    }
})

$("#filter_tag").bind("input propertychange", function (text) {
    if ($("#filter_tag").val().length === 0) {
        filter_task()
    }
})

var get_tasks = function () {
    if (page == undefined) {
        page = 1;
    }
    var url = "tasks/" + page;
    if (filter_date != undefined || filter_name != undefined) {
        url = url + "?"
        if (filter_date != undefined && filter_name != undefined) {
            var date_str = filter_date.year + "-" + filter_date.month + "-" + filter_date.date
            if (filter_date.month < 10 && filter_date.date < 10) {
                date_str = filter_date.year + "-0" + filter_date.month + "-0" + filter_date.date
            }else if (filter_date.month < 10) {
                date_str = filter_date.year + "-0" + filter_date.month + "-" + filter_date.date
            }else if (filter_date.date < 10) {
                date_str = filter_date.year + "-" + filter_date.month + "-0" + filter_date.date
            }
            var date = new Date(date_str)
            url = url + "filter_name=" + encodeURI(filter_name) + "&" + "filter_date=" + date.pattern('yyyy-MM-dd');
        }else {
            if (filter_date != undefined) {
                var date_str = filter_date.year + "-" + filter_date.month + "-" + filter_date.date
                if (filter_date.month < 10 && filter_date.date < 10) {
                    date_str = filter_date.year + "-0" + filter_date.month + "-0" + filter_date.date
                }else if (filter_date.month < 10) {
                    date_str = filter_date.year + "-0" + filter_date.month + "-" + filter_date.date
                }else if (filter_date.date < 10) {
                    date_str = filter_date.year + "-" + filter_date.month + "-0" + filter_date.date
                }
                var date = new Date(date_str)
                url = url + "filter_date=" + date.pattern('yyyy-MM-dd');
            }else {
                url = url + "filter_name=" + encodeURI(filter_name);
            }
        }
    }
    $.get(url, function (result) {
        handle_data(result)
    })
}

function string_with (object) {
    if (object == undefined) {
        return "/";
    }else {
        return object
    }
}

function date_with (object) {
    if (object == undefined) {
        return "/";
    }else {
        var date = new Date(object);
        var hour = date.getHours();
        if (hour < 10) {
            hour = "0" + hour
        }
        var minutes = date.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes
        }
        var date_string = hour + ":" + minutes;
        return date_string;
    }
}

function date_cha (start_date, finish_date) {
    if (start_date == undefined || finish_date === undefined) {
        return "/"
    }
    var start = new Date(start_date);
    var finish = new Date(finish_date)
    var ms = finish.getTime() - start.getTime()
    var hour = Math.floor(ms / 1000 / 3600);
    if (hour < 10) {
        hour = "0" + hour
    }
    var minutes = Math.floor(ms / 1000 % 3600 / 60);
    if (minutes < 10) {
        minutes = "0" + minutes
    }
    return hour + ":" + minutes
}

var filter_task = function () {
    var filter_name1 = $("#filter_tag").val()
    filter_name = filter_name1;
    if (filter_name1 == undefined || filter_name1.length == 0) {
        filter_name = undefined;
    }
    page = 1;
    get_tasks();
}


var handle_data = function (result) {
    var task_form = $("#task_form");
    var dataArray = result.result;
    var all_page = result.all_page;
    task_form.empty()
    append_title_line()
    for (var i = 0; i < dataArray.length; i++) {
        var line_div = $("<div class='line' id='line" + (i + 1) + "'></div>")
        line_div.appendTo(task_form);
        var obj = dataArray[i]
        var p = $("<p class='content_p'>" + (i + 1) + "</p>") 
        p.appendTo(line_div)
        var p1 = $("<p class='content_p'>" + string_with(obj.name) + "</p>") 
        p1.appendTo(line_div)
        var p2 = $("<p class='content_p' title='" + obj.phone_number + "'>" + string_with(obj.driver_name) + "</p>") 
        p2.appendTo(line_div)
        var status = "Pending Assign";
        var click_enable = true;
        if (obj.status === "1") {
            click_enable = false
            status = "Assigned"
        }else if (obj.status === "2") {
            click_enable = false
            status = "Delivering"
        }else if (obj.status === "3") {
            click_enable = false
            status = "Finished"
        }

        var p3 = $("<p class='content_p'>" + status + "</p>") 
        if (click_enable && permission) {
            var date = new Date(obj.date);
            var date_string = date.pattern("yyyy-MM-dd")
            p3 = $("<p class='click_status content_p' onclick='daily_work_assign(this)' id='click_status' task_date='" + date_string + "' daily_work_id='" + obj._id + "'>" + status + "</p>")
        }
        p3.appendTo(line_div)
        var p4 = $("<div class='content_div'><p class='content_p' style='width:100%;margin-left:0px'>" + date_with(obj.start_date) + "</p><p class='content_p' style='width:100%;margin-left:0px'>" + locat_str_with_obj(obj, true) + "</p></div>")
        p4.appendTo(line_div)
        var p5 = $("<div class='content_div'><p class='content_p' style='width:100%;margin-left:0px'>" + date_with(obj.finish_date) + "</p><p class='content_p' style='width:100%;margin-left:0px'>" + locat_str_with_obj(obj, false) + "</p></div>")
        p5.appendTo(line_div)
        
        var p6 = $("<p class='content_p'>" + date_cha(obj.start_date, obj.finish_date) + "</p>") 
        p6.appendTo(line_div)
        var p7 = $("<p style='width:8%;cursor:pointer' class='content_p' task_id='" + obj._id + "' onclick='delete_task(this)'>" + "Delete" + "</p>") 
        p7.appendTo(line_div)

        var line_little = $("<div class='line_little'></div>")
        line_little.appendTo(task_form)
    }
    var pages_view = $("#pages");
    pages_view.empty()
    for (var i = 0; i < all_page; i++) {
        
        var p_tag = $("<p onclick='click_page(this)' page='" + (i + 1) + "'>" + (1 + i) + "</p>")
        if (page == undefined) {
            page = 1;
        }
        if (i == page - 1) {
            p_tag = $("<p class='select_p'>" + (i + 1) +"</p>")
        }
        p_tag.appendTo(pages_view);
    }
}

function locat_str_with_obj(task_obj, start) {
    if (start) {
        if (task_obj.start_location != undefined) {
            return task_obj.start_location.locat_str?task_obj.start_location.locat_str:""
        }else {
            return ""
        }
    }else {
        if (task_obj.finish_location != undefined) {
            return task_obj.finish_location.locat_str?task_obj.finish_location.locat_str:""
        }else {
            return ""
        }
    }
}

var append_title_line = function () {
    var task_form = $("#task_form");
    var line_div = $("<div class='line title_line'></div>")
    line_div.appendTo(task_form);
    var p = $("<p>" + "No" + "</p>") 
    p.appendTo(line_div)
    var p1 = $("<p>" + "Tasks" + "</p>") 
    p1.appendTo(line_div)
    var p2 = $("<p>" + "DRIVER" + "</p>") 
    p2.appendTo(line_div)
    var p3 = $("<p>" + "Status" + "</p>") 
    p3.appendTo(line_div)
    var p4 = $("<p>" + "Start time"+ "</p>") 
    p4.appendTo(line_div)
    var p5 = $("<p>" + "Finish time" + "</p>") 
    p5.appendTo(line_div)
    var p6 = $("<p>" + "Spent hour" + "</p>") 
    p6.appendTo(line_div)
    var p7 = $("<p style='width:8%'>" + "Delete" + "</p>") 
    p7.appendTo(line_div)

    var line_little = $("<div class='line_little'></div>")
    line_little.appendTo(task_form)
}

get_tasks()

click_page = function (sender) {
    var page1 = parseInt(sender.getAttribute('page'))
    console.log("点击野马   " + page1);
    console.log(sender);
    page = page1;
    get_tasks()
}


var add_task_act = function () {
    if (!permission) {
        alert("permission denied")
        return;
    }
    var task_date = $("#task_date")
    var date_str = new Date()
    date_str = date_str.pattern("yyyy-MM-dd")
    task_date.val(date_str)
    $("#create_toast").css("visibility", "visible");
}

var hidden_toast = function () {
    $("#create_toast").css("visibility", "hidden");
}

var delete_task = function (sender) {
    layer.open({
        content:"Are you sure to delete this task?",
        title: "Confirm",
        btn:['Yes','No'],
        yes: function (index, layero) {
            layer.close(index)
            var id = sender.getAttribute("task_id");
            $.post("delete_task", {task_id: id}, function (result) {
                get_tasks()
            })
        }
    })
   
}

var hidden_toast_assign = function () {
    $("#create_toast_assign").css("visibility", "hidden");
}

var submit_task_data_assign = function () {
    var select = $("#selct_box");
    var select_value = select.val()
    var select_id = select.find("option:selected").attr("user_id")
    var task_id = select.find("option:selected").attr("task_id")
    var phone_number = select.find("option:selected").attr("phone_number")
    $.post("task_assign", {user_id: select_id, id: task_id, driver_name: select_value, phone_number: phone_number}, function (result) {
        get_tasks()
        hidden_toast_assign()
    })
}

var submit_task_data = function () {
    var task_name = $("#task_name").val()
    var task_date = $("#task_date").val();
    $.post("add_task", {name: task_name, date: task_date}, function (response) {
        if (response.success) {
            hidden_toast()
            window.location.href = "daily_work";
        }else {
            alert(response.msg)
        }
    })
}


var daily_work_assign = function (sender) {
    var id = sender.getAttribute('daily_work_id');
    var date_str = sender.getAttribute('task_date')
    $("#driver_date").empty().append("AVAILABLE DRIVER ON " + date_str)
    var url = "driver_users" + "?driver_date=" + date_str
    $.get(url, {}, function (response) {
        var dataArray = response.data;
        
        var select = $("#selct_box")
        select.empty()
        for (var i = 0; i < dataArray.length; i++) {
            var obj = dataArray[i];
            var option = $("<option phone_number='" + obj.phone_number + "' task_id='" + id + "' user_id='" + obj._id + "'>" + obj.user_name +"</option>")
            console.log(obj.user_name);
            option.appendTo(select);
        }
        $("#create_toast_assign").css("visibility", "visible");
    });
    


}
laydate.render({
    elem: "#page_calendar",
    done: function (value, date) {
        filter_date = date;
        if (date.year == undefined) {
            filter_date = undefined;
        }
        get_tasks()
    }
})
laydate.render({
    elem: "#task_date",
    done: function (value, date) {
        if (date.year == undefined) {
            $("#task_date").text("CALENDAR")
        }
    }
})




