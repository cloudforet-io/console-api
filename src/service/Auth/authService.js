import auth from '@/models/Auth/auth';
import User from '@/models/User/user';
import jwt from 'jsonwebtoken';

import restController from '@/controllers/REST/restController';

export default {

  registerUser: (req, res, next) => {
    const {
      user_name,
      password,
      user_first_name,
      user_last_name,
      email_address,
      admin,
    } = req.body;

    let newUser = User.create(user_name, password, user_first_name, user_last_name, email_address, admin);

    const create = (user) => {
      if (user) throw new Error('username exists');
      else return restController.postSaveExec(newUser, req, res, next);
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
            // eslint-disable-next-line no-undef
            jwt.sign(
              {
                user_name: user.user_name,
              },
              secret,
              {/* Example: expiresIn 1hour ->1h, 1day -> 1d, half hour -> 1800 */
                expiresIn: '1h',
                issuer: 'Cloud One',
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
    const selector = { user_name };
    restController.getFindOneExec(User, selector, req, res, next)
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
  sessionRedirect: (req, res, next) => {
    res.render('redirect');
  },
  sessionCheck: (req, res, next) => {
    if (req.session.logined) {
      // next();
      res.render('logout', { user_name: req.session.user_id });
    } else {
      res.render('login');
    }
  },

  sessionLogin: (req, res, next) => {
    const {
      user_name,
      password,
    } = req.body;
    const check = (user) => {
      console.log('user', user);
      if (!user) {
        throw new Error('NO USER AVAILABLE');
      } else if (user.verify(password)) {
        //TODO:: NEED TO CHECK GRPC AS WELL AND CONNECT THROUGH WITH KEY
        req.session.logined = true;
        req.session.user_name = req.body.user_name;
      } else {
        throw new Error('login failed');
      }
    };
    const respond = (session) => {
      res.json({
        message: 'logged in successfully',
        session,
      });
    };
    // error occured
    const onError = (error) => {
      res.status(403).json({
        message: error.message,
      });
    };
    // find the user
    const selector = { user_name };
    restController.getFindOneExec(User, selector, req, res, next)
      .then(check)
      .then(respond)
      .catch(onError);
  },
  sessionLogout: (req, res, next) => {
    req.session.destroy();
    res.json({
      message: 'logged out successfully'
    });
    next()
  },
};
