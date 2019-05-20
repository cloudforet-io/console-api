//import modelCommon
var modelCommon = require('../modelCommon');
var Schema = modelCommon.mongooseImport.Schema;

var infraLayerSchema = new Schema({

});

module.exports = modelCommon.mongooseImport.model('infraLayer', infraLayerSchema);
