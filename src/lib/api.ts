import listEndpoints from 'express-list-endpoints';

const apiReflection = (indexRouter) => {
    return (req, res) => {
        const apis:object[] = [];
        listEndpoints(indexRouter).forEach((route) => {
            apis.push({
                'path': route.path,
                'methods': route.methods
            });
        });
        res.status(200).json({
            'apis': apis
        });
    };
};

export {
    apiReflection
};
