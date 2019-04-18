var express = require('express')
var router = express.Router()
var MongoUtil = require('../utils/mongo_util')
var md5 = require("md5")


router.get("/", function (request, response) {
    var is_client_account = false
    if (request.cookies && request.cookies.Auth_type_cookie === "CLIENT A") {
        is_client_account = true
    }
    response.render("admin", {is_client_account: is_client_account});
})

router.get("/accident", function (request, response) {
    var is_client_account = false
    if (request.cookies && request.cookies.Auth_type_cookie === "CLIENT A") {
        is_client_account = true
    }
    response.render("accident", {is_client_account: is_client_account})
})





router.get("/driver_manager", function (request, response) {
    var is_client_account = false
    if (request.cookies && request.cookies.Auth_type_cookie === "CLIENT A") {
        is_client_account = true
    }
    response.render("driver_manager", {is_client_account: is_client_account});
}) 

router.get("/fuel_record", function (request, response) {
    var is_client_account = false
    if (request.cookies && request.cookies.Auth_type_cookie === "CLIENT A") {
        is_client_account = true
    }
    response.render('fuel_record', {is_client_account: is_client_account})
})

router.get("/leave_record", function (request, response) {
    var is_client_account = false
    if (request.cookies && request.cookies.Auth_type_cookie === "CLIENT A") {
        is_client_account = true
    }
    response.render("leave_record", {is_client_account: is_client_account});
})
router.get("/automobile_manager", function (request, response) {
    var is_client_account = false
    if (request.cookies && request.cookies.Auth_type_cookie === "CLIENT A") {
        is_client_account = true
    }
    response.render('automobile_manager', {is_client_account: is_client_account})
})

router.get("/driver_viewmore", function (request, response) {
    var is_client_account = false
    if (request.cookies && request.cookies.Auth_type_cookie === "CLIENT A") {
        is_client_account = true
    }
    
    response.render("driver_viewmore", {is_client_account: is_client_account});
}) 

router.get("/daily_work", function (request, response) {
    var is_client_account = false
    if (request.cookies && request.cookies.Auth_type_cookie === "CLIENT A") {
        is_client_account = true
    }
    response.render("daily_work", {is_client_account: is_client_account})
})

router.get("/account_manager", function (request, response) {
    var is_client_account = false
    if (request.cookies && request.cookies.Auth_type_cookie === "CLIENT A") {
        is_client_account = true
    }
    response.render("account_manager", {is_client_account: is_client_account});
}) 

router.get("/client_manager", function (request, response) {
    var is_client_account = false
    if (request.cookies && request.cookies.Auth_type_cookie === "CLIENT A") {
        is_client_account = true
    }
    response.render("client_manager", {is_client_account: is_client_account});
})

router.get("/login", function (request, response) {
    response.render("login", {});
})

router.get("/index", function (request, response) {
    var is_client_account = false
    if (request.cookies && request.cookies.Auth_type_cookie === "CLIENT A") {
        is_client_account = true;
        response.render("driver_manager", {is_client_account: is_client_account});
    }else {
        response.render("daily_work", {is_client_account: is_client_account});
    }
    
})

router.get("/account_create", function(request, response) {
    var is_client_account = false
    if (request.cookies && request.cookies.Auth_type_cookie === "CLIENT A") {
        is_client_account = true
    }
    if (request.query.id != undefined) {
        var mongo_util = new MongoUtil()
        mongo_util.get_user(request.query.id, function (result) {
            var param = result;
            param.is_client_account = is_client_account
            response.render("account_create", param)
        })
    }else {
        response.render("account_create", {is_client_account: is_client_account})
    }
   
})

router.get('/driver_users', function (request, response) {
    var date_str = request.query.driver_date;
    var date = new Date(date_str)
    var mongo_util = new MongoUtil()
    mongo_util.get_divers({date: date}, function (result) {
        response.json({data: result});
    });
})

router.post("/get_all_car", function (request, response) {
    var mongo_util = new MongoUtil();
    mongo_util.get_all_cars({}, function (result) {
        response.json(result)
    })
})

router.post("/fuel_records", function (request, response) {
    var mongo_util = new MongoUtil();
    var param = {car_id: request.body.car_id}
    mongo_util.get_page_fuel_records(request.body.page, param, function (result) {
        response.json(result)
    })
})

router.post("/update_user", function (request, response) {
    var mongo_util = new MongoUtil();
    var user = request.body.user
    var password = request.body.password;
    password = md5(password).toUpperCase()
    mongo_util.update_driver_by(user, {password: password}, function (result) {
        response.json(result)
    })
})

router.post("/fuel_all_records", function (request, response) {
    var mongo_util = new MongoUtil();
    var param = {car_id: request.body.car_id, month: request.body.month}
    mongo_util.get_all_fuel_records(request.body.car_id, request.body.month, function (result) {
        response.json(result)
    })
})

router.post('/add_fuel_record', function (request, response) {
    var mongo_util = new MongoUtil()
    console.log(request.body)
    mongo_util.add_fuel_record(request.body, function (result) {
        response.json(result)
    })
})

router.post('/add_location', function (request, response) {
    var mongo_util = new MongoUtil()
    if (request.body.location_id != undefined) {
        var newValue = {location: request.body.location}
        mongo_util.update_location_object(request.body.location_id, newValue, function (result) {
            response.json(result)
        })

        return;
    }

    mongo_util.add_location_object(request.body, function (result) {
        response.json(result)
    })
})

router.post("/delete_location", function (request, response) {
    var mongo_util = new MongoUtil();
    mongo_util.delete_location_object(request.body.id, function (result) {
        response.json(result);
    })
})

router.post("/driver_task", function (request, response) {
    var mongo_util = new MongoUtil()
    mongo_util.get_all_tasks_driver(request.body, function (result) {
        response.json(result)
    })
})

router.post("/automobiles", function (request, response) {
    var mongo_util = new MongoUtil()
    var page = parseInt(request.body.page);
    var plate_number = request.body.plate_number;
    var query = {};
    if (plate_number != undefined) {
        query.plate_number = eval('/' + plate_number + '/')
    }
    console.log(query)
    mongo_util.get_automatic_cars(page, query, function (result) {
        response.json(result)
    })
})

router.post("/all_fuel_locations", function (request, response) {
    var mongo_util = new MongoUtil()
    mongo_util.get_all_fuel_locations({}, function (result) {
        if (result) {
            response.json(result)
        }
    })
})

router.post("/automobiles_fuel_location", function (request, response) {
    var mongo_util = new MongoUtil()
    var page = parseInt(request.body.page);
    var query = {};
    mongo_util.get_automatic_fuel_location(page, query, function (result) {
        response.json(result)
    })
})

router.post("/update_car", function (request, response) {
    var car_id = request.body.car_id;
    var new_value = {};
    new_value.service_due_date = new Date(request.body.service_due_date);
    mongo_util.update_car_object(car_id, new_value, function (result) {
        response.json(result)
    })
})

router.post('/add_car', function (request, response) {

    var mongo_util = new MongoUtil()
    if (request.body.car_id != undefined) {
        var new_value = request.body;
        var car_id = request.body.car_id;
        delete new_value.car_id;
        mongo_util.update_car_object(car_id, new_value, function (result) {
            response.json(result)
        })
        return
    }

    
    mongo_util.add_car_object(request.body, function (result) {
        response.json(result)
    })
})

router.post("/add_task", function (request, response) {
    var mongo_util = new MongoUtil()
    mongo_util.add_task(request.body.name, request.body.date, function (result) {
        response.json(result)
    })
})

router.post("/login/auth", function (request, response) {
    var mongo_util = new MongoUtil()
    mongo_util.auth_user(request.body.account, request.body.password, function (result) {
        response.json(result)
    });  
})

router.post ("/update_account", function (request, response) {
    var mongo_util = new MongoUtil()
    mongo_util.update_user(request.body.id, request.body, function (result) {
        response.json({success: true})
    })
})

router.post("/leave_records", function (request, response) {
    var mongo_util = new MongoUtil()
    var page = request.body.page;
    mongo_util.get_leave_record(page, {}, function (result) {
        response.json(result)
    })
})

router.post('/accident', function (request, response) {
    var mongo_util = new MongoUtil()
    var page = request.body.page;
    mongo_util.get_accident_record(page, {}, function (result) {
        response.json(result)
    })
})

router.post("/approval", function (request, response) {
    var _id = request.body.leave_id;
    var status = request.body.status;
    var mongo_util = new MongoUtil()
    mongo_util.approval(_id, {status: status}, function (result) {
        response.json(result)
    })

})

router.post("/create_account_query", function (request, response) {
    var mongo_util = new MongoUtil()
    var param = request.body;
    if (request.body.user.length == 0) {
        response.json({success:false, msg:"PLEASE INPUT USER NAME"})
            return;
    }
    if (request.body.password.length == 0) {
        response.json({success:false, msg:"PLEASE INPUT PASSWORD"})
        return;
    }
    mongo_util.add_user(param, function (responseDb) {
        if (responseDb.success) {
            response.json({success:true})
        }else {
            response.json({success:false, msg:responseDb.msg})
        }
        
    });
});

router.post("/delete_task", function (request, response) {
    var id = request.body.task_id
    var mongo_util = new MongoUtil()
    mongo_util.delete_task(id, function (result) {
        response.json(result)
    })
})


router.post("/all_users", function (request, response) {
    var mongo_util = new MongoUtil()
    var param = {}
    param.auth_type = request.body.type
    mongo_util.get_all_users(param, function (result) {
        response.json({data: result})
    }) 
});

router.delete("/user/:id", function (request, response) {
    var mongo_util = new MongoUtil()
    mongo_util.delete_user(request.params.id, function (result) {
        response.send({finish: true})
    })
})

router.post("/task_assign", function (request, response) {
    var param = {user_id: request.body.user_id, status: "1", driver_name: request.body.driver_name, phone_number: request.body.phone_number}
    var mongo_util = new MongoUtil()

    mongo_util.update_task(request.body.id, param, function (result) {
        response.json({success: true})
    });
})

router.get("/tasks/:page", function (request, response) {
    var page = request.params.page
    var mongo_util = new MongoUtil()
    var query = request.query;
    var param = {};
    if (query.filter_date != undefined) {
        param.date = new Date(query.filter_date)
    }
    if (query.filter_name != undefined) {
        param.driver_name = eval("/" + query.filter_name + "/i")
    }
    mongo_util.get_task(page, param, function (result) {
        response.json(result)
    });
})



router.post("/create_driver_account", function (request, response) {
    var mongo_util = new MongoUtil()
    var param = request.body;
    if (param.user_name.length == 0 ||
        param.user.length == 0 ||
        param.sex.length == 0 ||
        param.age.length == 0 ||
        param.password.length == 0 ||
        param.phone_number.length == 0 ||
        param.car_plate_number.length == 0) {
            response.json({success: false, msg: "Please fill in the form"});
            return;
    }
    mongo_util.add_driver(param, function (responseDb) {
        if (responseDb.success) {
            response.json({success:true})
        }else {
            response.json({success:false, msg:responseDb.msg})
        }
        
    });
});



module.exports = router;