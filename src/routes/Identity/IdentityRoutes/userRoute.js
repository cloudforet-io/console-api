import express from 'express';

import userService from '../IdentityService/userService';

const userRoute = express.Router();

// create User
userRoute.post('/', userService.createUser);

// select all users
userRoute.get('/', userService.getAllusers);

// select all users by first name
userRoute.get('/firstNames/:user_first_name', userService.getUsersByFirstName);

// select all  users by last name
userRoute.get('/lastNames/:user_last_name', userService.getUsersByLastName);

// select a single user by user_id
userRoute.get('/:users_id', userService.getSingleUser);

// select users by first name
userRoute.get('/firstName/:user_first_name', userService.getSingleUserByFirstName);

// select users by last name
userRoute.get('/lastName/:user_last_name', userService.getSingleUserByLastName);

// update a user info by user_id
userRoute.put('/:users_id', userService.updateUser);

// delete a user by user_id
userRoute.delete('/:users_id', userService.deleteUser);

// this must] be declared at end of the file.
export default userRoute;
