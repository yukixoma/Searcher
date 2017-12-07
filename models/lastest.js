var mongoose  = require("mongoose");
var Schema = mongoose.Schema;

var lastestSchema = new Schema ({
    term : String,
}, {timestamps: true});

var ModelClass = mongoose.model("lastest",lastestSchema);

module.exports = ModelClass;