var router = require('express').Router(),
    userRouter = require('./users')

router.use('/user/', userRouter)

module.exports = router