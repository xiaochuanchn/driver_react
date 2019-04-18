var md5 = require('md5');
var ObjectID = require('mongodb').ObjectID
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://root:123123anquan@118.89.193.59:27017/admin'
var async = require('async')
var moment = require('moment')

var page_size = 20;

var ADMINUSERCOLLECTIONNAME = "admin_user"
var DRIVERUSERSCOLLECTIONNAME = "user"
var TASKCOLLECTIONNAME = "task"
var USERLEAVECOLLECTION = "user_leave"
var CARCOLLECTION = 'car'
var FUELLOCATIONCOLLECTION = 'fuel_location'
var FUELRECORDCOLLECTION = 'fuel_record'
var CHECKOUTCOLLECTION = "check_out"
var CHECKINCOLLECTION = "check_in"
var ACCIDENTCOLLECTION = "accident"
class MongoUtil {


    delete_task (id, callback) {
        var object_id = ObjectID(id)
        this.delete_object(TASKCOLLECTIONNAME, {_id: object_id}, function (result) {
            callback(result)
        })
    }

    add_checkout (query, callback) {
        var that = this
        var tasks = query.no_tasks;
        var id_query = []
        for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];
            id_query.push({_id: ObjectID(task._id)})
        }

        var today = moment().format("YYYY-MM-DD");
        today = moment(today);
        var tomorrow = today.add(1, "day").format("YYYY-MM-DD")
        tomorrow = new Date(tomorrow)
        console.log(tomorrow)
        this.insert_object(CHECKOUTCOLLECTION, query, function (result) {
            that.update_object(TASKCOLLECTIONNAME, {$or: id_query}, {$unset: {start_date:"", finish_date:"", start_location: "", finish_location: "", driver_name: "", phone_number: "", user_id: ""}, $set:{date:tomorrow, status: "0"}}, function (update_result) {
                callback(update_result)
            })
        })
    }
    get_all_fuel_location (query, callback) {
        this.get_all_objects(FUELLOCATIONCOLLECTION, query, function (result) {
            callback(result)
        })
    }

    add_check_in (query, callback) {
        this.insert_object(CHECKINCOLLECTION, query, function (result) {
            callback(result)
        })
    }

    hand_over_task (newValue, date, user_id, callback) {
        this.update_object(TASKCOLLECTIONNAME, {date: date, user_id: user_id, status: {$ne: "3"}}, {$set: newValue}, function (result) {
            if (result.result.ok) {
                callback(result)
            }else {
                callback()
            }
        })
    }

    change_car (user_user, car_plate_number, callback) {
        var that = this;
        this.update_object(DRIVERUSERSCOLLECTIONNAME, {user: user_user}, {$set: {car_plate_number: car_plate_number}}, function (result) {
            if (!result.result.ok) {
                callback()
                return
            }
            that.get_object(DRIVERUSERSCOLLECTIONNAME, {user: user_user}, function (user_obj) {
                delete user_obj.car_plate_number;
                delete user_obj._id
                var delete_old_car = {user: "", user_name: "", sex: "", age: "", phone_number: "", password: ""};
                that.update_object(CARCOLLECTION, {user: user_user}, {$set: delete_old_car}, function (result) {
                    that.update_object(CARCOLLECTION, {plate_number: car_plate_number}, {$set: user_obj}, function (result) {
                        callback(result)
                    })
                })
            })
        })


    }

    get_all_cars(query, callback) {
        this.get_all_objects(CARCOLLECTION, query, function (result) {
            callback(result)
        })
    }

    user_add_task (query, callback) {
        this.insert_object(TASKCOLLECTIONNAME, query, function (result) {
            callback(result);
        })
    }

    get_page_fuel_records (page, query, callback) {
        var that = this
        this.get_count(FUELRECORDCOLLECTION, query, function (count) {
            var all_page = parseInt(count / page_size) + 1;
            if (count % page_size == 0) {
                all_page--;
            }
            that.get_objects_page(FUELRECORDCOLLECTION, page, query, function (result) {
                callback({all_page: all_page, result: result});
            })
        })
    }

    get_all_fuel_records (car_id, month, callback) {
        var param = {car_id: car_id}
        var next_month = parseInt(month) + 1
        var current_year = moment().format("YYYY")
        if (month === '12') {
            var min_date = new Date(current_year + "-" + month);
            param.create_date = {$gte: min_date}
        }else {
            var min_date = new Date(current_year + "-" + month);
            var max_date_str = current_year + "-" + next_month
            var max_date = new Date(max_date_str);
            param.create_date = {$gte: min_date, $lt: max_date}
        }   

        this.get_all_objects(FUELRECORDCOLLECTION, param, function (resut) {
            callback(resut)
        })
    }


    add_fuel_record (query, callback) {
        this.insert_object(FUELRECORDCOLLECTION, query, function (result) {
            callback(result)
        })
    }

    delete_location_object(id, callback) {
        this.delete_object(FUELLOCATIONCOLLECTION, {_id: ObjectID(id)}, function (resut) {
            callback(resut)
        })
    }

    update_location_object (id, newValue, callback) {
        console.log(newValue)
        this.update_object(FUELLOCATIONCOLLECTION, {_id: ObjectID(id)}, {$set: newValue}, function (result) {
            callback(result);
        })
    }

    add_location_object (query, callback) {
        this.insert_object(FUELLOCATIONCOLLECTION, query, function (result) {
            callback(result);
        })
    }

    update_car_object (id, newValue, callback) {
        this.update_object(CARCOLLECTION, {_id: ObjectID(id)}, {$set: newValue}, function (result) {
            if (result != undefined && result.result.ok) {
                callback({success: true})
            }else {
                console.log("报错 更新car")
                console.log(id)
                callback({success: false, msg: "Unknown error"})
            }
        })
    }

    add_car_object (query, callback) {
        var that = this
        this.get_object(CARCOLLECTION, {plate_number: query.plate_number}, function (result) {
            if (result == undefined) {
                that.insert_object(CARCOLLECTION, query, function (result) {
                    if (result.result.ok) {
                        callback({success: true})
                    }else {
                        callback({success: false, msg: "Unknown error"})
                    }
                    
                })
            }else {
                callback({success: false, msg: "PLATE NUMBER ALREADY EXSITS"})
            }
        })
        
    }

    get_all_fuel_locations (query, callback) {
        this.get_all_objects(FUELLOCATIONCOLLECTION, query, function (result) {
            callback(result)
        })
    }
    get_all_fuel_records_custom (query, callback) {
        this.get_all_objects(FUELRECORDCOLLECTION, query, function (result) {
            callback(result)
        })
    }

    get_automatic_fuel_location (page, query, callback) {
        var that = this;
        this.get_count(FUELLOCATIONCOLLECTION, query, function (count) {
            var all_page = parseInt(count / page_size) + 1;
            if (count % page_size == 0) {
                all_page--;
            }
            that.get_objects_page(FUELLOCATIONCOLLECTION, page, query, function (result) {
                callback({all_page: all_page, result: result});
            });
        })
    }

    filter_array (array, plate_number) {
        var finalArray = []
        for (var i = 0; i < array.length; i++) {
            var record = array[i];
            if (record.plate_number === plate_number) {
                finalArray.push(record);
            }
        }
        return finalArray
    }

    handle_cars (result, callback) {
        var plate_number_query = []
        for (var i = 0; i < result.length; i++) {
            var car_object = result[i];
            var query = {plate_number: car_object.plate_number};
            plate_number_query.push(query)
        }
        var that = this
        this.get_all_objects(FUELRECORDCOLLECTION, {$or: plate_number_query}, function (records) {

            var callback_result = []
            for (var i = 0; i < result.length; i++) {
                var car_object = result[i];
                var records_car = that.filter_array(records, car_object.plate_number);
                var total_amount = 0
                for (var j = 0; j < records_car.length; j++) {
                    var record_object = records_car[j];
                    total_amount += parseFloat(record_object.amount)
                }
                car_object.total_amount = total_amount;
                callback_result.push(car_object)
            }
            callback(callback_result)



        })
    }

    get_automatic_cars (page, query, callback) {
        var that = this;
        this.get_count(CARCOLLECTION, query, function (count) {
            var all_page = parseInt(count / page_size) + 1;
            if (count % page_size == 0) {
                all_page--;
            }
            that.get_objects_page(CARCOLLECTION, page, query, function (result) {
                that.handle_cars(result, function (final_res) {
                    callback({all_page: all_page, result: final_res})
                })
            });
        })
    }

    approval (id, query, callback) {
        this.update_object(USERLEAVECOLLECTION, {_id: ObjectID(id)}, {$set:query}, function (result) {
            callback(result)
        })
    }

    get_leave_record (page, query, callback) {
        var that = this;
        this.get_count(USERLEAVECOLLECTION, query, function (count) {
            var all_page = parseInt(count / page_size) + 1;
            if (count % page_size == 0) {
                all_page--;
            }
            that.get_objects_page(USERLEAVECOLLECTION, page, query, function (result) {
                callback({all_page: all_page, result: result});
            })
        })
    }

    get_all_accident (query, callback) {
        this.get_all_objects(ACCIDENTCOLLECTION, query, function (result) {
            callback(result)
        })
    }

    get_accident_record (page, query, callback) {
        var that = this;
        this.get_count(ACCIDENTCOLLECTION, query, function (count) {
            var all_page = parseInt(count / page_size) + 1;
            if (count % page_size == 0) {
                all_page--;
            }
            that.get_objects_page(ACCIDENTCOLLECTION, page, query, function (result) {
                callback({all_page: all_page, result: result});
            })
        })
    }

    get_no_leave_request (user_id, callback) {
        var end_date = moment().format("YYYY-MM-DD");
        end_date = new Date(end_date)


        var param = {user_id: user_id, end_date: {$gte: end_date}};
        this.get_all_objects(USERLEAVECOLLECTION, param, function (result) {
            callback(result)
        })
    }

    add_user_leave(query, callback) {
        var that = this;
        var end_date = moment().format("YYYY-MM-DD");
        end_date = new Date(end_date)
        var user_id = query.user_id
        var type = query.type;
        var delete_query = {end_date: {$gte: end_date}, user_id: user_id, type:type}
        this.delete_object(USERLEAVECOLLECTION, delete_query, function (delete_result) {
            that.insert_object(USERLEAVECOLLECTION, query, function (result) {
                callback(result)
            })
        })
        
    }

    get_driver (query, callback) {
        this.get_object(DRIVERUSERSCOLLECTIONNAME, query, function (result) {
            callback(result)
        })
    }

    get_all_task(query, callback) {
        this.get_all_objects(TASKCOLLECTIONNAME, query, function (result) {
            callback(result)
        })
    }

    get_task (page, query, callback) {
        var that = this;
        this.get_count(TASKCOLLECTIONNAME, query, function (count) {
            var all_page = parseInt(count / page_size) + 1;
            if (count % page_size == 0) {
                all_page--;
            }
            that.get_objects_page(TASKCOLLECTIONNAME, page, query, function (result) {
                callback({all_page: all_page, result: result});
            })
        })
    }

    get_all_tasks_driver (query, callback) {
        var that = this
        this.get_all_objects(TASKCOLLECTIONNAME, query, function (result) {
            
            var final_object = {};
            var date_all = []
            for (var i = 0; i < result.length; i++) {
                var object = result[i];
                var date = new Date(object.date);
                var date_str = date.pattern('yyyy-MM-dd')
                var date_tasks = final_object[date_str]
                if (date_tasks == undefined) {
                    date_tasks = []
                    final_object[date_str] = date_tasks
                    date_all.push(date);
                }
                date_tasks.push(object)
            }
            date_all.sort(function (a, b) {
                return a < b ? 1 : -1;
            })
            var checkout_query = [];
            for (var i = 0; i < date_all.length; i++) {
                var date = date_all[i];
                var query_final = {date: date};
                checkout_query.push(query_final)
            }
            that.get_all_objects(CHECKOUTCOLLECTION, {$or: checkout_query, user_id: query.user_id}, function (checkout_result) {
                if (checkout_result != undefined && checkout_result.length > 0) {
                    that.get_checkin_with({data:final_object, date:date_all, checkouts: checkout_result}, date_all, query.user_id,callback)
                }else {
                    that.get_checkin_with({data:final_object, date:date_all}, date_all, query.user_id, callback);
                }
            })
            
        })
    }

    get_check_in_query(query, callback) {
        this.get_all_objects(CHECKINCOLLECTION, query, function (result) {
            callback(result)
        })
    }

    get_checkin_with(param, date_all, user_id, callback) {
        var that = this
        this.get_all_objects(CHECKINCOLLECTION, {"header.uid": user_id}, function (checkin_result) {
            if (checkin_result != undefined && checkin_result.length > 0) {
                param.checkins = checkin_result
                var wait_array = []
                for (var i = 0; i < checkin_result.length; i++) {
                    var checkin = checkin_result[i];
                    wait_array.push(checkin.date);
                    
                }
                param.date = that.handle_date_all(param.date, wait_array)
                callback(param)
            }else {
                callback(param)
            }
        })
    }

    handle_date_all (date_array, wait_date_array) {
        if (date_array == undefined) {
            date_array = []
        }
        if (wait_date_array == undefined) {
            wait_date_array = []
        }
        var final_array = []
        for (var i = 0; i < wait_date_array.length; i++) {
            var wait_date = wait_date_array[i];
            var has_wait = false
            for (var j = 0; j < date_array.length; j++) {
                var date = date_array[j];
                if (date.getTime() === wait_date.getTime()) {
                    has_wait = true;
                }
            }
            console.log(has_wait)
            if (!has_wait) {
                final_array.push(wait_date);
            }
        }
        for (var j = 0; j < date_array.length; j++) {
            var date = date_array[j];
            final_array.push(date);
        }
        final_array = final_array.sort(function (a, b) {
            return a < b ? 1 : -1;
        })
        return final_array;
    }

    add_accident (param, callback) {
        this.insert_object(ACCIDENTCOLLECTION, param, function (result) {
            callback({success: true})
        })
    }

    add_task(task_name, date,  callback) {
        if (task_name.length == 0) {
            callback({success: false, msg: "Please enter task name"})
            return;
        }
        if (date.length == 0) {
            callback({success: false, msg: "Please select task date"})
            return;
        }
        var date = new Date(date)
        var param = {name: task_name, status: "0", date: date, create_date: new Date()};
        console.log(param);
        this.insert_object(TASKCOLLECTIONNAME, param, function (result) {
            callback({success: true});
        });
    }

    update_task (id, newValue, callback) {
        console.log("更新任务")
        console.log(id);
        var newParam = newValue;
        this.update_object(TASKCOLLECTIONNAME, {_id: ObjectID(id)}, {$set:newParam}, function (result) {
            callback(result)
        })
    }

    update_driver_by (user, newValue, callback) {
        this.update_object(DRIVERUSERSCOLLECTIONNAME, {user: user}, {$set: newValue}, function (result) {
            callback(result)
        })
    }

    update_user (id, newValue, callback) {
        var newParam = newValue;
        newParam.auth_type = newValue.auth_type;
        delete newParam.id
        newParam.password = newValue.password
        console.log(newParam);
        this.update_object(ADMINUSERCOLLECTIONNAME, {_id: ObjectID(id)}, {$set:newParam}, function (result) {
            callback(result)
        })
    }

    get_user (user, callback) {
        this.get_object(ADMINUSERCOLLECTIONNAME, {_id: ObjectID(user)}, function (result) {
            callback(result);
        });
    }

    delete_user (user_id, callback) {
        this.delete_object(ADMINUSERCOLLECTIONNAME, {_id: ObjectID(user_id)}, function (result) {
            console.log("result")
            console.log(result.result)
            callback(result);
        })
    }

    get_divers (query, callback) {
        var date = query.date
        var that = this;
        console.log(query)
        this.get_all_objects(DRIVERUSERSCOLLECTIONNAME, {}, function (result) {
            that.get_all_objects(USERLEAVECOLLECTION, {end_date: {$gte: date}, start_date: {$lte: date}, status: "1"}, function (leave_result) {
                
                if (leave_result == undefined) {
                    callback(result);
                }else {
                    for (var i = 0; i < leave_result.length; i++) {
                        var obj = leave_result[i]
                        var user_id = obj.user_id;
                        for (var j = 0; j < result.length; j++) {
                            var user_obj = result[j];
                            if (user_obj._id.toString() === user_id) {
                                console.log(user_obj)
                                result.splice(j,1)
                            }
                        }
                    }
                    callback(result);
                }
            })
            
        })
    }

    get_all_users (query, callback) {
        var dataArray = this.get_all_objects(ADMINUSERCOLLECTIONNAME, query, function (result) {
            callback(result)
        });
    }


    add_user (param, finish) {
        var params = {user: param.user}
        var that = this;
        this.get_object(ADMINUSERCOLLECTIONNAME, params, function (result) {
            if (result == undefined) {
                param.password = param.password
                that.insert_object(ADMINUSERCOLLECTIONNAME, param, function (result) {
                    if (result.result.ok) {
                        finish({success: true})
                    }else {
                        finish({success: false, msg: "Unknown error"})
                    }
                })
            } else {
                finish({success: false, msg: "ACCOUNT ALREADY EXSITS"})
            }
        })
    }

    add_driver (param, finish) {
        var that = this;
        this.get_object(DRIVERUSERSCOLLECTIONNAME, {user: param.user}, function (result) {
            if (result == undefined) {
                that.get_object(CARCOLLECTION, {plate_number: param.car_plate_number}, function (result) {
                    if (result != undefined) {
                        param.password = md5(param.password).toUpperCase();
                        that.insert_object(DRIVERUSERSCOLLECTIONNAME, param, function (result) {
                            if (result.result.ok) {
                                delete param._id
                                that.update_object(CARCOLLECTION, {plate_number: param.car_plate_number}, {$set: param}, function (result) {
                                    if (result.result.ok) {
                                        finish({success: true})
                                    }else {
                                        finish({success: false, msg: "Unknown error"})
                                    }
                                })
                        
                            }else {
                                finish({success: false, msg: "Unknown error"})
                            }
                        })
                    }else {
                        finish({success: false, msg: "CAR PLATE NUMBER NOT EXSITS"})
                    }
                })
                
                
            }else {
                finish({success: false, msg: "ACCOUNT ALREADY EXSITS"})
            }
        })
    }

    auth_user (account, password, finish) {
        var param = {user: account}
        this.get_object(ADMINUSERCOLLECTIONNAME, param, function (result) {
            if (result == undefined) {
                finish({success: false, msg: "账号不存在"})
            } else if (result.password != password) {
                finish({success: false, msg: "密码错误"})
            }else if (result.password == password) {
                finish({success: true, id: result._id, auth_type: result.auth_type})
            }else {
                finish({success: false, msg: "未知异常"});
            }
        })
    }






    get_object (collection_name, query, callback) {
        MongoClient.connect(url, function (error, db) {
            if (error) {
                callback();
                db.close()
                throw error;
            }
            var database = db.db("driverManager");
            console.log(query)
            database.collection(collection_name).findOne(query, function (error2, result) {
                if (error2) {
                    callback();
                    db.close()
                    throw error2;
                }
                callback(result);
                db.close()
            })
        })
    }

    insert_object (collection_name, query, callback) {
        query.create_date = new Date()
        MongoClient.connect(url, function (error, db) {
            if (error) {
                callback();
                db.close()
                throw error;
            }
            var database = db.db("driverManager");
            database.collection(collection_name).insertOne(query, function (error2, result) {
                if (error2) {
                    callback();
                    db.close()
                    throw error2;
                }
                callback(result);
                db.close()
            })
        })
    }

    get_all_objects (collection_name, query, callback, options = {}) {
        MongoClient.connect(url, function (error, db) {
            if (error) {
                callback()
                db.close()
                throw error;
            }
            var database = db.db("driverManager");
            database.collection(collection_name).find(query).sort({create_date: -1}).toArray(function (error, response) {
                callback(response, options)
            })
            db.close()
        })
    }

    delete_object (collection_name, query, callback) {
        console.log("删除元素")
        console.log(collection_name);
        console.log(query)
        MongoClient.connect(url, function (error, db) {
            if (error) {
                callback();
                db.close()
                throw error;
            }
            var database = db.db("driverManager");
            database.collection(collection_name).deleteMany(query, function (error2, result) {
                if (error2) {
                    callback();
                    db.close()
                    throw error2;
                }
                callback(result);
                db.close()
            })
        })
    }

    update_object (collection_name, filter, newValue, callback) {
        console.log("update object")
        console.log(collection_name)
        console.log(filter)
        console.log(newValue)
        MongoClient.connect(url, function (error, db) {
            if (error) {
                callback();
                db.close()
                throw error;
            }
            var database = db.db("driverManager");
            database.collection(collection_name).updateMany(filter, newValue, function (error2, result) {
                if (error2) {
                    callback();
                    db.close()
                    throw error2;
                }
                callback(result);
                db.close()
            })
        })
    }

    get_count (collection_name, query, finish) {
        MongoClient.connect(url, function (error, db) {
            if (error) {
                callback();
                db.close()
                throw error;
            }
            var database = db.db("driverManager");
            database.collection(collection_name).count(query, function (error, result) {
                if (error) {
                    callback();
                    db.close()
                    throw error;
                }
                finish(result)
                db.close()
            })
            
        })
    }

    get_objects_page (collection_name, page, query, callback) {
        MongoClient.connect(url, function (error, db) {
            if (error) {
                callback();
                db.close()
                throw error;
            }
            var database = db.db("driverManager");
            var skip_number = (page - 1) * page_size;
            database.collection(collection_name).find(query).sort({create_date: -1}).limit(page_size).skip(skip_number).toArray(function (error2, response) {
                if (error2) {
                    callback();
                    db.close()
                    throw error2;
                }
                callback(response)
                db.close()
            })
        })
    }
}

module.exports = MongoUtil;




Date.prototype.pattern=function(fmt) {         
    var o = {         
    "M+" : this.getMonth()+1, //月份         
    "d+" : this.getDate(), //日         
    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时         
    "H+" : this.getHours(), //小时         
    "m+" : this.getMinutes(), //分         
    "s+" : this.getSeconds(), //秒         
    "q+" : Math.floor((this.getMonth()+3)/3), //季度         
    "S" : this.getMilliseconds() //毫秒         
    };         
    var week = {         
    "0" : "/u65e5",         
    "1" : "/u4e00",         
    "2" : "/u4e8c",         
    "3" : "/u4e09",         
    "4" : "/u56db",         
    "5" : "/u4e94",         
    "6" : "/u516d"        
    };         
    if(/(y+)/.test(fmt)){         
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));         
    }         
    if(/(E+)/.test(fmt)){         
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);         
    }         
    for(var k in o){         
        if(new RegExp("("+ k +")").test(fmt)){         
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));         
        }         
    }         
    return fmt;         
}    