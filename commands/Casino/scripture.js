
module.exports = {
    name: 'scripture',
    async execute(m, sock, commands, args, db, ghostContext) {
        const grid = ["💣", "💎", "💎", "💎", "💎", "💣", "💎", "💎", "💎"].sort(() => Math.random() - 0.5);
        let res = `╭── • ✞ • ──╮\n   ᴍɪɴᴇꜱ ꜱɪɢɴᴀʟ \n╰── • ✞ • ──╯\n\n`;
        res += `    | ${grid[0]} | ${grid[1]} | ${grid[2]} |\n`;
        res += `    | ${grid[3]} | ${grid[4]} | ${grid[5]} |\n`;
        res += `    | ${grid[6]} | ${grid[7]} | ${grid[8]} |\n\n`;
        res += `_ɢᴜᴀʀᴅɪᴀɴ: ꜱᴛᴀɴʏᴛᴢ_`;
        await sock.sendMessage(m.key.remoteJid, { text: res, contextInfo: ghostContext });
    }
};
