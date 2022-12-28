const { Client } = require('discord.js-selfbot-v13');
const { self, bot_owners, mudae } = require('./config.json');
const keep_alive = require('./keep_alive.js');
const prefix = self.prefix[self.user];
const client = new Client({ checkUpdate: false });
const redo = ['A kakera command is', 'the roulette is limited to'];
const stop = ['You need to buy', 'You need an additional', 'Command DISABLED', `${prefix}stop`];
const winston = require("winston");
const logger = winston.createLogger({
    transports: [new winston.transports.Console(), new winston.transports.File({
        filename: 'log'
    }), ],
    format: winston.format.printf(log =>`[${log.level.toUpperCase()}] - ${log.message}`)
});

let stopped = false;
let rolls_left = 3;
let counter = 0;
let setinterval = mudae.setinterval;
let running = false;

client.on('debug', m => logger.log('debug', m));
client.on('warn', m => logger.log('warn', m));
client.on('error', m => logger.log('error', m));

function generateRandomInt(min, max) {
    return Math.floor((Math.random() * (max - min)) + min);
}

function sleep(ms) {
    return new Promise(resolve =>setTimeout(resolve, ms));
}

client.on(`messageCreate`, async msg => {
    try {
        if (msg.content == undefined) return;
        if (running && msg.embeds[0] && self.channel_id === msg.channel.id.toString()) {
            let desc = msg.embeds[0].description;
            if (msg.embeds[0].footer && msg.embeds[0].footer.text.includes('⚠️ 2 ROLLS LEFT ⚠️')) {
                rolls_left = 2;
            }
    
        } else if (running && msg.content.includes("the roulette is limited to") && self.channel_id === msg.channel.id.toString()) {
            await sleep(600);
            await msg.channel.send('$us 20');
            await sleep(1200);
            rolls_left = 3;
        }
        
        if (!msg.content.startsWith(prefix)) return;
        const args = msg.content.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();
    
        if (cmd === "run" && msg.author.id.toString() === self.bot_master) {
            running = true;
            await msg.delete();
            while (!stopped) {
                // fastest wa wa / wa wa /....
                let ms = 0;
                if (mudae.mode == 0) {
                    if (counter > 0) {
                        await msg.channel.send(`$${mudae.roll_type}`);
                        counter -= 0.5;
                    
                    } else {
                        await msg.channel.sendSlash('432610292342587392', mudae.roll_type).catch(() =>{});
                        counter += 1;
                    }
                    ms = generateRandomInt(2000, 2500);
                } else {
                    // wa / wa /....
                    if (counter === 0) {
                        await msg.channel.send(`$${mudae.roll_type}`);
                        counter += 1;
                    } else {
                        await msg.channel.sendSlash('432610292342587392', mudae.roll_type).catch(() => {});
                        counter -= 1;
                    }
                    ms = generateRandomInt(2000, 2500);
                }
                await sleep(ms);
                
                if (rolls_left <= 2) {
                    rolls_left -= 1;
                }
                
                if (rolls_left < 0) {
                    const d = new Date();
                    if (setinterval - 1 == d.getMinutes()) {
                        running = false;
                        await sleep((60-d.getSeconds())*1000);
                        running = true;
                    } else {
                        await msg.channel.send('$us 20');
                        await sleep(ms);
                    }
                    rolls_left = 3;
                }
    
            }
            stopped = false;
            running = false;
    
        } else if (cmd === "stop") {
            await msg.delete();
            stopped = true;
            running = false;
        }
    } catch(e) {
        logger.log('error', `${e}`);
    }
});

client.on('ready', async () =>{
    logger.log('info', 'The bot is online!')
    client.user.setPresence({
        status: 'invisible'
    });
    console.log(`[USER]: ${client.user.tag}\n[PREFIX]: ${prefix}\n`);
    let guild = client.guilds.cache.get(self.guild_id);
    let channel = guild.channels.cache.find(channel => channel.id === self.channel_id);
    await sleep(2200);
    channel.send(">=run");
});

if (self.user === 0) {
    client.login(process.env.B123_BOT_TOKEN);
} else if (self.user === 1) {
    client.login(process.env.SUKI_BOT_TOKEN);
} else {
    client.login(process.env.NIG);
};
