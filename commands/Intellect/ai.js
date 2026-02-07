const axios = require('axios');
module.exports = {
    name: 'ai',
    async execute(m, sock, commands, args, db, ghostContext) {
        const query = args.join(" ");
        if (!query) return m.reply("Speak, for the Nun is listening...");
        try {
            const prompt = `Your name is THE NUN. Your creator is STANYTZ. You are a mysterious guardian. Reply naturally to: ${query}`;
            const res = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
            await sock.sendMessage(m.key.remoteJid, { text: `✞  *ᴛʜᴇ ɴᴜɴ*  🕯️\n\n${res.data}\n\n_ᴅᴏᴍɪɴᴜꜱ ᴠᴏʙɪꜱᴄᴜᴍ._`, contextInfo: ghostContext }, { quoted: m });
        } catch (e) { m.reply("The spirits are silent."); }
    }
};
