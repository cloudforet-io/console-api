import User from '@/models/User/user';

export default {

  getAllusers: (req, res) => {
    User.find((err, users) => {
      if (err) return res.status(500).send({ error: 'database failure' });
      res.json(users);
    });
  },
  getSingleUser: (req, res) => {
    User.findOne({ _id: req.params.users_id }, (err, user) => {
      if (err) return res.status(500).json({ error: err });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    });
  },
  registerUser: (req, res) => {
    const user = new User();
    user.user_name = req.body.userName;
    user.password = req.body.password;
    user.user_first_name = req.body.userFirstName;
    user.user_last_name = req.body.userLastName;
    user.email_address = req.body.email;
    user.created_date = Date.now();

    user.save((err) => {
      if (err) {
        console.error(err);
        res.json({ result: 0 });
        return;
      }
      res.json({ result: 1 });
    });
  },
  deleteUser: (req, res) => {
    User.deleteOne({ _id: req.params.users_id }, (err, output) => {
      if (err) return res.status(500).json({ error: 'database failure' });
      if (!output.result) return res.status(404).json({ error: 'User not found' });
      res.json({ message: 'User deleted' });
      res.status(204).end();
    });
  },

  updateUser: (req, res) => {
    console.log(`requestBody (function updateUser): ${req.body}`);
    console.log(`Request: ${req}`);

    User.findById({ _id: req.params.users_id }, (err, user) => {
      if (err) {
        return res.status(500).json({
          error: 'database failure',
        });
      }
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      if (req.body.userName) user.user_name = req.body.userName;

      // user.password = req.body.password;
      // user.user_first_name = req.body.userFirstName;
      // user.user_last_name = req.body.userLastName;
      // user.email_address = req.body.email;
      // user.created_date = Date.now();

      user.save((_err) => {
        if (_err) {
          return res.status(500).json({
            message: 'Error when updating Expense.',
            error: _err,
          });
        }
        res.json(user);
      });
    });
  },
};
