var express = require('express');
var router = express.Router();
var MongoUtil = require('../utils/mongo_util')
var ResponseUtil = require('../utils/ResponseUtil')
var md5 = require('md5')
var http = require("http")
var moment = require("moment")
mongo_util = new MongoUtil()

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/accidents', function (request, response) {
  var param = request.body
  mongo_util.get_all_accident({"header.uid": param.header.uid}, function (result) {
    if (result != undefined) {
      response.json(ResponseUtil.response_object(true, result, ""))
    }else {
      response.json(ResponseUtil.response_object(false, {}, "Unknown Error"))
    }
  })
})

router.post('/addAccident', function (request, response) {
  var param = request.body;
  mongo_util.add_accident(param, function (result) {
    if (result != undefined) {
      response.json(ResponseUtil.response_object(true, {}, ""))
    }else {
      response.json(ResponseUtil.response_object(false, {}, "Unknown Error"))
    }
  })
})

router.post("/check_in", function (request, response) {
  var param = request.body;
  var date_str = moment().format("YYYY-MM-DD")
  var date = new Date(date_str)
  if (param.longitude == undefined || param.longitude == 0) {
    response.json(ResponseUtil.response_object(false, {}, "Pleas allow get position"))
    return;
  }
  
  param.date = date
  var url = "http://api.map.baidu.com/geocoder/v2/?location=" + param.latitude + "," + param.longitude + "&output=json&pois=1&ak=L3LkKFvpoct84gU2PBQiF5CpXdCOtbpc&coordtype=wgs84ll";
  console.log(url)
  http.get(url, (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
      data += chunk;
    });
    resp.on('end', () => {
      var local_data = JSON.parse(data)
      if (local_data.status === 0) {
        console.log(local_data)
        param.locat_str = local_data.result.formatted_address
        add_check_in_act(param, response)
      }else {
        add_check_in_act(param, response)
      }
    });

  }).on("error", (err) => {
    response.json(ResponseUtil.response_object(false, {}, "Positioning failed"))
  });
  
})

function add_check_in_act (param, response) {
  var query = {date:param.date, "header.uid": param.header.uid}
  console.log(query)
  mongo_util.get_check_in_query(query, function (checkin_result) {
    console.log(checkin_result)
    if (checkin_result && checkin_result.length > 0) {
      console.log("已经有了checking")
      response.json(ResponseUtil.response_object(true, {}, ""))
    }else {
      mongo_util.add_check_in(param, function (result) {
    
        if (result != undefined) {
          response.json(ResponseUtil.response_object(true, {}, ""))
        }else {
          response.json(ResponseUtil.response_object(false, {}, "Unknown Error"))
        }
      })
    }
    
  })
  
}

router.post("/add_checkout", function (request, response) {
  var param = {}
  param.reason = request.body.reason
  param.no_tasks = request.body.no_tasks
  var date_str = moment().format("YYYY-MM-DD")
  var date = new Date(date_str)
  param.date = date
  param.user_id = request.body.header.uid
  mongo_util.add_checkout(param, function (result) {
    if (result != undefined) {
      response.json(ResponseUtil.response_object(true, {}, ""))
    }else {
      response.json(ResponseUtil.response_object(false, {}, "Unknown Error"))
    }

  })
})
router.post('/add_fuel_record', function (request, response) {
  var car_plate_number = request.body.header.car_plate_number;
  mongo_util.get_automatic_cars(1, {plate_number: car_plate_number}, function (car_result) {
    if (car_result && car_result.result.length > 0) {
      var car_object = car_result.result[0];
      var param = {}
      param.car_id = car_object._id.toString()
      param.plate_number = car_plate_number;
      param.amount = request.body.litres
      param.location = request.body.location;
      param.driver_name = request.body.header.driver_name;
      param.month = moment().format("YYYY-MM")
      param.header = request.body.header

      mongo_util.get_all_fuel_records_custom({month: param.month, "header.uid": param.header.uid}, function (result) {
        if (result) {
          var totalAmount = 0;
          for (var i = 0; i < result.length; i++) {
            var record = result[i];
            var amount = parseFloat(record.amount)
            totalAmount+=amount;
          }
          if (false) {
            response.json(ResponseUtil.response_object(false, {}, "you can only 600L this month"))
          }else {
            mongo_util.add_fuel_record(param, function (result) {
              if(result != undefined) {
                response.json(ResponseUtil.response_object(true, result, ""))
              }else {
                response.json(ResponseUtil.response_object(false, {}, "Unknown error"))
              }
            })
          }
        }else {
          response.json(ResponseUtil.response_object(false, {}, "Unknown error"))
        }
        
      })

      

    }else {
      response.json(ResponseUtil.response_object(false, {}, "Unknown error"))
    }
  })
})

router.post('/fuel_locations', function (request, response) {
  mongo_util.get_all_fuel_location({}, function (result) {
    if (result != undefined) {
      response.json(ResponseUtil.response_object(true, result, ""))
    }else {
      response.json(ResponseUtil.response_object(false, result, "Unknown error"))
    }
  })
})

router.post("/hand_over_tasks", function (request, response) {
  var date = new Date(request.body.date)
  var terminal_user_id = request.body.terminal_user_id;
  var driver_name = request.body.driver_name;
  var phone_number = request.body.phone_number
  console.log(request.body)
  var newValue = {};
  newValue.user_id = terminal_user_id;
  newValue.driver_name = driver_name;
  newValue.phone_number = phone_number

  mongo_util.hand_over_task(newValue, date, request.body.user_id, function (result) {
    
    if (result != undefined) {
      response.json(ResponseUtil.response_object(true, {}, ""))
    }else {
      response.json(ResponseUtil.response_object(false, {}, "Unknown error"))
    }
  })
})

router.post('/change_car', function (request, response) {
  mongo_util.change_car(request.body.header.user, request.body.plate_number, function (result) {
    if (result != undefined) {
      response.json(ResponseUtil.response_object(true, result, ""))
    }else {
      response.json(ResponseUtil.response_object(false, {}, "Unknown Error"))
    }
  })
})

router.post("/user_tasks", function (request ,response) {
    var user_id = request.body.header.uid;
    var date = new Date(request.body.date)
    mongo_util.get_all_task({user_id: user_id, date: date}, function (result) {
        if (result != undefined) {
            response.json(ResponseUtil.response_object(true, result, ""))
        }else {
            response.json(ResponseUtil.response_object(false, {}, "Unknown Error"))
        }
    });
})

router.post("/all_cars", function (request, response) {
  mongo_util.get_all_cars({}, function (result) {
    if (result != undefined) {
      response.json(ResponseUtil.response_object(true, result, ""))
    }else {
      response.json(ResponseUtil.response_object(false, [], "Unknown error"))
    }
  })
})

router.post('/driver_users', function (request, response) {
    var date = new Date(request.body.date);
    mongo_util.get_divers({date:date}, function (result) {
      if (result != undefined) {
        response.json(ResponseUtil.response_object(true, result, ""))
      }else {
        response.json(ResponseUtil.response_object(false, [], "Unknown error"))
      }
    })
})

router.post("/add_task", function (request, response) {
    var name = request.body.name;
    var user_id = request.body.header.uid;
    var driver_name = request.body.header.driver_name
    var status = "1"
    var date = new Date(request.body.date)
    var phone_number = request.body.header.phone_number
    var param = {name: name, user_id: user_id, driver_name: driver_name, status: status, date: date, phone_number: phone_number};
    mongo_util.user_add_task (param, function (result) {
      if(result != undefined && result.result.ok) {
        response.json(ResponseUtil.response_object(true, {}))
      }else {
        response.json(ResponseUtil.response_object(false, {}, "Unknown error"))
      }
    })
})

router.post("/get_fuel_over", function (request, response) {
  var month = moment().format("YYYY-MM");
  var uid = request.body.header.uid
  mongo_util.get_all_fuel_records_custom({month:month, "header.uid": uid}, function (result) {
    var totalAmount = 0;
    if (result) {
      for (var i = 0; i < result.length; i++) {
        var record = result[i];
        var amount = parseFloat(record.amount)
        totalAmount+=amount;
      }
    }
    response.json(ResponseUtil.response_object(true, {totalAmount:totalAmount}, ""))
  })
})

router.post("/get_car_by_plate_number", function (request, response) {
  var car_plate_number = request.body.header.car_plate_number;
  mongo_util.get_all_cars({plate_number: car_plate_number}, function (result) {
    if (result != undefined) {
      response.json(ResponseUtil.response_object(true, result, ""))
    }else {
      response.json(ResponseUtil.response_object(false, {}, "Unknown error"))
    }
  })
})

router.post("/get_not_leave", function (request, response) {
  mongo_util.get_no_leave_request(request.body.header.uid, function (result) {
    console.log(result)
    if (result != undefined && result.length > 0) {
      response.json(ResponseUtil.response_object(true, result, ""))
    }else {
      response.json(ResponseUtil.response_object(false, {}, "Unknown error"))
    }
  })
})

router.post('/start_task', function (request, response) {
  var task_id = request.body.task_id;
  var param = {start_location: request.body.location, start_date: new Date(), status: "2"}
  if (param.start_location.longitude != undefined && param.start_location.longitude != 0) {
    var url = "http://api.map.baidu.com/geocoder/v2/?location=" + param.start_location.latitude + "," + param.start_location.longitude + "&output=json&pois=1&ak=L3LkKFvpoct84gU2PBQiF5CpXdCOtbpc&coordtype=wgs84ll";
    console.log(url)
    http.get(url, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        var local_data = JSON.parse(data)
        if (local_data.status === 0) {
          param.start_location.locat_str = local_data.result.formatted_address
          add_update_task(task_id, param, response)
        }else {
          add_update_task(task_id, param, response)
        }
      });
 
    }).on("error", (err) => {
      response.json(ResponseUtil.response_object(false, {}, "Positioning failed"))
    });
  }else {
      response.json(ResponseUtil.response_object(false, {}, "Pleas allow get position"))
  }
  

  
  
  
})

function add_update_task (task_id, param, response) {
  mongo_util.update_task(task_id, param, function (result) {
    if (result == undefined) {
      response.json(ResponseUtil.response_object(false, {}, "Unknown error"))
    }else {
      response.json(ResponseUtil.response_object(true, {}))
    }
  })
}

router.post("/finish_task", function (request, response) {
  var task_id = request.body.task_id;
  var param = {finish_location: request.body.location, finish_date: new Date(), status: "3"}
  if (param.finish_location.longitude != undefined && param.finish_location.longitude != 0) {
    var url = "http://api.map.baidu.com/geocoder/v2/?location=" + param.finish_location.latitude + "," + param.finish_location.longitude + "&output=json&pois=1&ak=L3LkKFvpoct84gU2PBQiF5CpXdCOtbpc&coordtype=wgs84ll";
    console.log(url)
    http.get(url, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        var local_data = JSON.parse(data)
        if (local_data.status === 0) {
          param.finish_location.locat_str = local_data.result.formatted_address
          add_update_task(task_id, param, response)
        }else {
          add_update_task(task_id, param, response)
        }
      });
 
    }).on("error", (err) => {
      response.json(ResponseUtil.response_object(false, {}, "Positioning failed"))
    });
  }else {
      response.json(ResponseUtil.response_object(false, {}, "Pleas allow get position"))
  }

})

router.post("/leave_request", function (request, response) {
    console.log(request.body)
    var user_id = request.body.header.uid;
    var start_date = new Date(request.body.start_date);
    var end_date = new Date(request.body.end_date);
    var type = request.body.type
    var reason = request.body.reason
    var param = {reason: reason, user_id: user_id, start_date: start_date, end_date: end_date, status: "0", type: type, user_name: request.body.header.driver_name}
    mongo_util.add_user_leave(param, function (result) {
      if (result == undefined) {
        response.json(ResponseUtil.response_object(false, {}, 'Unknown Error'));
      }else {
        response.json(ResponseUtil.response_object(true, result, ""))
      }
    })
})

router.post("/login", function (request, response) {
    var user_name = request.body.user_name;
    var password = request.body.password;
    var query = {user: user_name};
    console.log(request.body)
    mongo_util.get_driver(query, function (result) {
      if (result == undefined) {
        response.json(ResponseUtil.response_object(false, result, 'User not exists'))
      }else {
        var actual_password = result.password;
        console.log(md5(password).toUpperCase())
        console.log(actual_password)
        if (actual_password != md5(password).toUpperCase()) {
          response.json(ResponseUtil.response_object(false, undefined, 'Password is wrong'))
        }else {
          response.json(ResponseUtil.response_object(true, result, ''))
        }
      }
    })
})


module.exports = router;
