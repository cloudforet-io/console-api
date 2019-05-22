import User from '@/models/User/user';
import restController from '@/controllers/REST/restController';

export default {

  getAllusers: (req, res, next) => {
    restController.getFind(User, req, res, next);
  },
  getUsersByFirstName: (req, res, next) => {
    const selector = { user_first_name: req.params.user_first_name };
    restController.getFindWith(User, selector, req, res, next);
  },
  getUsersByLastName: (req, res, next) => {
    const selector = { user_last_name: req.params.user_last_name };
    restController.getFindWith(User, selector, req, res, next);
  },
  getSingleUser: (req, res, next) => {
    const selector = { _id: req.params.users_id };
    restController.getFindOne(User, selector, req, res, next);
  },
  getSingleUserByFirstName: (req, res, next) => {
    const selector = { user_first_name: req.params.user_first_name };
    restController.getFindOne(User, selector, req, res, next);
  },
  getSingleUserByLastName: (req, res, next) => {
    const selector = { user_last_name: req.params.user_last_name };
    restController.getFindOne(User, selector, req, res, next);
  },

  createUser: (req, res, next) => {
    const user = new User();
    user.user_name = req.body.userName;
    user.password = req.body.password;
    user.user_first_name = req.body.userFirstName;
    user.user_last_name = req.body.userLastName;
    user.email_address = req.body.email;
    user.created_date = Date.now();

    restController.postSave(user, req, res, next);
  },

  deleteUser: (req, res, next) => {
    const selector = { _id: req.params.users_id };
    restController.deleteSingle(User, selector, req, res, next);
  },

  updateSingle: (req, res, next) => {
    console.log('requestBody (function updateUser):', req.body);
    console.log(`Request: ${req}`);
    const selector = { _id: req.params.users_id };
    const updateObject = req.body;
    restController.updateSingle(User, selector, updateObject, req, res, next);
  },
};
