const nedb = require('nedb');
const path = require('path');
const db = new nedb({
    filename: path.join(__dirname, 'main.db'),
    autoload: true
});

require('dotenv').config();
const ngWord = new RegExp(process.env.NGWORD, 'i');

const http = require('http');
http.createServer((req, res)=>{
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('anony-slack');
    res.end();
}).listen(process.env.PORT, '0.0.0.0', ()=>{
    console.log(`Server running at ${process.env.PORT}`);
});

const botKit = require('botkit');

const controller = botKit.slackbot({debug: false});

const BOT = controller.spawn({
    token: process.env.TOKEN
}).startRTM((err)=>{
    if(err) throw new Error(err);
});


controller.hears(/.*/, ['direct_message'], (bot, msg)=>{
    db.findOne({user: msg.user}, (err, doc)=>{
        if(doc == null){
            bot.reply(msg, process.env.POLICY);
            db.insert({user: msg.user});
            return;
        }
        if(/<@.........>/i.test(msg.text) || ngWord.test(msg.text)){
            bot.reply(msg, process.env.NGMSG);
            return;
        }
        bot.say({
            text: msg.text,
            channel: process.env.PUB
        });
        bot.say({
            text: '```' + JSON.stringify(msg) + '```' + ` <@${msg.user}>` + msg.text,
            channel: process.env.LOG
        });




    });

});

setTimeout(BOT.destroy.bind(BOT), 1800000);