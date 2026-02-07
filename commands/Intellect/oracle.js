const axios = require('axios');
module.exports = {
    name: 'oracle',
    async execute(m, sock, commands, args, db, ghostContext) {
        const text = args.join(" ");
        if (!text) return m.reply("ᴘᴀꜱᴛᴇ ᴛʜᴇ ꜱᴄʀɪᴘᴛᴜʀᴇ ᴛᴏ ꜱᴜᴍᴍᴀʀɪᴢᴇ.");
        try {
            const res = await axios.get(`https://text.pollinations.ai/Summarize this text briefly in bullet points: ${encodeURIComponent(text)}`);
            let resMsg = `╭─── • ✞ • ───╮\n  ᴏ ʀ ᴀ ᴄ ʟ ᴇ  \n╰─── • ✞ • ───╯\n\n${res.data}\n\n_ᴅᴇᴠ: ꜱᴛᴀɴʏᴛᴢ_`;
            await sock.sendMessage(m.key.remoteJid, { text: resMsg, contextInfo: ghostContext });
        } catch (e) { m.reply("ᴛʜᴇ ᴏʀᴀᴄʟᴇ ɪꜱ ꜱɪʟᴇɴᴛ."); }
    }
};
