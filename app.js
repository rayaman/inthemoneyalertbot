var result = require('dotenv').config()
const http = require('http')
const axios = require('axios')
if (result.error) {
    throw result.error
}
//bot link
//https://discordapp.com/api/oauth2/authorize?client_id=669932912854171678&permissions=268635200&scope=bot
const Discord = require('discord.js')
//const alpha = require('alphavantage')({ key: process.env.ALPHA });

const bot = new Discord.Client()

const TOKEN = process.env.TOKEN

var aliases = {
    alert: ["a", "alerts"],
    removealert: ["r", "removealerts", "removeallalerts", "remove", "removeall"],
    show: ["s"]
}

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`)
    manageStatus()
});
var speak = true
function reply(msg, txt) {
    if (!speak)
        return
    msg.reply(txt)
}
function send(msg, txt) {
    if (!speak)
        return
    msg.channel.send(txt)
}
function alert(args, msg) {
    var alreadyHave = new Array();
    var noHave = new Array();
    if (args.length == 0) {
        //Display all alerts
        msg.member.roles.find(r => {
            if(r.name.startsWith("$")){
                alreadyHave.push(r.name.substring(1))
            }
        })
        send(msg,"Roles you currently have: "+alreadyHave)
        return
    }
    for (var a in args) {
        if(msg.member.roles.find(r => r.name === "$"+args[a])){
            alreadyHave.push(args[a])
        } else {
            noHave.push(args[a])
            addRole(msg,"$"+args[a])
        }
    }
    var str = ""
    if (alreadyHave.length>0){
        str+="You already have the role(s): "+alreadyHave+" "
    }
    if (noHave.length>0){
        str+="Added the role(s): "+noHave
    }
    if(str.length>0){
        send(msg,str)
    }
}
function removealert(args, msg) {
    if (args.length == 0) {
        msg.member.roles.find(r => {
            if(r.name.startsWith("$")){
                removeRole(msg,r.name)
            }
        })
        send(msg,"Removed all roles!")
        return
    }
    for (var a in args) {//removeTag
        role = roleExists(msg, "$" + args[a])
        if(msg.member.roles.has(role.id)){
            removeRole(msg, "$" + args[a])
        }
        send(msg,"Removed given roles!")
    }
}
function tickerExists(ticker, callback) {
    var options = {
        host: 'eoddata.com',
        port: 80,
        path: '/stockquote/NASDAQ/' + ticker + '.htm'
    };

    http.get(options, function (res) {
        callback(res.statusCode === 200)
        return
    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    });
}
function alias(cmd) {
    for (var k in aliases) {
        var v = aliases[k]
        if (v.indexOf(cmd) >= 0) {
            return k
        }
    }
    //If an alias was not found, then we either have the non alias name or a invalid command
    return cmd
}
function roleExists(message, r) {
    return message.guild.roles.find(role => role.name === r);
}
function userHasRoles(message, roles) {
    return message.member.roles.some(r => roles.includes(r.name))
}
function createRole(msg, r, callback) {
    if (roleExists(msg, r)) {
        callback(roleExists(msg, r))
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
function deleteRole(msg, r) {
    var role = roleExists(msg, r)
    if (role) {
        role.delete()
    }
}
function addRole(msg, role) {
    if (userHasRoles(msg, role)) {
        return
    }
    createRole(msg, role, (role) => {
        msg.member.addRole(role).catch(console.error);
    })
}
function removeRole(msg, role) {
    if (userHasRoles(msg, role) && roleExists(msg, role)) {
        msg.member.removeRole(roleExists(msg, role)).catch(console.error);
    }
}
function CheckTickers(msg) {
    msg.guild.roles.forEach(role => {
        if (msg.guild.roles.get(roleExists(msg, role.name).id).members.map(m => m.user.tag).join('') === "") {
            if (role.name.startsWith("$")) { // Delete only roles that have $... that are no longer in use
                deleteRole(msg, role.name)
            }
        }
    })
}
function Purge(msg){
    msg.guild.members.forEach(member => {
        member.roles.forEach(role => {
            if(role.name.startsWith("$")){
                role.delete()
            }
        })
    })
}
function show(msg,args){
    if (args.length<1){
        send(msg,"Command cannot currently be used without tickers! Please use like: !show ticker or !show ticker1,ticker2,...")
        return
    }
    for(var a in args){
        args[a] = "$"+args[a]
    }
    var list = {}
    msg.guild.members.forEach(member => {
        if(!(member.displayName in list)){
            list[member.displayName] = new Array()
        }
        member.roles.forEach(role => {
            if(args.includes(role.name)){
                list[member.displayName].push([role.name])
            }
        })
    })
    var arr = new Array()
    for(var i in list) {
        if (list[i].length>0) {
            arr.push({"name": i,"value": list[i].toString()})
        }
    }
    var test = {
        "embed": {
            "description": "**List of Users watching one or more of: "+ args +"**",
            "fields": arr
        }
    }
    send(msg,test)
}
const url = "https://money.cnn.com/data/fear-and-greed/"
function manageStatus(){
    axios.get(url).then(response => {
        setStatus("Fear & Greed"+response.data.match(/: (\d*) (\(.*?\))/g)[0])
    }).catch(error=>{
        console.log(error)
    })
}
setInterval(function(){
    manageStatus()
},18000000)
function setStatus(name){
    bot.user.setStatus("online")
    bot.user.setPresence({
        game: {
            name: name,
            type: "WATCHING"
        }
    })
}
bot.on('message', msg => {
    //Ignore all messages not starting with '!'
    if (msg.content.startsWith("!")) {
        var rawmsg = msg.content.substring(1);
        if (rawmsg.includes(",")) {
            var _cmd = rawmsg.split(" ")
            var args = [_cmd[0]]
            args = args.concat(_cmd[1].split(","))
        } else {
            var args = rawmsg.split(" ")
        }
        var cmd = alias(args.shift())
        for(var a in args){
            args[a]=args[a].toUpperCase()
        }
        // Remember to modify the aliases dictonary! The key is the case being tested
        switch (cmd) {
            case "alert":
                alert(args, msg)
                break
            case "removealert":
                removealert(args, msg)
                setTimeout(function(){
                    CheckTickers(msg)
                }, 1000);
                break
            case "show":
                show(msg,args)
                break
            case "quiet":
                if (msg.author.id == 137988979088818177) {
                    speak = false
                }
                break
            case "speak":
                if (msg.author.id == 137988979088818177) {
                    speak = true
                }
                break
            case "init":
                if (msg.author.id == 137988979088818177) {
                    console.log("Selected Server!")
                }
                break
            case "purge":
                if (msg.author.id == 137988979088818177) {
                    Purge(msg)
                }
                break
            case "test":
                var test = {
                    "embed": {
                        "description": "**List of Users watching: [tags]**",
                        "fields": [{
                            "name": "name1",
                            "value": "[list here]"
                        },
                        {
                            "name": "name2",
                            "value": "[list]]"
                        }]
                    }
                }
                send(msg,test)
                break
            default:
                send(msg, "Invalid command '" + cmd + "'")
        }
    }
});
bot.login(TOKEN)