const express = require('express')
const router = new express.Router()
const Auction = require("../models/auctions")
const Lot = require("../models/lots")
// We handle auction lots
function notFound(res) {
    res.render('404', {
        message: "The page you were looking could not be found! Please check to see if your path was typed correctly.",
        title: "404 Page Not Found!"
    })
}
router.get("/lot", async (req, res) => {
    if (req.query.lot && req.query.auction && !req.query.sole) {
        var lot = await Lot.findOne({ lotID: req.query.lot, auctionID: req.query.auction })
        var auction = true // This will eventually be a database response
        if (!lot || !auction) {
            notFound(res)
            return
        }
        res.render('lot', {
            lot: lot.lotID,
            lead: lot.lead,
            min: lot.min,
            max: lot.max,
            id: lot.auctionID,
            mainurl: lot.images[0],
            sold: lot.sold,
            hammer: lot.hammer,
            desc: lot.desc
        })
    } else if (req.query.lot && req.query.auction) {
        var lot = await Lot.findOne({ lotID: req.query.lot, auctionID: req.query.auction })
        if (lot) {
            res.send({ images: lot.toJSON().images })
        } else {
            res.send({ nolot: true })
        }
    } else {
        notFound(res)
    }
})
router.get("/lots", async (req, res) => {
    // Get list of lots in an auction
    // Connect to database and send like this when all is ready
    if (req.query.id) {
        var id = req.query.id
        var auc = await Auction.findOne({ auctionID: id })
        if (!auc) {
            res.send({
                title: "Selected auction does not exist!",
                disc: "",
                error: "Must enter an auction ID!",
                lots: [{ id: -1 }]
            })
            return
        }
        var list = await Lot.find({ auctionID: id }).sort({ lotID: 1 })
        var newList = []
        for (var i in list) {
            newList.push(list[i].toJSON())
        }
        res.send({
            title: auc.auctionTitle,
            disc: auc.discription,
            lots: newList
        })
    } else {
        res.status(404).send({
            error: "Must enter an auction ID!"
        })
    }
})

module.exports = router