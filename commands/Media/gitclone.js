module.exports = {
    name: 'gitclone',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!args[0]) return m.reply("ɢɪᴛʜᴜʙ ʟɪɴᴋ?");
        const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
        let [_, user, repo] = args[0].match(regex);
        repo = repo.replace(/.git$/, '');
        const url = `https://api.github.com/repos/${user}/${repo}/zipball`;
        await sock.sendMessage(m.key.remoteJid, { document: { url }, fileName: `${repo}.zip`, mimetype: 'application/zip', contextInfo: ghostContext });
    }
};
