//import modelCommon
var modelCommon = require('../modelCommon');
var Schema = modelCommon.mongooseImport.Schema;

var UserSchema = new Schema({
    user_name: String,
    password: String,
    user_first_name: String,
    user_last_name: String,
    email_address: String,
    created_date: { type: Date, default: Date.now }},{
    versionKey: false }
    );

module.exports = modelCommon.mongooseImport.model('user', UserSchema);
