module.exports = {
    name: 'dice',
    async execute(m, sock, commands, args, db, ghostContext) {
        const roll = Math.floor(Math.random() * 6) + 1;
        await sock.sendMessage(m.key.remoteJid, { text: `✞ *ᴅɪᴄᴇ ʀᴏᴛᴀᴛɪᴏɴ* : ${roll} 🕯️`, contextInfo: ghostContext });
    }
};
