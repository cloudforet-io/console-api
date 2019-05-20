//import modelCommon
var modelCommon = require('../modelCommon');
var Schema = modelCommon.mongooseImport.Schema;

var plugInSchema = new Schema({

});

module.exports = modelCommon.mongooseImport.model('plugIn', plugInSchema);