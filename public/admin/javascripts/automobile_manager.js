

$("#automobile_management").addClass("select_li")
$("#automobile_management img").attr("src", 'images/car_light.png')

var auth_type = $.cookie(AUTH_TYPE_COOKIE);
var permission = auth_type === 'CLIENT A'


$("#select_box").change(function () {
    var option = $("#select_box option:selected")
    month = parseInt(option.val())
    init_data()
})

var page = 1;
type = 0;
var fuel_page = 1;
var date = new Date()
var month = parseInt(date.pattern("M"));



$("#input_top").on("keydown", function(event) {
    var keyCode = event.keyCode || event.which;
    if (keyCode == 13) {
        init_data()
    }
})

$("#input_top").bind("input propertychange", function (text) {
    if ($("#input_top").val().length === 0) {
        init_data()
    }
})

function handle_select_box_default () {
    var date = new Date()
    var month = parseInt(date.pattern("M"));
    $("#select_box option").each(function (index, option) {
        if (index === month - 1) {
            option.selected = true;
        }
    })
}

handle_select_box_default()


var init_data = function () {
    var param = {page: page};
    var plate_number = $("#input_top").val()
    if (plate_number.length > 0) {
        param.plate_number = plate_number;
    }
    $.post("automobiles", param, function (result) {
        handle_result(result.result)
        insert_page_container(result.all_page)
    })
}

var handle_result = function (data_array) {
    var form = $("#form")
    form.empty()
    insert_title_line(form)
    insert_content_line(form, data_array)
}


var insert_title_line = function (form) {
    var line_title = $("<div class='line_title'></div>")

    var p_brand = $("<p>BRAND</p>") 
    p_brand.appendTo(line_title)

    var p_type = $("<p>TYPE</p>") 
    p_type.appendTo(line_title)

    var p_plate_number = $("<p>PLATE NUMBER</p>") 
    p_plate_number.appendTo(line_title)

    var fuel_div = $("<div style='display:flex;flex-direction:row;align-items:center;height:46px;width:12.5%;margin-left:10px'><span style='font-size:12px'>FUEL CONSUMPTION</span><span style='color: #999;font-size:12px;margin-top:2px'>(Monthly)</span></div>")
    fuel_div.appendTo(line_title)

    var p_service = $("<p>SERVICE DUE DATE</p>") 
    p_service.appendTo(line_title)

    var p_edit = $("<p>EDIT</p>") 
    p_edit.appendTo(line_title)

    var p_view = $("<p>VIEW</p>") 
    p_view.appendTo(line_title)

    var p_export = $("<p>EXPORT</p>") 
    p_export.appendTo(line_title)

    line_title.appendTo(form)
}


var insert_content_line = function (form, data_array) {

    $.each(data_array, function (index, car_object) {
        var content_line = $("<div class='content_line'></div>")
        content_line.appendTo(form)
        insert_content_to_content_line(content_line, car_object)
        var line = $("<div style='min-height: 1px;background-color:#f7f7f7;width: 100%'></div>")
        line.appendTo(form)
        
    })
}

var insert_content_to_content_line = function (content_line, car_object) {
    var brand = car_object.brand;
    var type = car_object.type;
    var plate_number = car_object.plate_number;
    var fuel = car_object.total_amount + " L";
    var create_date = new Date(car_object.service_due_date);
    create_date = create_date.pattern("yyyy-MM-dd")
    if (car_object.service_due_date === undefined) {
        create_date = ""
    }
    var edit = "Edit";
    var view = "View";
    var export_str = "Export";

    var content_array = [brand, type, plate_number, fuel, create_date, edit, view, export_str];
    var clicks = ['edit_act(this)', 'view_act(this)', 'export_act(this)'];
    $.each(content_array, function (index, content_str) {
        var p = $("<p>" + content_str + "</p>")
        if (index === 4) {
            var id = 'service_due_date' + car_object._id
            p = $("<input readonly placeholder='/' style='cursor:pointer;outline-style:none;border-style:solid;border-width:0px;width: 12.5%;margin-left: 10px;color: #666;font-size: 14px;' id='" + id +"' value='" + content_str + "'></input>")
            
        }
        if (index === 5 || 
            index === 6 ||
            index === 7) {
                var click = clicks[index - 5];
                p = $("<p onclick='" + click + "' style='cursor: pointer' brand='" + car_object.brand +"' type='" + car_object.type + "' plate_number='" + car_object.plate_number + "' car_id='" + car_object._id + "' driver_name='" + car_object.user_name +  "'>" + content_str + "</p>")
            }
        p.appendTo(content_line)
        
        laydate.render({
            elem: "#service_due_date"  + car_object._id,
            done: function (value, date) {
                update_car_object(value, car_object._id)
            }
        })
    })
    
}


function insert_page_container (all_page) {
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


function update_car_object (date, car_id) {
    var param = {car_id: car_id, service_due_date: date}
    $.post('update_car', param, function (result) {
        init_data()
    })
}

function init_fuel_location_data () {
    $.post("automobiles_fuel_location", {page: fuel_page}, function (result) {
        handle_location_result(result.result)
        insert_location_page_container(result.all_page)
    })
}


var handle_location_result = function (data_array) {
    var form = $("#form")
    form.empty()
    insert_locatin_title_line(form)
    insert_location_content_line(form, data_array)
}


var insert_locatin_title_line = function (form) {
    var line_title = $("<div class='line_title'></div>")

    var p_brand = $("<p style='width:300px'>LOCATION</p>") 
    p_brand.appendTo(line_title)

    var p_type = $("<p style='width:300px'>CREATE DATE</p>") 
    p_type.appendTo(line_title)

    var p_plate_number = $("<p style='width:300px'>EDIT</p>") 
    p_plate_number.appendTo(line_title)

    var p_service = $("<p style='width:300px'>DELETE</p>") 
    p_service.appendTo(line_title)


    line_title.appendTo(form)
}


var insert_location_content_line = function (form, data_array) {

    $.each(data_array, function (index, location_object) {
        var content_line = $("<div class='content_line'></div>")
        content_line.appendTo(form)
        insert_location_content_to_content_line(content_line, location_object)
        var line = $("<div style='height: 1px;background-color:#f7f7f7;width: 100%'></div>")
        line.appendTo(form)
    })
}

var insert_location_content_to_content_line = function (content_line, location_object) {
    var location = location_object.location;
    var create_date = new Date(location_object.create_date);
    create_date = create_date.pattern("dd/MM/yyyy")
    var edit = "Edit";
    var delete_str = "Delete";

    var content_array = [location, create_date, edit, delete_str];
    var clicks = ['edit_location_act(this)', 'delete_fuel_act(this)'];
    $.each(content_array, function (index, content_str) {
        var p = $("<p style='width:300px'>" + content_str + "</p>")
        if (index === 2 || 
            index === 3) {
                var click = clicks[index - 2];
                p = $("<p onclick='" + click + "' style='cursor: pointer;width:300px' location_id='" + location_object._id + "' location='" + location_object.location + "'>" + content_str + "</p>")
            }
        p.appendTo(content_line)
    })
}



function insert_location_page_container (all_page) {
    var form = $("#form")
    var page_container = $("<div class='page_container'></div>")
    page_container.appendTo(form)

    for (var i = 0; i < all_page; i++) {
        var page_p = $("<p onclick='click_page(this)' page='" + (1 + i) + "'>" + (1 + i) + "</p>");
        if (i === (fuel_page - 1)) {
            var page_p = $("<p onclick='click_page(this)' page='" + (1 + i) + "' class='select_page'>" + (1 + i) + "</p>");
        }
        page_p.appendTo(page_container)
    }
}







function click_page (sender) {
    var page_click = sender.getAttribute('page')
    page_click = parseInt(page_click);
    if (type == 0) {
        page = page_click;
        init_data();
    }else if (type == 1) {
        fuel_page = page_click;
        init_fuel_location_data()
    }
}
var edit_act = function (sender) {
    if (!permission) {
        alert("permission denied")
        return;
    }
    var car_id = sender.getAttribute("car_id")
    var brand = sender.getAttribute("brand")
    var type = sender.getAttribute("type")
    var plate_number = sender.getAttribute("plate_number")
    $("#create_car_title").empty()
    $("#create_car_title").append("EDIT PLATE NUMBER")
    $("#add_new").css("visibility", "visible")
    $("#brand").val(brand)
    $("#type").val(type)
    $("#plate_number").val(plate_number)
    $("#add_new").attr('edit', true);
    $("#add_new").attr('car_id', car_id);
}

function edit_location_act  (sender){
    if (!permission) {
        alert("permission denied")
        return;
    }
    var location_id = sender.getAttribute("location_id")
    var location = sender.getAttribute("location")
    $("#location").val(location)
    $("#add_new_fuel_loction").attr('edit', true);
    $("#add_new_fuel_loction").attr('location_id', location_id);
    $("#create_fuel_location_title").empty()
    $("#create_fuel_location_title").append("EDIT LOCATION")
    $("#add_new_fuel_loction").css("visibility", "visible")

}

function delete_fuel_act (sender) {
    if (!permission) {
        alert("permission denied")
        return;
    }
    layer.open({
        content:"Are you sure to delete this fuel location?",
        title: "Confirm",
        btn:['Yes','No'],
        yes: function (index, layero) {
            layer.close(index)
            var location_id = sender.getAttribute("location_id")
            $.post("delete_location", {id: location_id}, function (result) {
                init_fuel_location_data()
            })
        }
    })
    
}


function view_act (sender) {
    var car_id = sender.getAttribute("car_id")
    var car_brand = sender.getAttribute("brand")
    var car_type = sender.getAttribute("type")
    var plate_number = sender.getAttribute("plate_number")
    var driver_name = sender.getAttribute("driver_name")
    window.location.href = 'fuel_record?id=' + car_id + "&brand=" + car_brand + "&type=" + car_type + "&plate_number=" + plate_number + '&driver_name=' + driver_name

}

function export_act (sender) {
    if (!permission) {
        alert("permission denied")
        return;
    }

    var brand = sender.getAttribute("brand")
    var type = sender.getAttribute("type")
    var plate_number = sender.getAttribute("plate_number")
    var car_id = sender.getAttribute("car_id")
    $.post("fuel_all_records", {car_id: car_id, month: month}, function (result) {
        var title = ["AMOUNT", "DRIVER", "DATE", "LOCATION"]
        var datas = []
        
        for (var i = 0; i < result.length; i++) {
            var obj = result[i];
            var object = {}
            object.AMOUNT = obj.amount;
            object.DRIVER = obj.driver_name;
            var date = new Date(obj.create_date)
            object.DATE = date.pattern("MM/dd/yyyy")
            console.log(obj)
            if (obj.location != undefined) {
                object.LOCATION = obj.location.location
            }else if(obj["location[location]"] != undefined) {
                object.LOCATION = obj["location[location]"]
            }
            else {
                object.LOCATION = ""
            }
            datas.push(object);
            
        }
        JSONToExcelConvertor(datas, brand + " " + type + " " + plate_number + " fuel_record")
    })
}

function fuel_location_act () {
    var moblile_title = $("#mobile_title");
    var fuel_title = $("#fuel_title")
    var select_top = $("#select_box");
    var input_top = $("#input_top")
    moblile_title.css("color", "#ccc")
    fuel_title.css("color", "#444");
    select_top.css('visibility', "hidden")
    input_top.css('visibility', "hidden")
    $("#search_image").css('visibility', "hidden")
    type = 1;
    page = 1;
    fuel_page = 1;
    init_fuel_location_data()
}

function mobile_act () {
    var moblile_title = $("#mobile_title");
    var fuel_title = $("#fuel_title")
    var select_top = $("#select_box");
    var input_top = $("#input_top")
    moblile_title.css("color", "#444")
    fuel_title.css("color", "#ccc");
    select_top.css('visibility', "visible")
    input_top.css('visibility', "visible")
    $("#search_image").css('visibility', "visible")
    type = 0
    page = 1;
    fuel_page = 1;
    init_data()
}

function add_new_act () {
    if (!permission) {
        alert("permission denied")
        return;
    }
    $('#brand').val("")
    $("#type").val("")
    $("#plate_number").val("");
    $("#location").val("")
    if (type == 1) {
        $("#create_fuel_location_title").empty()
        $("#create_fuel_location_title").append("ADD NEW LOCATION")
        $("#add_new_fuel_loction").css("visibility", "visible")
    }else {
        $("#create_car_title").empty()
        $("#create_car_title").append("ADD NEW PLATE NUMBER")
        $("#add_new").css("visibility", "visible")
    }
    
}

function dismiss_add_new_container () {
    $("#add_new").css("visibility", "hidden")
    $("#add_new_fuel_loction").css("visibility", "hidden")
    $("#add_new").attr('edit', false);
    $("#add_new").attr('car_id', '');
    $("#add_new_fuel_loction").attr('edit', false);
    $("#add_new_fuel_loction").attr('location_id', '');
}

function submit_new_car_info () {
    var brand = $('#brand').val()
    var type = $("#type").val();
    var plate_number = $("#plate_number").val();
    if (brand == undefined || brand.length == 0 ||
        type == undefined || type.length == 0 || 
        plate_number == undefined || plate_number.length == 0) {
            alert('PLEASE INPUT COMPLETE');
            return;
    }
    var param = {brand: brand, type: type, plate_number: plate_number}
    if ($("#add_new").attr('edit') === 'true') {
        param.car_id = $("#add_new").attr('car_id')
    }
    $.post('add_car', param, function (result) {
        if (result.success) {
            dismiss_add_new_container()
            init_data()
        }else {
            alert(result.msg)
        }
        
    })
}

function submit_new_location_info () {
    var location = $('#location').val()
    if (location.length == 0) {
        alert('PLEASE INPUT COMPLETE');
        return;
    }

    var param = {location: location};
    if ($("#add_new_fuel_loction").attr('edit') === 'true') {
        param.location_id = $("#add_new_fuel_loction").attr('location_id')
    }
    $.post('add_location', param, function (result) {
        dismiss_add_new_container()
        init_fuel_location_data();
    })
}





function JSONToExcelConvertor(JSONData, filename) {  
    var ws = XLSX.utils.json_to_sheet(JSONData)
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "People");
    XLSX.writeFile(wb, filename + ".xlsx");

}  