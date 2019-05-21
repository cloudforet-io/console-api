import express from 'express';
import userService from '@/service/User/userService';

const userRouter = express.Router();

// create a user
userRouter.get('/', userService.getServiceUsers);

// select all users
userRouter.get('/', userService.getAllusers);

// select all users
userRouter.get('/', userService.get);

// select a single user by user_id
userRouter.get('/:users_id', userService.getSingleUser);

// select users by first name
// userRouter.get('/firstName/:user_first_name', userService.getSingleUser);

// select users by last name
// userRouter.get('/lastName/:user_last_name', userService.getSingleUser);

// update a user info by user_id
userRouter.put('/:users_id', userService.updateUser);

// delete a user by user_id
userRouter.delete('/:users_id', userService.deleteUser);

// this must] be declared at end of the file.
export default userRouter;
