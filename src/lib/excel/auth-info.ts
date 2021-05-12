import httpContext from 'express-http-context';

export const setAuthInfo = (authInfo) => {
    httpContext.set('token', authInfo.token);
    httpContext.set('user_id', authInfo.user_id);
    httpContext.set('domain_id', authInfo.domain_id);
    httpContext.set('user_type', authInfo.user_type);
};
