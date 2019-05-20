const UserRouter = require("./User/userRoutes");
const Router = require("express").Router();

Router.use('/users', UserRouter);

module.exports = Router;