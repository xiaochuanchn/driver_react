
$("#accident").addClass("select_li")
$("#accident img").attr("src", 'images/leave_record_light.png')

var page = 1;

var init_data = function () {
    $.post("accident", {page: page}, function (result) {
        console.log(result)
        handle_data_array(result.result)
        handle_page(result.all_page)
    })
}

function append_title_line () {
    var line_title = $("<div class='line_title'></div>")
    var titles = ['Vehicle No.', 'Location', 'Date/Time', 'Description', 'Driver Name'];
    $.each(titles, function (index, titls) {
        var content_p = $("<p>" + titls + "</p>");
        content_p.appendTo(line_title)
    })
    line_title.appendTo(form)
}

function handle_data_array (accidents) {
    var form = $("#form")
    form.empty()
    append_title_line(form)
    $.each(accidents, function (index, accident) {
        var line_content = $("<div class='line_content'></div>")
        line_content.appendTo(form)
        append_detail_data_to_line(line_content, accident);
        var line = $("<div class='line'></div>")
        line.appendTo(form)
    })
}

function append_detail_data_to_line (line_content, accident) {
    var vehicle_no = accident.header.car_plate_number
    var location = accident.location
    var date = accident.date
    var description = accident.description
    var driverName = accident.header.driver_name

    var contents = [vehicle_no, location, date, description, driverName]
    
    $.each(contents, function (index, content) {
        var content_p = $("<p>" + content + "</p>")
        content_p.appendTo(line_content)
    })
}



function handle_page (all_page) {
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


var click_page = function (sender) {
    var page_click = sender.getAttribute('page')
    page_click = parseInt(page_click);
    page = page_click;
    init_data()
    
}
