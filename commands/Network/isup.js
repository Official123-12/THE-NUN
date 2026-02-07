
const axios = require('axios');
module.exports = {
    name: 'isup',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!args[0]) return m.reply("ᴜʀʟ?");
        const res = await axios.get(`https://api.popcat.xyz/isup?url=${args[0]}`);
        await sock.sendMessage(m.key.remoteJid, { text: `✞ *ꜱɪᴛᴇ ᴠɪɢɪʟ* : ${res.data.status} 🕯️`, contextInfo: ghostContext });
    }
};
