$("#automobile_management").addClass("select_li")
$("#automobile_management img").attr("src", 'images/car_light.png')

var month = parseInt(GetQueryString("month"))

var page = 1


function init_data () {
    var brand = GetQueryString("brand");
    var type = GetQueryString("type")
    $("#record_title").empty()
    $("#record_title").append('FUEL CONSUMOTION RECORD/' + brand + ' ·' + type)
    var car_id = GetQueryString("id")
    var param = {page: page,car_id:car_id}
    $.post("fuel_records", param, function (result) {
        console.log(result)
        handle_data_array(result.result)
        handle_page(result.all_page)
    })
}

init_data ();

var append_title_line = function (form) {
    var line_title = $("<div class='line_title'></div>")
    var titles = ['NUMBER', 'AMOUNT', 'DRIVER', "LOCATION", 'DATE'];
    $.each(titles, function (index, titls) {
        var content_p = $("<p>" + titls + "</p>");
        content_p.appendTo(line_title)
    })
    line_title.appendTo(form)
}


var handle_data_array = function (fuel_array) {
    var form = $("#form")
    form.empty()
    append_title_line(form)
    $.each(fuel_array, function (index, fuel_object) {
        var line_content = $("<div class='line_content'></div>")
        line_content.appendTo(form)
        append_detail_data_to_line(line_content, fuel_object, index + 1);
        var line = $("<div class='line'></div>")
        line.appendTo(form)
    })
}

var append_detail_data_to_line = function (line_content, fuel_object, index) {
    var date = new Date(fuel_object.create_date)
    var location = fuel_object["location[location]"]
    if (location == undefined) {
        location = fuel_object.location.location
    }
    var contents = [index, fuel_object.amount + ' L', fuel_object.driver_name,location, date.pattern("MM/dd/yyyy")];
    $.each(contents, function (index, content) {
        var content_p = $("<p>" + content + "</p>");
        content_p.appendTo(line_content)
    })
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







function click_page (sender) {
    var page_click = sender.getAttribute('page')
    page_click = parseInt(page_click);
    page = page_click;
    init_data()
}


function submit_new_record () {
    var plate_number = $("#plate_number").val();
    var car_id = GetQueryString("id");
    var amount = $("#amount").val()
    var driver_name = GetQueryString("driver_name")

    var create_date = $("#location_select :selected").attr("create_date")
    var location = $("#location_select :selected").text()
    var _id = $("#location_select :selected").attr("_id")

    var location_object = {location: location, _id: _id, create_date: create_date}
    var param = {car_id: car_id, plate_number: plate_number, amount: amount, driver_name: driver_name}
    param.location = location_object;
    $.post("add_fuel_record", param, function (result) {
        dismiss_add_new_container()
        init_data()
    })
}


function add_new_act () {
    $.post("all_fuel_locations", function (result) {
        console.log(result)
        if (result != undefined) {
            var select = $("#location_select");
            select.empty()
            $.each(result, function (index, location_object) {
                $("#add_new").css("visibility", "visible")
                var plate_number = GetQueryString("plate_number");
                $("#plate_number").val(plate_number)
                var option = $("<option location=" + location_object.location + " create_date=" + location_object.create_date + " _id=" + location_object._id + ">" + location_object.location + "</option>")
                option.appendTo(select)
            })
        }else {
            $("#add_new").css("visibility", "visible")
            var plate_number = GetQueryString("plate_number");
            $("#plate_number").val(plate_number)
        }
    })
    
}

function dismiss_add_new_container () {
    $("#add_new").css("visibility", "hidden")
    $("#plate_number").val("")
    $("#amount").val("")
}
function onlyNum(that){
    that.value=that.value.replace(/\D/g,"");
}