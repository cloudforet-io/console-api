import express from 'express';

import commonRoute from '/route/common/common_route/common_route';

const Router = express.Router();

Router.use('/', commonRoute);

export default Router;
