class ApiError extends Error {
    constructor(
        statuscode,
        errors = [],
        message = "Something went wrong",
        stack = ""
    ) {
        super(mesage);
        this.statuscode = statuscode;
        this.errors = errors;
        this.message = message;
        if (stack) {
            this.stack = stack;
        }
    }
}
export default ApiError;

