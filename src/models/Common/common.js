//import modelCommon
var modelCommon = require('../modelCommon');
var Schema = modelCommon.mongooseImport.Schema;

var commonSchema = new Schema({

});

module.exports = modelCommon.mongooseImport.model('common', commonSchema);
