import express from 'express';
import { userService } from '@/service/';

const userRouter = express.Router();

// create User
userRouter.post('/', userService.createUser);

// select all users
userRouter.get('/', userService.getAllusers);

// select all users by first name
userRouter.get('/firstNames/:user_first_name', userService.getUsersByFirstName);

// select all  users by last name
userRouter.get('/lastNames/:user_last_name', userService.getUsersByLastName);

// select a single user by user_id
userRouter.get('/:users_id', userService.getSingleUser);

// select users by first name
userRouter.get('/firstName/:user_first_name', userService.getSingleUserByFirstName);

// select users by last name
userRouter.get('/lastName/:user_last_name', userService.getSingleUserByLastName);

// update a user info by user_id
userRouter.put('/:users_id', userService.updateUser);

// delete a user by user_id
userRouter.delete('/:users_id', userService.deleteUser);

// this must] be declared at end of the file.
export default userRouter;
