//import modelCommon
var modelCommon = require('../modelCommon');
var Schema = modelCommon.mongooseImport.Schema;

var networkSchema = new Schema({

});

module.exports = modelCommon.mongooseImport.model('network', networkSchema);
