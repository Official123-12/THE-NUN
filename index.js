require('dotenv').config();
const { 
    default: makeWASocket, DisconnectReason, Browsers, delay, fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, initAuthCreds, BufferJSON, getContentType 
} = require('@whiskeysockets/baileys');
const { initializeApp } = require('firebase/app');
const { getFirestore, initializeFirestore, doc, getDoc, setDoc, deleteDoc, collection, query, getDocs, where } = require('firebase/firestore');
const express = require('express');
const pino = require('pino');
const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

// 🟢 GLOBAL STABILITY SHIELD
process.on('unhandledRejection', e => console.log('🛡️ Rejection Shield:', e));
process.on('uncaughtException', e => console.log('🛡️ Exception Shield:', e));

const firebaseConfig = {
    apiKey: "AIzaSyDt3nPKKcYJEtz5LhGf31-5-jI5v31fbPc",
    authDomain: "stanybots.firebaseapp.com",
    projectId: "stanybots",
    storageBucket: "stanybots.firebasestorage.app",
    messagingSenderId: "381983533939",
    appId: "1:381983533939:web:e6cc9445137c74b99df306"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = initializeFirestore(firebaseApp, { experimentalForceLongPolling: true, useFetchStreams: false });

const app = express();
const commands = new Map();
const msgCache = new Map(); 
const activeSessions = new Map(); 

// 💎 THE NUN NEWSLETTER MASK
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
 * 🔐 EXORCISM SCANNER (Security Logic)
 */
async function armedScanner(sock, m, s, isOwner) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;
    const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "").toLowerCase();
    const type = getContentType(m.message);

    if (!from.endsWith('@g.us') || isOwner) return false;

    // Detect Scams, Porn, Links
    const scams = ["bundle", "fixed match", "earn money", "investment", "wa.me/settings"];
    const isPorn = /(porn|xxx|sex|ngono|vixen|🔞)/gi.test(body);
    
    if (body.match(/https?:\/\/[^\s]+/gi) || scams.some(w => body.includes(w)) || isPorn) {
        await sock.sendMessage(from, { delete: m.key });
        if (isPorn || scams.some(w => body.includes(w))) {
            const metadata = await sock.groupMetadata(from);
            await sock.sendMessage(from, { text: `✞ *ᴇxᴏʀᴄɪꜱᴍ ᴀᴄᴛɪᴏɴ* 🕯️\n\nᴛʜᴇ ᴅᴇᴍᴏɴ @${sender.split('@')[0]} ʜᴀꜱ ʙᴇᴇɴ ᴘᴜʀɢᴇᴅ.\nʀᴇᴀꜱᴏɴ: ᴜɴʜᴏʟʏ ᴄᴏɴᴛᴇɴᴛ.`, mentions: [sender], contextInfo: ghostContext });
            await sock.groupParticipantsUpdate(from, [sender], "remove");
        }
        return true;
    }
    return false;
}

/**
 * 🦾 USER ENGINE INITIALIZATION
 */
async function startUserBot(num) {
    if (activeSessions.has(num)) return;
    const { state, saveCreds } = await useFirebaseAuthState(num);
    
    const sockInstance = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) // 🟢 FIX: Handshake Acceleration
        },
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS("Safari"), // 🟢 USER REQUESTED
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false
    });

    activeSessions.set(num, sockInstance);
    sockInstance.ev.on('creds.update', saveCreds);

    sockInstance.ev.on('connection.update', async (u) => {
        const { connection, lastDisconnect } = u;
        if (connection === 'open') {
            await setDoc(doc(db, "NUN_ACTIVE_USERS", num), { active: true });
            console.log(`🕯️ THE NUN: AWAKENED [${num}]`);
            const msg = `ᴛʜᴇ ɴᴜɴ ᴍᴀɪɴꜰʀᴀᴍᴇ 🥀\n\nꜱʏꜱᴛᴇᴍ ᴀʀᴍᴇᴅ & ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ\nɢᴜᴀʀᴅɪᴀɴ: ꜱᴛᴀɴʏᴛᴢ\nꜱᴛᴀᴛᴜꜱ: ᴏɴʟɪɴᴇ`;
            await sockInstance.sendMessage(sockInstance.user.id, { text: msg, contextInfo: ghostContext });
        }
        if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
            activeSessions.delete(num);
            startUserBot(num);
        }
    });

    sockInstance.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        const from = m.key.remoteJid;
        const sender = m.key.participant || from;
        const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "").trim();
        const type = getContentType(m.message);

        msgCache.set(m.key.id, m);
        const isOwner = sender.startsWith(num) || m.key.fromMe;

        // Auto Presence
        await sockInstance.sendPresenceUpdate('composing', from);

        // Security Scanner
        if (await armedScanner(sockInstance, m, isOwner)) return;

        // Anti-Delete & ViewOnce (Auto-Forward to DM)
        if (m.message?.protocolMessage?.type === 0 && !m.key.fromMe) {
            const cached = msgCache.get(m.message.protocolMessage.key.id);
            if (cached) {
                await sockInstance.sendMessage(sockInstance.user.id, { text: `✞ *ᴘʜᴀɴᴛᴏᴍ ʀᴇᴄᴏᴠᴇʀʏ* ✞\nCaptured trace from @${sender.split('@')[0]}`, mentions: [sender] });
                await sockInstance.copyNForward(sockInstance.user.id, cached, false, { contextInfo: ghostContext });
            }
        }
        if (type === 'viewOnceMessage' || type === 'viewOnceMessageV2') {
            await sockInstance.copyNForward(sockInstance.user.id, m, false, { contextInfo: ghostContext });
        }

        // Universal AI Chat (Natural Ghost Persona)
        const isCmd = body.startsWith('.');
        if (!isCmd && !m.key.fromMe && body.length > 2 && !from.endsWith('@g.us')) {
            try {
                const aiPrompt = `Your name is THE NUN. Developer: STANYTZ. Respond naturally and briefly in the user's language: ${body}`;
                const aiRes = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(aiPrompt)}`);
                await sockInstance.sendMessage(from, { text: `ᴛʜᴇ ɴᴜɴ 🥀\n\n${aiRes.data}\n\n_ɪɴ ꜱʜᴀᴅᴏᴡꜱ ᴡᴇ ᴛʀᴜꜱᴛ._`, contextInfo: ghostContext }, { quoted: m });
            } catch (e) {}
        }

        // Command Handler
        if (isCmd) {
            const args = body.slice(1).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            const cmd = commands.get(cmdName);
            if (cmd) await cmd.execute(m, sockInstance, Array.from(commands.values()), args, db, ghostContext);
        }
    });
}

/**
 * 📦 FIREBASE AUTH WRAPPER
 */
async function useFirebaseAuthState(num) {
    const fixId = (id) => `nun_${num}_${id.replace(/\//g, '__').replace(/\@/g, 'at')}`;
    const writeData = async (data, id) => setDoc(doc(db, "NUN_SESSIONS", fixId(id)), JSON.parse(JSON.stringify(data, BufferJSON.replacer)));
    const readData = async (id) => {
        const snapshot = await getDoc(doc(db, "NUN_SESSIONS", fixId(id)));
        return snapshot.exists() ? JSON.parse(JSON.stringify(snapshot.data()), BufferJSON.reviver) : null;
    };
    let creds = await readData('creds') || initAuthCreds();
    return { 
        state: { creds, keys: {
            get: async (type, ids) => {
                const data = {};
                await Promise.all(ids.map(async id => {
                    let value = await readData(`${type}-${id}`);
                    if (type === 'app-state-sync-key' && value) value = require('@whiskeysockets/baileys').proto.Message.AppStateSyncKeyData.fromObject(value);
                    data[id] = value;
                }));
                return data;
            },
            set: async (data) => {
                for (const type in data) {
                    for (const id in data[type]) {
                        const value = data[type][id];
                        if (value) await writeData(value, `${type}-${id}`);
                        else await deleteDoc(doc(db, "NUN_SESSIONS", fixId(`${type}-${id}`)));
                    }
                }
            }
        }},
        saveCreds: () => writeData(creds, 'creds'),
        wipeSession: async () => {
            const q = query(collection(db, "NUN_SESSIONS"), where("__name__", ">=", `nun_${num}`), where("__name__", "<=", `nun_${num}\uf8ff`));
            const snap = await getDocs(q);
            snap.forEach(async d => await deleteDoc(d.ref));
        }
    };
}

// 🟢 PAIRING ROUTE (ZERO ERRORS)
app.get('/code', async (req, res) => {
    let num = req.query.number.replace(/\D/g, '');
    try {
        const { state, saveCreds, wipeSession } = await useFirebaseAuthState(num);
        await wipeSession();
        const pSock = makeWASocket({
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
            logger: pino({ level: 'silent' }),
            browser: Browsers.macOS("Safari")
        });
        pSock.ev.on('creds.update', saveCreds);
        await delay(5000);
        let code = await pSock.requestPairingCode(num);
        res.send({ code });
        pSock.ev.on('connection.update', (u) => { if (u.connection === 'open') startUserBot(num); });
    } catch (e) { res.status(500).send({ error: "System Busy" }); }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    // Command Loader Initialization
    const cmdPath = path.resolve(__dirname, 'commands');
    if (fs.existsSync(cmdPath)) {
        fs.readdirSync(cmdPath).forEach(folder => {
            const folderPath = path.join(cmdPath, folder);
            if (fs.lstatSync(folderPath).isDirectory()) {
                fs.readdirSync(folderPath).filter(f => f.endsWith('.js')).forEach(file => {
                    const cmd = require(path.join(folderPath, file));
                    if (cmd && cmd.name) { cmd.category = folder; commands.set(cmd.name.toLowerCase(), cmd); }
                });
            }
        });
    }
    console.log(`The Nun Vigil: ${PORT}`);
    // 🟢 AUTO-RESTORE
    getDocs(collection(db, "NUN_ACTIVE_USERS")).then(snap => snap.forEach(d => d.data().active && startUserBot(d.id)));
});

// Always Online
setInterval(async () => {
    for (let s of activeSessions.values()) {
        if (s.user) {
            const up = Math.floor(process.uptime() / 3600);
            await s.updateProfileStatus(`THE NUN 🥀 | VIGIL | ${up}h Active`).catch(() => {});
            await s.sendPresenceUpdate('available');
        }
    }
}, 30000);
