import express from 'express';
import userService from '@/route/identity/identity_service/user_service';

const userRoute = express.Router();

// create User
userRoute.post('/', userService.createUser);

// select all users
userRoute.get('/', userService.getAllusers);

// select all users by first name
userRoute.get('/first-names/:user_first_name', userService.getUsersByFirstName);

// select all  users by last name
userRoute.get('/last-names/:user_last_name', userService.getUsersByLastName);

// select a single user by user_id
userRoute.get('/:user_id', userService.getSingleUser);

// select users by first name
userRoute.get('/first_name/:user_first_name', userService.getSingleUserByFirstName);

// select users by last name
userRoute.get('/last_name/:user_last_name', userService.getSingleUserByLastName);

// update a user info by user_id
userRoute.put('/:users_id', userService.updateUser);

// delete a user by user_id
userRoute.delete('/:users_id', userService.deleteUser);

// this must] be declared at end of the file.
export default userRoute;
