import User from '@/models/Identity/user';
import restController from '@/controllers/REST/restController';
import grpcController from '@/controllers/GRPC/grpcController';

export default {

  async getAllusers(req, res, next) {
    console.log('grpc test');
    grpcController.test();
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
    user.userId = req.body.userId;
    user.password = req.body.password;
    user.name = req.body.name;
    user.email = req.body.email;
    user.mobile = req.body.mobile;
    user.group = req.body.group;
    user.language = req.body.language;
    user.timezone = req.body.timezone;
    user.tags = req.body.tags;
    user.domainId = req.body.domainId;
    user.created_date = Date.now();

    restController.postSave(user, req, res, next);
  },

  deleteUser: (req, res, next) => {
    const selector = { _id: req.params.users_id };
    restController.deleteSingle(User, selector, req, res, next);
  },

  updateUser: (req, res, next) => {
    const selector = { _id: req.params.users_id };
    const updateObject = req.body;
    restController.updateSingle(User, selector, updateObject, req, res, next);
  },
};
