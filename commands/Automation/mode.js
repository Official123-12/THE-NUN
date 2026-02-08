const { doc, setDoc } = require('firebase/firestore');

module.exports = {
    name: 'mode',
    async execute(m, sock, commands, args, db, ghostContext) {
        const ownerId = sock.user.id.split(':')[0];
        const senderId = m.key.participant || m.key.remoteJid;
        
        // SECURITY: ONLY THE PERSON WHO LINKED THE BOT CAN CHANGE MODE
        if (!senderId.startsWith(ownerId) && !m.key.fromMe) return;

        const newMode = args[0]?.toLowerCase();
        if (newMode !== 'public' && newMode !== 'private') {
            return sock.sendMessage(m.key.remoteJid, { text: "ᴜꜱᴀɢᴇ: .ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ | ᴘʀɪᴠᴀᴛᴇ" });
        }

        await setDoc(doc(db, "SETTINGS", ownerId), { mode: newMode }, { merge: true });

        let res = `╭─── • ✞ • ───╮\n  ᴠɪɢɪʟ ᴜᴘᴅᴀᴛᴇ  \n╰─── • ✞ • ───╯\n\n`;
        res += `✟  *ꜱʏꜱᴛᴇᴍ ᴍᴏᴅᴇ* : ${newMode.toUpperCase()}\n\n`;
        res += `_ᴛʜᴇ ꜱᴀɴᴄᴛᴜᴀʀʏ ʜᴀꜱ ʙᴇᴇɴ ᴀᴅᴊᴜꜱᴛᴇᴅ._`;

        await sock.sendMessage(m.key.remoteJid, { text: res, contextInfo: ghostContext });
    }
};
