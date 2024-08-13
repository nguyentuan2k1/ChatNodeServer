class BaseResponse {
        constructor(data, message, code) {
                this.data = data;
                this.message = message;
                this.code = code;
        }
}
module.exports = BaseResponse;