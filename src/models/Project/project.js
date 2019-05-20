//import modelCommon
var modelCommon = require('../modelCommon');
var Schema = modelCommon.mongooseImport.Schema;

var projectSchema = new Schema({

});

module.exports = modelCommon.mongooseImport.model('project', projectSchema);
