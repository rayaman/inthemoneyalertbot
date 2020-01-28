const axios = require('axios')
process.env.TZ = 'America/New_York'
reQuotes = new RegExp(/\/quote\/[\w]*\?p=([\w]*)/g)
reTime = new RegExp(/">(After Market Close|Before Market Open|Time Not Supplied|TAS)+/g)
var day=["sun","mon","tue","wed","thu","fri","sat"]
var tday=["mon","tue","wed","thu","fri"]
function getNextTradingDay(d){
    if(d==null){
        d = new Date()
        d.setHours(d.getHours()-5)
    }
    d.setDate(d.getDate()+1)
    if(tday.includes(day[d.getDay()])){
        return d.toISOString().substring(0,10)
    } else {
        return getNextTradingDay(d)
    }
}
function getTradingDay(){
    var d = new Date()
    d.setHours(d.getHours()-5)
    if(tday.includes(day[d.getDay()])){
        return d.toISOString().substring(0,10)
    } else {
        return getNextTradingDay(d)
    }
}

function earnings(url){
    let promise = new Promise(function(resolve, reject) {
        axios.get(url)
        .then(response => {
            response.data = response.data.replace(/<\!--.+?-->/sg,"")
            var list = response.data.match(reQuotes)
            var list2 = response.data.match(reTime)
            var arr = new Array()
            var arr2 = new Array()
            for(var l in list){
                arr.push(list[l].substring(list[l].indexOf("=")+1))
            }
            for(var l in list2){
                var s = list2[l].substring(2)
                if(s==="TAS"){
                    arr2.push("Time Not Supplied")
                } else {
                    arr2.push(s)
                }
            }
            resolve({sym: arr,time: arr2})
        })
        .catch(error =>{
            reject(error)
        })
    });
    return promise
}
async function getEarnings(callback){
    var urlToday = 'https://finance.yahoo.com/calendar/earnings?day='+getTradingDay()
    var urlTomorrow = 'https://finance.yahoo.com/calendar/earnings?day='+getNextTradingDay()
    var today = await earnings(urlToday)
    var tomorrow = await earnings(urlTomorrow)
    callback(today,tomorrow)
}
module.exports = {
    get: getEarnings
}