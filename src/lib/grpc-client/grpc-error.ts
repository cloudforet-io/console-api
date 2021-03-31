const statusCode = {
    0: 200, // OK
    1: 499, // CANCELLED
    2: 500, // UNKNOWN
    3: 400, // INVALID_ARGUMENT
    4: 504, // DEADLINE_EXCEEDED
    5: 404, // NOT_FOUND
    6: 409, // ALREADY_EXISTS
    7: 403, // PERMISSION_DENIED
    8: 429, // UNAUTHENTICATED
    9: 400, // FAILED_PRECONDITION
    10: 409, // ABORTED
    11: 400, // OUT_OF_RANGE
    12: 501, // UNIMPLEMENTED
    13: 500, // INTERNAL
    14: 503, // UNAVAILABLE
    15: 500, // DATA_LOSS
    16: 401 // UNAUTHENTICATED
};

const grpcErrorHandler = (err) => {
    if (err.details) {
        const errorArray = err.details.split(':');

        if (errorArray[0].indexOf('ERROR_') === 0) {
            err.error_code = errorArray[0].trim();
            err.details = errorArray.slice(1).join(':').trim();
        }

        err.status = statusCode[err.code];
    }
    return err;
};

export default grpcErrorHandler;
