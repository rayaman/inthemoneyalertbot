const express = require('express')
const router = new express.Router()
const sendMail = require("../email/email")
// We handle web requests
router.post("/bidform", async (req,res)=>{
    const {name,email,phone,lot,url,subject,bid} = req.body
    sendMail({
        from: 'worldauctiongallery@gmail.com',
        to: 'worldauctiongallery@gmail.com',
        subject: subject,
        text: 
`Lot: ${lot}
Link: ${url}
Bid: $${bid}

Name: ${name}
Email: ${email}
Phone: ${phone}`
    })
})
router.post("/lotform", (req,res)=>{
    const {name,email,phone,message,lot,url,subject,bid} = req.body
    sendMail({
        from: 'worldauctiongallery@gmail.com',
        to: 'worldauctiongallery@gmail.com',
        subject: subject,
        text: 
`Lot: ${lot}
Link: ${url}

Name: ${name}
Email: ${email}
Phone: ${phone}
Message: ${message}`
    })
})
router.post("/contactform", (req,res)=>{
    const {name,email,phone,message} = req.body
    sendMail({
        from: 'worldauctiongallery@gmail.com',
        to: 'worldauctiongallery@gmail.com',
        subject: "Contact Us",
        text: 
`Name: ${name}
Email: ${email}
Phone: ${phone}
Message: ${message}`
    })
})

router.get("/cforms", (req,res)=>{
    if(req.query.fname,req.query.lname,req.query.subject,req.query.email,req.query.message){
        const {fname,lname,subject,email,message} = req.query
        setTimeout(function() {
            res.render("cformsT")
            sendMail({
                from: 'worldauctiongallery@gmail.com',
                to: 'worldauctiongallery@gmail.com',
                subject: subject,
                text: 
`Name: ${fname+" "+lname}
Email: ${email}
Message: ${message}`
            })
        }, 2000);
    } else {
        res.render("cforms")
    }
})
router.get('*', (req, res) => {
    res.render('404', {
        message: "The page you were looking could not be found!",
        title: "404 Page Not Found!"
    })
})
module.exports = router