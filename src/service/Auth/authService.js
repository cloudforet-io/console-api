import auth from '@/models/Auth/auth';
import User from '@/models/User/user';
import jsonwebtoken from 'jsonwebtoken';

import restController from '@/controllers/REST/restController';

export default {

  registerUser: (req, res, next) => {
    let newUser = null;
    const {
      user_name,
      password,
      user_first_name,
      user_last_name,
      email_address,
      admin,
    } = req.body;

    const userRequest = User.create(user_name, password, user_first_name, user_last_name, email_address, admin);

    const create = (user) => {
      if (user) throw new Error('username exists');
      else return restController.postSaveExec(userRequest, req, res, next);
    };

    const count = (user) => {
      newUser = user;
      return restController.getCountExec(User, req, res, next);
    };

    const assign = (count) => {
      if (count === 1 || req.body.admin) {
        newUser = newUser.assignAdmin();
        return restController.postSaveExec(newUser, req, res, next);
      }
      // if not, return a promise that returns false
      return Promise.resolve(false);
    };

    const respond = (isAdmin) => {
      res.json({
        message: 'registered successfully',
        admin: !!isAdmin,
      });
    };
    // run when there is an error (username exists)
    const onError = (error) => {
      res.status(409).json({
        message: error.message,
      });
    };

    const selector = { user_name };
    restController.getFindOneExec(User, selector, req, res, next)
      .then(create)
      .then(count)
      .then(assign)
      .then(respond)
      .catch(onError);
  },
  login: (req, res, next) => {
    const {
      user_name,
      password,
      user_first_name,
      user_last_name,
      email_address,
      admin,
    } = req.body;

    const secret = req.app.get('jwt-secret');

    const check = (user) => {
      console.log('user', user);
      if (!user) {
        // user does not exist
        throw new Error('login failed');
      } else {
        // user exists, check the password
        if (user.verify(password)) {
          // create a promise that generates jwt asynchronously
          const p = new Promise((resolve, reject) => {
            jsonwebtoken.sign(
              {
                _id: user._id,
                user_name: user.user_name,
                admin: user.admin,
              },
              secret,
              {
                expiresIn: '7d',
                issuer: 'cloudone.com',
                subject: 'userInfo',
              }, (err, token) => {
                if (err) reject(err);
                resolve(token);
              },
            );
          });
          return p;
        }
        throw new Error('login failed');
      }
    };

    // respond the token
    const respond = (token) => {
      res.json({
        message: 'logged in successfully',
        token,
      });
    };

    // error occured
    const onError = (error) => {
      res.status(403).json({
        message: error.message,
      });
    };

    // find the user
    User.findOneByUsername(user_name)
      .then(check)
      .then(respond)
      .catch(onError);
  },
  verifyLogin: (req, res, next) => {
    res.json({
      success: true,
      info: req.decoded,
    });
  },

};
