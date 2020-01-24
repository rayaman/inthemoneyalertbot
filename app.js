var result = require('dotenv').config()
if (result.error){
    throw result.error
}
//bot link
//https://discordapp.com/api/oauth2/authorize?client_id=669932912854171678&permissions=268635200&scope=bot
const Discord = require('discord.js')
const Tag = require('./models/tag.js')
require("./db/mongoose")
const alpha = require('alphavantage')({ key: process.env.ALPHA});

const bot = new Discord.Client()

const TOKEN = process.env.TOKEN

var aliases = {
    alert: ["a","alerts"],
    removealert: ["r","removealerts","removeallalerts","remove","removeall"],
}

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`)
});

function alert(args,msg){
    var alreadyHave = new Array();
    var noHave = new Array();
    for(var a in args){
        Tag.tagExists(msg.author.id,args[a],(b,tag,_t,have,nohave,done)=>{
            if(b){
                have.push(tag)
            } else {
                nohave.push(tag)
                addRole(msg,"$"+tag)
                Tag.addTag(msg.author.id,tag)
            }
            if(done){
                if(have.length>0 && nohave.length>0){
                    msg.channel.send("You already have alerts for " + have + "! Added alerts for "+ nohave + "!")
                } else if (have.length>0){
                    msg.channel.send("You already have alerts for " + have + "!")
                } else if (nohave.length>0){
                    msg.channel.send("Added alerts for "+ nohave + "!")
                } else {
                    msg.channel.send("No tickers were supplied!")
                }
            }
        },alreadyHave,noHave,parseInt(a)+1,args.length)
    }    
}
function removealert(args,msg){
    var alreadyHave = new Array();
    var noHave = new Array();
    if(args.length==0){
        Tag.removeTags(msg.author.id,(rec)=>{
            for(r in rec){
                removeRole(msg,"$"+rec[r])
            }
            msg.channel.send("Removed all of your alerts")
        })
        return
    }
    for(var a in args){//removeTag
        Tag.tagExists(msg.author.id,args[a],(b,tag,_t,have,nohave,done)=>{
            if(b){
                Tag.removeTag(msg.author.id,tag)
                have.push(tag)
                removeRole(msg,"$"+tag)
            } else {
                nohave.push(tag)
            }
            if(done){
                if(have.length>0 && nohave.length>0){
                    msg.channel.send("Removed alerts for " + have + "! Cannot remove alerts for "+ nohave + " (No alerts were are registered)!")
                } else if (have.length>0){
                    msg.channel.send("Removing alerts for " + have + "!")
                } else if (nohave.length>0){
                    msg.channel.send("Cannot remove alerts for " + nohave + " (No alerts were are registered)!")
                } else {
                    msg.channel.send("No tickers were supplied!")
                }
            }
        },alreadyHave,noHave,parseInt(a)+1,args.length)
    }
}
function tickerExists(ticker,callback){
    alpha.data.intraday(ticker).then(data => {
        callback(true)
    }).catch(err => {
        callback(false)
    });
}
function alias(cmd){
    for(var k in aliases){
        var v = aliases[k]
        if(v.indexOf(cmd) >= 0){
            return k
        }
    }
    //If an alias was not found, then we either have the non alias name or a invalid command
    return cmd
}
function roleExists(message,r){
    return message.guild.roles.find(role => role.name === r);
}
function userHasRoles(message,roles){
    return message.member.roles.some(r=>roles.includes(r.name)) 
}
function createRole(msg,r,callback){
    if(roleExists(msg,r)){
        callback(roleExists(msg,r))
        return
    }
    msg.channel.guild.createRole({
        name: r,
        color: 'GOLD',
        mentionable: true,
      })
        .then(callback)
        .catch(console.error)
}
function deleteRole(msg,r){
    var role = roleExists(msg,r)
    if(role){
        role.delete()
    }
}
function addRole(msg,role){
    if(userHasRoles(msg,role)){
        return
    }
    createRole(msg,role,(role) =>{
        msg.member.addRole(role).catch(console.error);
    })
}
function removeRole(msg,role){
    if(userHasRoles(msg,role) && roleExists(msg,role)){
        msg.member.removeRole(roleExists(msg,role)).catch(console.error);
    }
}
function CheckTickers(){
    var msg = MESSAGE
    msg.guild.roles.forEach(role => {
        if(msg.guild.roles.get(roleExists(msg,role.name).id).members.map(m=>m.user.tag).join('')===""){
            if(role.name.startsWith("$")){
                deleteRole(msg,role.name)
            }
        }
    })
}
var MESSAGE
setInterval(function(){
    if(MESSAGE){
        console.log("Checking...")
        CheckTickers()
    } // Check for unused tickers every 5 minutes. Will change to each day
}, 300000);//
bot.on('message', msg => {
    //Ignore all messages not starting with '!'
    if(!MESSAGE){
        MESSAGE = msg
    }
    if (msg.content.startsWith("!")) {
        var rawmsg = msg.content.substring(1);
        if(rawmsg.includes(",")){
            var _cmd = rawmsg.split(" ")
            var args = [_cmd[0]]
            args = args.concat(_cmd[1].split(","))
        } else {
            var args = rawmsg.split(" ")
        }
        var cmd = alias(args.shift())
        // Remember to modify the aliases dictonary! The key is the case being tested
        
        switch(cmd){
            case "alert":
                alert(args,msg)
                break
            case "removealert":
                removealert(args,msg)
                break
            default:
                msg.channel.send("Invalid command '"+ cmd +"'")
        }
    }
});
bot.login(TOKEN)