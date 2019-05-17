var userRouter = require('express').Router(),
    userService = require('../service/userService.js');

userRouter.get('/list', userService.list);

module.exports = userRouter;