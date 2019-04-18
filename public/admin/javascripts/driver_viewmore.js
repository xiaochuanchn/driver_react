$("#drver_maneger_page").addClass("select_li")
$("#drver_maneger_page img").attr("src", 'images/driver_light.png')

var driver_name = GetQueryString("user_name")
var phone_number = GetQueryString("phone_number")

$("#driver_title").append(driver_name + " " + phone_number)

function init_data () {
    var user_id = GetQueryString("id");
    $.post("driver_task", {user_id: user_id}, function (result) {
        console.log(result)
        handle_data_to_view(result)
    })
}

function handle_data_to_view (result) {
    var date_array = result.date;
    var handle_array = result.data;
    
    var form_div = $("#form")

    var line_container = $("<div class='line_container_title'></div>")
    line_container.appendTo(form_div)
    var contents = ["NUMBER", 'TASK', 'STATUS', 'START', 'FINISH', 'SPENT TIME'];
    $.each(contents, function (index, content) {
        var content_p = $("<p>" + content + "</p>")
        content_p.appendTo(line_container)
    })

    $.each(date_array, function(index, date_str) {
        var line_black_container = $("<div class='line_black_container'></div>")
        line_black_container.appendTo(form_div)
        var date = new Date(date_str)
        var date_display_str = date.pattern('yyyy-MM-dd')
        var checkins = result.checkins;
        if (checkins == undefined) {
            checkins = []
        }
        var checkin_str = "";
        var checkin_date_str = ""
        for (var k = 0; k < checkins.length; k++) {
            var checkin = checkins[k];
            if (checkin.date === date_str) {
                checkin_str = checkin.locat_str
                checkin_date_str = new Date(checkin.create_date)
                checkin_date_str = checkin_date_str.pattern("HH:mm")
            }
        }
        var contents = [date_display_str, checkin_str, checkin_date_str, ' ', ' ', ' '];
        $.each(contents, function (index, content) {
            var content_p = $("<p>" + content + "</p>")
            content_p.appendTo(line_black_container)
        })

        var task_array = handle_array[date_display_str]
        $.each(task_array, function (index, task_obj) {
            var line_content_container = $("<div class='line_content_container'></div>")
            line_content_container.appendTo(form_div)
            var line = $("<div style='width: 100%; min-height: 1px;background-color: #e4e4e4'></div>")
            line.appendTo(form_div)
            if (index === task_array.length - 1) {
                var checkouts = result.checkouts;
                if (checkouts == undefined) {
                    checkouts = []
                }
                var checkout_object = {};
                for (var k = 0; k < checkouts.length; k++) {
                    var checkout = checkouts[k];
                    if (checkout.date === date_str) {
                        checkout_object = checkout;
                    }
                }
                if (checkout_object.reason != undefined) {
                    var line_checkout = $("<div style='min-height:60px;display:flex;align-items:center' class='line_checkout'><p style='font-size:14px;color:#666;margin-bottom:0px;margin-left:10px'>"  + "Reason:" + checkout_object.reason + "</p></div>")
                    line_checkout.appendTo(form_div)
                }
            }
            var number = index + 1;
            var name = task_obj.name;
            var status = "Pending Assign";
            if (task_obj.status === "1") {
                status = "Assigned"
            }else if (task_obj.status === "2") {
                status = "Delivering"
            }else if (task_obj.status === "3") {
                status = "Finished"
            }
            var start_time = date_with(task_obj.start_date);
            var finish_time = date_with(task_obj.finish_date);
            var date_cha_str = date_cha(task_obj.start_date, task_obj.finish_date);
            var contents_obj = [number, name, status, start_time, finish_time, date_cha_str];
            $.each(contents_obj, function(index, content_str) {
                if (index == 3) {
                    var start_div = $("<div class='location_div'></div>")
                    var content_p = $("<p style='width:100%'>" + content_str + "</p>") 
                    content_p.appendTo(start_div)
                    var content_p_location = $("<p style='width:100%'>" + locat_str_with_obj(task_obj, true) + "</p>") 
                    content_p_location.appendTo(start_div)
                    start_div.appendTo(line_content_container)
                }else if (index == 4) {
                    var end_div = $("<div class='location_div'></div>")
                    var content_p = $("<p style='width:100%'>" + content_str + "</p>") 
                    content_p.appendTo(end_div)
                    var content_p_location = $("<p style='width:100%'>" + locat_str_with_obj(task_obj, false)  + "</p>") 
                    content_p_location.appendTo(end_div)
                    end_div.appendTo(line_content_container)
                }
                else {
                    var content_p = $("<p>" + content_str + "</p>")
                    content_p.appendTo(line_content_container)
                }
                
            })

        })
    })
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


init_data();








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


function string_with (object) {
    if (object == undefined) {
        return "/";
    }else {
        return object
    }
}