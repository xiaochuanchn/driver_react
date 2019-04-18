
$("#leave_record").addClass("select_li")
$("#leave_record img").attr("src", 'images/leave_record_light.png')
var page = 1;
var auth_type = $.cookie(AUTH_TYPE_COOKIE);

var permission = (auth_type === 'CLIENT A')

var init_data = function () {
    $.post("leave_records", {page: page}, function (result) {
        handle_data_array(result.result)
        handle_page(result.all_page)
    })
}

var handle_data_array = function (leave_array) {
    var form = $("#form")
    form.empty()
    append_title_line(form)

    $.each(leave_array, function (index, leave_object) {
        var line_content = $("<div class='line_content'></div>")
        line_content.appendTo(form)
        append_detail_data_to_line(line_content, leave_object);
        var line = $("<div class='line'></div>")
        line.appendTo(form)
    })
}

var append_detail_data_to_line = function (line_content, leave_object) {
    var start_date = new Date(leave_object.start_date)
    var end_date = new Date(leave_object.end_date)
    var start_date_str = start_date.pattern('MM/dd/yyyy');
    var end_date_str = end_date.pattern('MM/dd/yyyy');
    var days = days_with(start_date, end_date)
    var status = "Pending";
    if (leave_object.status === "1") {
        status = "Approved";
    }else if (leave_object.status === '-1') {
        status = "Declined";
    }
    var contents = [leave_object.user_name, start_date_str + "-" + end_date_str, days + ' Day(s)', leave_object.reason, status];
    $.each(contents, function (index, content) {
        var content_p = $("<p>" + content + "</p>");
        content_p.appendTo(line_content)
    })
    var action_div = $("<div class='action_div'><button onclick='decline_act(this)' leave_id=" + leave_object._id + ">Decline</button><button onclick='approval_act(this)' leave_id=" + leave_object._id + " style='margin-left: 10px'>Approve</button></div>");
    if (leave_object.status != '0') {
        action_div = $("<div style='visibility: hidden' class='action_div'><button onclick='decline_act(this)' leave_id=" + leave_object._id + ">Decline</button><button onclick='approval_act(this)' leave_id=" + leave_object._id + " style='margin-left: 10px'>Approve</button></div>");
    }
    action_div.appendTo(line_content)
}

var append_title_line = function (form) {
    var line_title = $("<div class='line_title'></div>")
    var titles = ['NAME', 'LEAVE DATE', 'LEAVE DAYS', 'REASON', 'STATUS', 'ACTION'];
    $.each(titles, function (index, titls) {
        var content_p = $("<p>" + titls + "</p>");
        content_p.appendTo(line_title)
    })
    line_title.appendTo(form)
}

var handle_page = function (all_page) {
    var form = $("#form")
    var page_container = $("<div class='page_container'></div>")
    page_container.appendTo(form)

    for (var i = 0; i < all_page; i++) {
        var page_p = $("<p onclick='click_page(this)' page='" + (1 + i) + "'>" + (1 + i) + "</p>");
        if (i === (page - 1)) {
            var page_p = $("<p onclick='click_page(this)' page='" + (1 + i) + "' class='select_page'>" + (1 + i) + "</p>");
        }
        page_p.appendTo(page_container)
    }

    
}




init_data()


var decline_act = function (sender) {
    if (!permission) {
        alert("permission denied")
        return;
    }
    var leave_id = sender.getAttribute('leave_id')
    $.post('approval', {leave_id: leave_id, status: "-1"}, function (result) {
        init_data()
    })
}

var approval_act = function (sender) {
    if (!permission) {
        alert("permission denied")
        return;
    }
    var leave_id = sender.getAttribute('leave_id')
    $.post('approval', {leave_id: leave_id, status: "1"}, function (result) {
        init_data()
    })
}

var click_page = function (sender) {
    var page_click = sender.getAttribute('page')
    page_click = parseInt(page_click);
    page = page_click;
    init_data()
    
}







var days_with = function (start_date, end_date) {
    var time_cha = (end_date.getTime() - start_date.getTime()) / 1000
    var day =  time_cha / 3600 / 24;
    return day + 1
}