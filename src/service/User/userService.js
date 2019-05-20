const User = require("../../models/User/user");
    module.exports = {
        getAllusers: function(req,res){
            User.find(function(err, users){
                if(err) return res.status(500).send({error: 'database failure'});
                res.json(users);
            })
        },
        getSingleUser: function(req,res){
            User.findOne({_id: req.params.users_id}, function(err, user){
                if(err) return res.status(500).json({error: err});
                if(!user) return res.status(404).json({error: 'User not found'});
                res.json(user);
            })
        },
        registerUser: function(req,res){
                 var user = new User();
                 user.user_name = req.body.userName;
                 user.password = req.body.password;
                 user.user_first_name = req.body.userFirstName;
                 user.user_last_name = req.body.userLastName;
                 user.email_address = req.body.email;
                 user.created_date = Date.now();

                 user.save(function(err){
                     if(err){
                         console.error(err);
                         res.json({result: 0});
                         return;
                     }
                     res.json({result: 1});

                 });
        },
        deleteUser: function(req,res){
            User.deleteOne({_id: req.params.users_id }, function(err, output){
                if(err) return res.status(500).json({ error: "database failure" });
                if(!output.result) return res.status(404).json({ error: "User not found" });
                res.json({ message: "User deleted" });
                res.status(204).end();

            })
        },

        updateUser: function(req,res){

            console.log("requestBody (function updateUser): " + req.body);
            console.log("Request: " + req);

            User.findById({_id: req.params.users_id }, function(err, user){

                if(err) return res.status(500).json({
                    error: 'database failure'
                });
                if(!user) return res.status(404).json({
                    error: 'User not found'
                });


                if(req.body.userName) user.user_name = req.body.userName;

                // user.password = req.body.password;
                // user.user_first_name = req.body.userFirstName;
                // user.user_last_name = req.body.userLastName;
                // user.email_address = req.body.email;
                // user.created_date = Date.now();

                user.save(function(err){
                    if(err){
                        return res.status(500).json({
                            message: 'Error when updating Expense.',
                            error: err
                        });
                    }
                    res.json(user);

                });
            });
        }
    }