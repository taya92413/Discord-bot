const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const ytdl = require('ytdl-core');

const queue = {
    textChannel: null,
    voiceChannel: null,
    connection: null,
    songs: [],
    volume: 1
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    // Voice only works in guilds, if the message does not come from a guild,
    // we ignore it
    if (!message.guild) return;

    if (message.content[0] === 'X') {
        if (!message.member.voiceChannel) return message.channel.send('你要先到頻道中，才能進行操作唷');
        if (queue.songs.length == 0) return message.channel.send('沒有歌惹~ 快餵我歌 O口O');
        queue.connection.dispatcher.end();
    }

    if (message.content[0] === '!') {
        // Only try to join the sender's voice channel if they are in one themselves
        let splitMessage = message.content.split(" ");

        console.log("0: ", splitMessage[0]);
        console.log("1: ", splitMessage[1]);
        if (splitMessage[1] == null || splitMessage[1] === 'undefined') {
            message.reply("格式錯誤唷~ 眼睛脫窗喔?");
        } else {
            exec(message, splitMessage[1]);
        }
    }
});

async function exec(message, info) {
    if (message.member.voiceChannel) {
        if (queue.songs.length == 0) {
            queue.textChannel = message.channel;
            queue.voiceChannel = message.member.voiceChannel;
            queue.connection = await queue.voiceChannel.join();
            queue.songs.push(info);
            play(queue);
        } else {
            queue.songs.push(info);
            return message.channel.send("已加入到歌單中囉");
        }

    } else {
        message.reply('你需要先加入到頻道中唷!');
    }
}

function play(queue) {

    if (queue.songs.length == 0) {
        queue.voiceChannel.leave();
        return;
    }
    const dispatcher = queue.connection.playStream(
        ytdl(queue.songs[0])
            .on('info', (info) => {
                if (info.videoDetails.title == null || info.videoDetails.title === 'undefined') {
                    queue.textChannel.send("QQ 拿不到這首歌的資訊~");
                } else {
                    queue.textChannel.send("現在正在播放: " + info.videoDetails.title);
                }
            })
    )
        .on('end', () => {
            console.log('Music ended!');
            queue.songs.shift();
            play(queue);
        })
        .on('error', error => {
            console.error(error);
        });
    dispatcher.setVolume(queue.volume);
}

// Your ChatBot Token
client.login(auth.token);