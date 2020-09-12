const mongoose = require("mongoose")
require("../db/mongoose")
const auctionSchema = new mongoose.Schema({
    auctionTitle: {
        type: String,
        required: true,
        trim: true
    },
    discription: {
        type: String,
        required: true,
        trim: true
    },
    sales: {
        type: Boolean,
        required: false,
        default: false
    },
    auctionID: {
        type: Number,
        required: true,
    },
    auctionIMG: {
        type: String,
        required: false
    },
    highlights: {
        type: [String],
        required: false
    },
    auctionDate: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const Auction = mongoose.model("Auction", auctionSchema)
module.exports = Auction