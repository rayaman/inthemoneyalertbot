var result = require('dotenv').config()
const http = require('http')
if (result.error) {
    throw result.error
}
//bot link
//https://discordapp.com/api/oauth2/authorize?client_id=669932912854171678&permissions=268635200&scope=bot
const Discord = require('discord.js')
const Tag = require('./models/tag.js')
require("./db/mongoose")
const alpha = require('alphavantage')({ key: process.env.ALPHA });

const bot = new Discord.Client()

const TOKEN = process.env.TOKEN

var aliases = {
    alert: ["a", "alerts"],
    removealert: ["r", "removealerts", "removeallalerts", "remove", "removeall"],
}

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`)
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
        Tag.getTags(msg.author.id, (tags) => {
            if (tags.length > 0) {
                reply(msg, "List of tags: " + tags)
            } else {
                reply(msg, "You currently do not have any tags!")
            }
        })
        return
    }
    for (var a in args) {
        tickerExists(args[a], (bo) => {
            Tag.tagExists(msg.author.id, args[a], (b, tag, _t, have, nohave, done) => {
                if (!bo) {
                    b = true
                }
                if (b) {
                    have.push(tag)
                } else {
                    nohave.push(tag)
                    addRole(msg, "$" + tag)
                    Tag.addTag(msg.author.id, tag)
                }
                if (done) {
                    if (have.length > 0 && nohave.length > 0) {
                        send(msg, "Error adding tags " + have + ". Ticker(s) already exist or invalid! Added alerts for " + nohave + "!")
                    } else if (have.length > 0) {
                        send(msg, "Error adding tags " + have + ". Ticker(s) already exist or invalid!")
                    } else if (nohave.length > 0) {
                        send(msg, "Added alerts for " + nohave + "!")
                    } else {
                        send(msg, "No tickers were supplied!")
                    }
                }
            }, alreadyHave, noHave, parseInt(a) + 1, args.length)
        })
    }
}
function removealert(args, msg) {
    var alreadyHave = new Array();
    var noHave = new Array();
    if (args.length == 0) {
        Tag.removeTags(msg.author.id, (rec) => {
            for (r in rec) {
                removeRole(msg, "$" + rec[r])
            }
            send(msg, "Removed all of your alerts")
        })
        return
    }
    for (var a in args) {//removeTag
        Tag.tagExists(msg.author.id, args[a], (b, tag, _t, have, nohave, done) => {
            if (b) {
                Tag.removeTag(msg.author.id, tag)
                have.push(tag)
                removeRole(msg, "$" + tag)
            } else {
                nohave.push(tag)
            }
            if (done) {
                if (have.length > 0 && nohave.length > 0) {
                    send(msg, "Removed alerts for " + have + "! Cannot remove alerts for " + nohave + " (No alerts were are registered)!")
                } else if (have.length > 0) {
                    send(msg, "Removing alerts for " + have + "!")
                } else if (nohave.length > 0) {
                    send(msg, "Cannot remove alerts for " + nohave + " (No alerts were are registered)!")
                } else {
                    send(msg, "No tickers were supplied!")
                }
            }
        }, alreadyHave, noHave, parseInt(a) + 1, args.length)
    }
}
function tickerExists(ticker, callback) {
    // alpha.data.intraday(ticker).then(data => {
    //     callback(true)
    // }).catch(err => {
    //     callback(false)
    // });
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
function CheckTickers() {
    var msg = MESSAGE
    msg.guild.roles.forEach(role => {
        if (msg.guild.roles.get(roleExists(msg, role.name).id).members.map(m => m.user.tag).join('') === "") {
            if (role.name.startsWith("$")) {
                deleteRole(msg, role.name)
            }
        }
    })
}
function test(t) {

}
var MESSAGE
setInterval(function () {
    if (MESSAGE) {
        console.log("Checking...")
        CheckTickers()
    } // Check for unused tickers every 5 minutes. Will change to each day
}, 300000);//
bot.on('message', msg => {
    //Ignore all messages not starting with '!'
    if (!MESSAGE) {
        MESSAGE = msg
    }
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
        // Remember to modify the aliases dictonary! The key is the case being tested
        switch (cmd) {
            case "alert":
                alert(args, msg)
                break
            case "removealert":
                removealert(args, msg)
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
                    MESSAGE = msg
                }
                break
            default:
                send(msg, "Invalid command '" + cmd + "'")
        }
    }
});
bot.login(TOKEN)