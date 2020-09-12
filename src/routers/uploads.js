const express = require('express')
const router = new express.Router()
const Auction = require("../models/auctions")
const Lot = require("../models/lots")
var activeID = 0
var auctionID = 0
router.post("/uploadAuction", async (req,res) => {
    if (req.body.init==false || req.body.init==true){
        if(req.body.init){
            var auction = new Auction()
            Auction.count({}, function(err, c) {
                if (err){
                    console.log(err)
                    res.send({status: err})
                } else {
                    console.log(req.body)
                    auctionID = c+1
                    auction.auctionID = c+1;
                    auction.auctionTitle = req.body.title
                    auction.discription = req.body.desc
                    auction.save()
                    res.send({status: "OK"})
                }
            });
        } else {
            console.log("Finished Uploading")
            Auction.findOne({auctionID: auctionID}).then(async (data)=>{
                var lot = await Lot.findOne({lotID: 1})
                console.log(data,auctionID,lot)
                data.auctionIMG = lot.images[0]
                data.save()
                res.send({status: "OK"})
            }).catch((err)=>{
                console.log(err)
                res.send({status: err})
            })
        }
    } else if (req.body.lot){
        var lot = new Lot()
        lot.auctionID = auctionID
        lot.lotID = req.body.lot
        lot.lead = req.body.lead
        lot.desc = req.body.desc
        lot.min = req.body.min
        lot.max = req.body.max
        lot.images = req.body.images
        lot.save()
        res.send({status: "OK"})
    } else {
        res.send({status: "Unknown Error!"})
    }
})

module.exports = router