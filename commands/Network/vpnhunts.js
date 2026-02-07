module.exports = {
    name: 'vpnhunt',
    async execute(m, sock, commands, args, db, ghostContext) {
        let res = `╭─── • ✞ • ───╮\n  ᴠ ᴘ ɴ  ʜ ᴜ ɴ ᴛ ꜱ  \n╰─── • ✞ • ───╯\n\n✟ ᴄʟᴏᴜᴅꜰʟᴀʀᴇ 𝟷.𝟷.𝟷.𝟷\n✟ ʜᴀ ᴛᴜɴɴᴇʟ ᴘʟᴜꜱ\n✟ ᴠ𝟸ʀᴀʏ ɴᴏᴅᴇꜱ\n✟ ᴘꜱɪᴘʜᴏɴ ᴘʀᴏ\n\n_ᴅᴇᴠ: ꜱᴛᴀɴʏᴛᴢ_`;
        await sock.sendMessage(m.key.remoteJid, { text: res, contextInfo: ghostContext });
    }
};
