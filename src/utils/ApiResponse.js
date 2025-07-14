class ApiResponse{
    constructor(
        statuscode,
        data,
        message = "Request was successful",
    ){
        this.statuscode = statuscode;
        this.data = data;
        this.message = message;
    }
}