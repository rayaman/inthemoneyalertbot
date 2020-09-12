const mongoose = require("mongoose")
require("../db/mongoose")
const lotSchema = new mongoose.Schema({
    auctionID: {
        type: Number,
        required: true
    },
    lotID: {
        type: Number,
        required: true
    },
    inv: {
        type: String,
        required: false
    },
    live: {
        type: String,
        required: false
    },
    sold: {
        type: String,
        required: false,
        default: ""
    },
    hammer: {
        type: Number,
        required: false
    },
    desc: {
        type: String,
        required: true
    },
    lead: {
        type: String,
        required: true
    },
    min: {
        type: Number,
        required: true
    },
    max: {
        type: Number,
        required: true
    },
    images: {
        type: [String],
    },
    price: {
        type: Number,
        required: false,
    }
}, {
    timestamps: true
})
lotSchema.methods.toJSON = function () {
    return this.toObject()
}
const Lot = mongoose.model("Lot", lotSchema)
module.exports = Lot