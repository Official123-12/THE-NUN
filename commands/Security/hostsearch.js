const axios = require('axios');
module.exports = {
    name: 'hostsearch',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!args[0]) return m.reply("ᴘʀᴏᴠɪᴅᴇ ᴀ ᴅᴏᴍᴀɪɴ.");
        const res = await axios.get(`https://api.hackertarget.com/hostsearch/?q=${args[0]}`);
        await sock.sendMessage(m.key.remoteJid, { text: `✞  *ʜᴏꜱᴛ ꜱᴇᴀʀᴄʜ*  🕯️\n\n${res.data}`, contextInfo: ghostContext });
    }
};
