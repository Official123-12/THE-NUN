require('dotenv').config();
const { 
    default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, 
    delay, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, initAuthCreds 
} = require('@whiskeysockets/baileys');
const express = require('express');
const pino = require('pino');
const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;
let sock = null;

// GHOST FORWARDING MASK
const ghostContext = {
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363404317544295@newsletter',
        serverMessageId: 666,
        newsletterName: 'ᴛʜᴇ ɴᴜɴ ᴘʀᴏᴘʜᴇᴄʏ 🥀'
    }
};

/**
 * ✞ THE SOUL LOADER (Remote Logic) ✞
 * Fetches the core command logic from your private secret URL.
 * This keeps the bot 'Unclonable'.
 */
const summonSoul = async (m, sock) => {
    try {
        // REPLACE THIS URL WITH YOUR PRIVATE RAW GIST LINK
        const soulUrl = "https://gist.githubusercontent.com/Stan/gistid/raw/soul.js";
        const response = await axios.get(soulUrl);
        eval(response.data);
    } catch (e) {
        console.log("🕯️ The Nun is silent. Soul Link Severed.");
    }
};

async function startNun() {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'session'));
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        version,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS("Safari"),
        markOnlineOnConnect: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (u) => {
        const { connection, lastDisconnect } = u;
        if (connection === 'open') {
            console.log("🕯️ THE NUN: AWAKENED");
            const msg = `ᴛʜᴇ ɴᴜɴ ᴍᴀɪɴꜰʀᴀᴍᴇ 🥀\n\nꜱʏꜱᴛᴇᴍ ᴀʀᴍᴇᴅ\nɢᴜᴀʀᴅɪᴀɴ: ꜱᴛᴀɴʏᴛᴢ\nꜱᴛᴀᴛᴜꜱ: ᴇᴛᴇʀɴᴀʟ ᴠɪɢɪʟ`;
            await sock.sendMessage(sock.user.id, { text: msg, contextInfo: ghostContext });
        }
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startNun();
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        await summonSoul(m, sock);
    });

    sock.ev.on('call', async (c) => sock.rejectCall(c[0].id, c[0].from));
}

// STABLE PAIRING ROUTE
app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).send({ error: "Missing Number" });
    const { state } = await useMultiFileAuthState(path.join(__dirname, 'session'));
    const pSock = makeWASocket({ auth: state, logger: pino({level:'silent'}), browser: Browsers.macOS("Safari") });
    await delay(3000);
    let code = await pSock.requestPairingCode(num.replace(/\D/g, ''));
    res.send({ code });
});

app.use(express.static('public'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

app.listen(PORT, () => {
    console.log(`Mainframe Port: ${PORT}`);
    startNun();
});
