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
      url,
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
  sesionCheck: (req, res, next) => {
    if(req.session.key){
      console.log('ok session valid ('+req.session.key +')');
      res.send('session valid(current login)');
    }else{
      console.log('not session is not valid (' + req.session.key+')');
      res.send('session is not valid (login please) ');
    }
  },
  sessionLogin: (req, res, next) => {
    if(req.session.key){
      console.log('ok session valid ('+req.session.key+')');
      res.send('session valid(current login)');
    }else{
      req.session.key = req.body.id;
      console.log('session save success (' + req.session.key+')');
      res.send('session save success');
    }
  },
  sessionLogout: (req, res, next) => {
    req.session.destory(function(err){
      if(err){
        console.log(err);
        res.send('session is not destroy');
      }else{
        console.log('session destroy success...');
        res.send('session is destroy');
      }
    });
  },
  updateLoginStatus: (req, res, next) => {
    let user = {      //회원 정보
      user_id: "iamnewyorker1",
      password: "this_is_my_scret_password1"
    };
    debugger;
    if(req.body.user_name == user.user_name && req.body.password == user.password){
      req.session.logined = true;
      req.session.user_id = req.body.user_name;
      res.render('logout', { user_name: req.session.user_name });
    } else {
      res.send(`
        <h1>Who are you?</h1>
        <a href="/">Back </a>
      `);
    }
  }
};
