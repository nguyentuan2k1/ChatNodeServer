class BaseResponse {
        static customResponse(res, message, status = 0, code = 200, data = null) {
                let jsonValue = {
                        data : data,
                        message: message,
                        code : code
                }

                if (status) return res.status(200).json(jsonValue)
                
                return res.status(code).json(jsonValue);
        }
}
module.exports = BaseResponse;