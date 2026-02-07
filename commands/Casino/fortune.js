module.exports = {
    name: 'fortune',
    async execute(m, sock, commands, args, db, ghostContext) {
        const res = ["Great light is coming.", "Shadows will follow you.", "A sacrifice is needed.", "Blessings are near.", "The Nun sees a win.", "Silence is your best friend."];
        const pick = res[Math.floor(Math.random() * res.length)];
        await sock.sendMessage(m.key.remoteJid, { text: `✞  *ꜰ ᴏ ʀ ᴛ ᴜ ɴ ᴇ*  🕯️\n\n"${pick}"\n\n_ᴅᴇᴠ: ꜱᴛᴀɴʏᴛᴢ_`, contextInfo: ghostContext });
    }
};
