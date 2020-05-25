import tagRouter from '@/routes/tag';
import asyncHandler from 'express-async-handler';
import httpContext from 'express-http-context';

const setTagRouter = async (essentialTagParam) => {
    const router = essentialTagParam.router;
    router.use('/tag', bulkMiddleHandler(essentialTagParam), tagRouter);
};

const bulkMiddleHandler = (essentialTagParam) => {
    return asyncHandler(async (req, res, next) => {
        const actionURI = req.path.toString();
        essentialTagParam['actionURI'] = actionURI;
        essentialTagParam['domain_id'] = essentialTagParam.domain_id ? essentialTagParam.domain_id : httpContext.get('domain_id');
        req.body.tag_action = essentialTagParam;
        next();
    });
};


const parameterBuilder = (list, update, key, router, essentialKey) => {
    return {
        list,
        update,
        key,
        router,
        ... essentialKey && {essentialKey : essentialKey}
    };
};

export {
    setTagRouter,
    parameterBuilder
};