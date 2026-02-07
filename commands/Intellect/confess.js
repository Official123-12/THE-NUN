const axios = require('axios');
module.exports = {
    name: 'confess',
    async execute(m, sock, commands, args, db, ghostContext) {
        const query = args.join(" ");
        if (!query) return m.reply("ᴡʜᴀᴛ ᴅᴏ ʏᴏᴜ ᴡɪꜱʜ ᴛᴏ ᴄᴏɴꜰᴇꜱꜱ?");

        try {
            const prompt = `Your name is THE NUN. Your creator is STANYTZ. You are a mysterious, ghostly guardian. Reply naturally and cooly to this: ${query}`;
            const res = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
            
            let resMsg = `✞  *ᴛ ʜ ᴇ  ɴ ᴜ ɴ*  🕯️\n\n${res.data}\n\n_ᴅᴏᴍɪɴᴜꜱ ᴠᴏʙɪꜱᴄᴜᴍ._`;
            await sock.sendMessage(m.key.remoteJid, { text: resMsg, contextInfo: ghostContext }, { quoted: m });
        } catch (e) { m.reply("ᴛʜᴇ ꜱᴘɪʀɪᴛꜱ ᴀʀᴇ ʙᴜꜱʏ."); }
    }
};
