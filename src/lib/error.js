import createError from "http-errors";
import logger from "./logger";

const notFoundErrorHandler = () => {
    return (req, res, next) => {
        next(createError(404));
    };
};

const defaultErrorHandler = () => {
    return (err, req, res, next) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        let errorResponse = {
            error: {
                message: err.details || err.message,
                code: err.error_code || 'ERROR_UNKNOWN'
            }
        };

        if (err.fail_items) {
            errorResponse.error.fail_items = err.fail_items;
        }

        res.json(errorResponse);
    };
};
export {
    notFoundErrorHandler,
    defaultErrorHandler
}