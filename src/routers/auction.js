const path = require("path")
const express = require('express')
const router = new express.Router()
const Auction = require("../models/auctions")
const Lot = require("../models/lots")
const sendMail = require("../email/internalemail")
const getLots = require("../templates/lottemplate")
// We handle auctions
router.get("/auctions", async (req, res) => {
    var list = await Auction.find({})
    console.log(list)
    res.send(list)
})
router.get("/auction", async (req, res) => {
    if (req.query.id) {
        var id = req.query.id
        var auc = await Auction.findOne({ auctionID: id })
        if (auc) {
            var html = await getLots(id, auc.discription, auc.auctionTitle)
            res.send(html)
        } else {
            res.render('404', {
                message: "The page you were looking could not be found!",
                title: "404 Page Not Found!"
            })
        }
    } else {
        res.render('404', {
            message: "The page you were looking could not be found!",
            title: "404 Page Not Found!"
        })
    }
})
router.post("/sendResults", async (req, res) => {
    Auction.find({}, async function (err, auctions) {
        if (err) {
            console.log(err);
        } else {
            for (a in auctions) {
                console.log(a)
                var lots = req.body.lots
                var c = await Lot.countDocuments({ auctionID: auctions[a].auctionID })
                console.log(lots.length, c)
                if (c == lots.length && !auctions[a].sales) {
                    auctions[a].sales = true,
                        auctions[a].save()
                    for (l in lots) {
                        var lot = await Lot.findOne({ lotID: lots[l][1], auctionID: auctions[a].auctionID })
                        if (lot == null)
                            return
                        lot.sold = lots[l][0]
                        console.log(lots[l][0])
                        if (lots[l][0] == "Sold") {
                            lot.hammer = lots[l][2]
                        }
                        lot.save()
                    }
                    return
                }
            }
            console.log("Cannot resolve auction")
            sendMail({
                from: 'ryan.pcrebels@gmail.com',
                to: 'ryan.pcrebels@gmail.com',
                subject: "Cannot Find Auction Manual Upload required!",
                text: JSON.stringify(req.body)
            })
        }
    })
    sendMail({
        from: 'ryan.pcrebels@gmail.com',
        to: 'ryan.pcrebels@gmail.com',
        subject: "Auction Sale Results",
        text: JSON.stringify(req.body)
    })
    res.send("Got Thanks!")
})
module.exports = router