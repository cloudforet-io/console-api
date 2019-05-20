//import modelCommon
var modelCommon = require('../modelCommon');
var Schema = modelCommon.mongooseImport.Schema;

var assetSchema = new Schema({

});

module.exports = modelCommon.mongooseImport.model('asset', assetSchema);
