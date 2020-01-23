var result = require('dotenv').config()
if (result.error){
    throw result.error
}
//bot link
//https://discordapp.com/api/oauth2/authorize?client_id=669932912854171678&permissions=268635200&scope=bot
const Discord = require('discord.js')
const User = require('./models/user.js')
require("./db/mongoose")

const bot = new Discord.Client()

const TOKEN = process.env.TOKEN

var aliases = {
    alert: ["a"],
    removealert: ["r","ra","rem"],
}

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`)
});
function alert(args,msg){
    User.findOne({name: msg.author.id}, function(err,user){
        if(!err){
            User.addTag(user,args)
            console.log("Added to:",user)
        } else {
            console.log("Hmm Something went wrong!")
        }
    })
    // TODO add function contents
}
function removealert(args,msg){
    // TODO add function contents
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
        var args = rawmsg.split(" ")
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