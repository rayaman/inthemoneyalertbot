var result = require('dotenv').config()
if (result.error){
    throw result.error
}
//bot link
//https://discordapp.com/api/oauth2/authorize?client_id=669932912854171678&permissions=268635200&scope=bot
const Discord = require('discord.js')
const Tag = require('./models/tag.js')
require("./db/mongoose")

const bot = new Discord.Client()

const TOKEN = process.env.TOKEN

var aliases = {
    alert: ["a","alerts"],
    removealert: ["r","ra","rem","removealerts"],
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
                Tag.addTag(msg.author.id,tag)
            }
            if(done){
                if(have.length>0 && nohave.length>0){
                    msg.reply("You already have alerts for " + have + "! Added alerts for "+ nohave + "!")
                } else if (have.length>0){
                    msg.reply("You already have alerts for " + have + "!")
                } else if (nohave.length>0){
                    msg.reply("Added alerts for "+ nohave + "!")
                } else {
                    msg.reply("No tickers were supplied!")
                }
            }
        },alreadyHave,noHave,parseInt(a)+1,args.length)
    }    
}
function removealert(args,msg){
    var alreadyHave = new Array();
    var noHave = new Array();
    for(var a in args){//removeTag
        Tag.tagExists(msg.author.id,args[a],(b,tag,_t,have,nohave,done)=>{
            if(b){
                Tag.removeTag(msg.author.id,tag)
                have.push(tag)
            } else {
                nohave.push(tag)
            }
            if(done){
                if(have.length>0 && nohave.length>0){
                    msg.reply("Removed alerts for " + have + "! Cannot remove alerts for "+ nohave + " (No alerts were are registered)!")
                } else if (have.length>0){
                    msg.reply("Removing alerts for " + have + "!")
                } else if (nohave.length>0){
                    msg.reply("Cannot remove alerts for " + nohave + " (No alerts were are registered)!")
                } else {
                    msg.reply("No tickers were supplied!")
                }
            }
        },alreadyHave,noHave,parseInt(a)+1,args.length)
    }
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
bot.on('message', msg => {
    //Ignore all messages not starting with '!'
    if (msg.content.startsWith("!")) {
        var rawmsg = msg.content.substring(1);
        if(rawmsg.includes(",")){
            var _cmd = rawmsg.split(" ")
            var args = [_cmd[0]]
            args = args.concat(_cmd[1].split(","))
        } else {
            var args = rawmsg.split(" ")
        }
        console.log(args)
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