import User from '@/model/identity/user';
import jwt from 'jsonwebtoken';

import restController from '@/controller/rest/rest_controller';

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
        res.status(401).json({
          message: 'NO USER',
        });
      } else if (user.verify(password)) {
        // TODO:: NEED TO CHECK GRPC AS WELL AND CONNECT THROUGH WITH KEY
        const p = new Promise((resolve, reject) => {
          req.session.logined = true;
          req.session.user_name = req.body.user_name;
          resolve(req.session);
        });
        return p;
      } else {
        throw new Error('login failed');
      }
    };
    const respond = (session) => {
      res.json({
        message: 'logged in successfully',
        sessionId: session.id,
      });
    };
    // error occured
    const onError = (error) => {
      res.status(403).json({
        message: error.message,
      });
    };
    const selector = { user_name };
    restController.getFindOneExec(User, selector, req, res, next)
      .then(check)
      .then(respond)
      .catch(onError);
  },
  sessionLogout: (req, res, next) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          next(err);
        } else {
          res.clearCookie('connect.sid');
          res.json({
            msg: 'logged out successfully',
          });
        }
      });
    }
  },
};
