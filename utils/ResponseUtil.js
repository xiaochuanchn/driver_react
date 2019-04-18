


class ResponseUtil {
    static response_object (success, object, msg) {
        var response = {success: success, msg: msg, data: object?object:{}}
        return response
    }
}

module.exports = ResponseUtil