const axios = require('axios');
module.exports = {
    name: 'essay',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!args[0]) return m.reply("What is the topic of your scripture?");
        const res = await axios.get(`https://text.pollinations.ai/Write%20a%20detailed%20professional%20essay%20on:%20${encodeURIComponent(args.join(" "))}`);
        await sock.sendMessage(m.key.remoteJid, { text: `✞  *ꜱᴄʀɪᴘᴛᴜʀᴇ ᴀʀᴄʜɪᴛᴇᴄᴛ*  🕯️\n\n${res.data}`, contextInfo: ghostContext });
    }
};
