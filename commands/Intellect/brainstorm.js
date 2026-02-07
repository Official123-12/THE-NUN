const axios = require('axios');
module.exports = {
    name: 'brainstorm',
    async execute(m, sock, commands, args, db, ghostContext) {
        const query = args.join(" ");
        if (!query) return m.reply("ᴡʜᴀᴛ ꜱʜᴀʟʟ ᴡᴇ ᴄʀᴇᴀᴛᴇ?");
        const res = await axios.get(`https://text.pollinations.ai/Give 5 creative ideas for: ${encodeURIComponent(query)}`);
        let resMsg = `╭─── • ✞ • ───╮\n  ʙ ʀ ᴀ ɪ ɴ ꜱ ᴛ ᴏ ʀ ᴍ \n╰─── • ✞ • ───╯\n\n${res.data}\n\n_ᴅᴇᴠ: ꜱᴛᴀɴʏᴛᴢ_`;
        await sock.sendMessage(m.key.remoteJid, { text: resMsg, contextInfo: ghostContext });
    }
};
