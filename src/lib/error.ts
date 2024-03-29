import createError from 'http-errors';

const notFoundErrorHandler = () => {
    return (req, res, next) => {
        next(createError(404));
    };
};

const essentialParamErrorHandler = (params, keys) => {
    keys.forEach((essentialKey) => {
        let errorMessage = 'Required Parameter. (key = ';
        if(Array.isArray(essentialKey)) {
            let isMissing = true;
            essentialKey.forEach((subParam, i) => {
                if(params[subParam]){
                    isMissing = false;
                }
                const additionalKey = i ===0 ? subParam : ` or ${subParam}`;
                errorMessage+= additionalKey;
            });
            errorMessage+= ')';
            if(isMissing){
                throw new Error(errorMessage);
            }
        } else {
            if(!params[essentialKey]){
                errorMessage += essentialKey + ')';
                throw new Error(errorMessage);
            }
        }
    });
};


const defaultErrorHandler = () => {
    // CAUTION: DO NOT REMOVE 'next' PARAMETER FROM RETURNING FUNCTION.
    return (err, req, res, next) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        const errorResponse = {
            detail: {
                message: err.details || err.message,
                code: err.error_code || 'ERROR_UNKNOWN',
                fail_items: {}  as any
            }
            //TODO: specify type of fail_items
        };

        if (err.fail_items) {
            errorResponse.detail.fail_items = err.fail_items;
        }

        res.json(errorResponse);
    };
};

export interface ErrorModel extends Error {
    Error?: any;
    status?: number;
    error_code?: string;
    fail_items?: any;
}

export {
    notFoundErrorHandler,
    defaultErrorHandler,
    essentialParamErrorHandler
};
