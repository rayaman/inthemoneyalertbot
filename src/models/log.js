const mongoose = require("mongoose")
require("../db/mongoose")
const logSchema = new mongoose.Schema({
    command: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
}, {
    timestamps: true
})
const Log = mongoose.model("Log", logSchema)
module.exports = Log