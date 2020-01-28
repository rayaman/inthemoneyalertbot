const schedule = require('node-schedule')
schedule.scheduleJob('1 0 * * *',()=>{
    console.log("hello!")
})