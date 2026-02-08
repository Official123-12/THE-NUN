require('dotenv').config();
const { 
    default: makeWASocket, DisconnectReason, Browsers, delay, fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, initAuthCreds, BufferJSON, getContentType 
} = require('@whiskeysockets/baileys');

// 🟢 FIXED FIREBASE COMMONJS IMPORTS
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, query, getDocs } = require('firebase/firestore');

const express = require('express');
const pino = require('pino');
const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

// 🛡️ GLOBAL STABILITY
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
const db = getFirestore(firebaseApp);

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
 * 🔐 EXORCISM SCANNER (Anti-Link, Porn, Scam)
 */
async function exorcismScanner(sock, m, isOwner) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;
    const body = (m.message.conversation || m.message.extendedTextMessage?.text || "").toLowerCase();
    const type = getContentType(m.message);

    if (!from.endsWith('@g.us') || isOwner) return false;

    const demonFound = /(http|porn|xxx|sex|ngono|bundle|fixed match|earn money)/gi.test(body);
    if (demonFound) {
        await sock.sendMessage(from, { delete: m.key });
        await sock.sendMessage(from, { text: `✞ *ᴇxᴏʀᴄɪꜱᴍ ᴀᴄᴛɪᴏɴ* 🕯️\n\nᴛʜᴇ ᴅᴇᴍᴏɴ @${sender.split('@')[0]} ʜᴀꜱ ʙᴇᴇɴ ᴘᴜʀɢᴇᴅ.\nʀᴇᴀꜱᴏɴ: ᴜɴʜᴏʟʏ ᴄᴏɴᴛᴇɴᴛ.`, mentions: [sender], contextInfo: ghostContext });
        await sock.groupParticipantsUpdate(from, [sender], "remove");
        return true;
    }
    return false;
}

/**
 * 🦾 PHANTOM ENGINE LOGIC
 */
async function handlePhantomLogic(sock, m, num) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;
    const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "").trim();
    const type = getContentType(m.message);

    msgCache.set(m.key.id, m);
    const ownerId = sock.user.id.split(':')[0];
    const isOwner = sender.startsWith(num) || m.key.fromMe;

    const setSnap = await getDoc(doc(db, "SETTINGS", ownerId));
    const s = setSnap.exists() ? setSnap.data() : { mode: "public" };
    if (s.mode === "private" && !isOwner) return;

    // 1. AUTO PRESENCE
    await sock.sendPresenceUpdate('composing', from);

    // 2. 📸 STATUS ENGINE (VIEW + LIKE + AI MOOD REPLY)
    if (from === 'status@broadcast') {
        await sock.readMessages([m.key]);
        await sock.sendMessage(from, { react: { text: '🥀', key: m.key } }, { statusJidList: [sender] });
        try {
            const aiMood = await axios.get(`https://text.pollinations.ai/You are a mysterious guardian friend. React briefly and naturally in English to this status: "${body}". No quotes.`);
            await sock.sendMessage(from, { text: aiMood.data, contextInfo: ghostContext }, { quoted: m });
        } catch (e) {}
        return;
    }

    // 3. SECURITY SCANNER
    if (await exorcismScanner(sock, m, isOwner)) return;

    // 4. ANTI-DELETE & VIEWONCE
    if (m.message?.protocolMessage?.type === 0 && !m.key.fromMe) {
        const cached = msgCache.get(m.message.protocolMessage.key.id);
        if (cached) {
            await sock.sendMessage(sock.user.id, { text: `✞ *ᴘʜᴀɴᴛᴏᴍ ʀᴇᴄᴏᴠᴇʀʏ* ✞\nCaptured trace from @${sender.split('@')[0]}`, mentions: [sender] });
            await sock.copyNForward(sock.user.id, cached, false, { contextInfo: ghostContext });
        }
    }
    if (type === 'viewOnceMessage' || type === 'viewOnceMessageV2') {
        await sock.copyNForward(sock.user.id, m, false, { contextInfo: ghostContext });
    }

    // 5. GHOSTLY AUTO-AI CHAT
    const isCmd = body.startsWith('.');
    if (!isCmd && !m.key.fromMe && body.length > 2 && !from.endsWith('@g.us')) {
        try {
            const aiPrompt = `Your name is THE NUN. Developer: STANYTZ. Respond naturally and very briefly in the user's language: ${body}`;
            const aiRes = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(aiPrompt)}`);
            await sock.sendMessage(from, { text: `ᴛʜᴇ ɴᴜɴ 🥀\n\n${aiRes.data}\n\n_ɪɴ ꜱʜᴀᴅᴏᴡꜱ ᴡᴇ ᴛʀᴜꜱᴛ._`, contextInfo: ghostContext }, { quoted: m });
        } catch (e) {}
    }

    // 6. COMMAND EXECUTION
    if (isCmd) {
        const args = body.slice(1).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();
        const cmd = commands.get(cmdName);
        if (cmd) await cmd.execute(m, sock, Array.from(commands.values()), args, db, ghostContext);
    }
}

// 🟢 FIXED FIREBASE AUTH STATE
async function useFirebaseAuthState(db, collectionName, userId) {
    const authDoc = doc(db, collectionName, userId);
    
    const state = {
        creds: initAuthCreds(),
        keys: {}
    };

    // Load from Firebase
    const snap = await getDoc(authDoc);
    if (snap.exists()) {
        const data = snap.data();
        if (data.creds) state.creds = JSON.parse(data.creds, BufferJSON.reviver);
        if (data.keys) state.keys = JSON.parse(data.keys, BufferJSON.reviver);
    }

    const saveCreds = async () => {
        try {
            await setDoc(authDoc, {
                creds: JSON.stringify(state.creds, BufferJSON.replacer),
                keys: JSON.stringify(state.keys, BufferJSON.replacer),
                updatedAt: new Date().toISOString()
            });
        } catch (e) {}
    };

    const wipeSession = async () => {
        try {
            await deleteDoc(authDoc);
            state.creds = initAuthCreds();
            state.keys = {};
        } catch (e) {}
    };

    return { state, saveCreds, wipeSession };
}

/**
 * 🦾 ENGINE BOOTSTRAP
 */
async function startUserBot(num) {
    if (activeSessions.has(num)) return;
    
    const { state, saveCreds } = await useFirebaseAuthState(db, "NUN_SESSIONS", num);
    
    const sockInstance = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS("Safari"),
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true
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
        await handlePhantomLogic(sockInstance, m, num);
    });
}

/**
 * 🟢 ROUTES (HEALTH & PAIRING)
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).send(`<body style="background:#000;color:#ff0000;text-align:center;padding-top:100px;font-family:serif;"><h1>T H E  N U N</h1><p>VIGIL: <span style="color:#00ff00">ACTIVE</span></p></body>`);
});

app.use(express.static('public'));
app.get('/link', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

app.get('/code', async (req, res) => {
    try {
        let num = req.query.number.replace(/\D/g, '');
        if (!num) return res.status(400).send({ error: "Number required" });
        
        const { state, saveCreds, wipeSession } = await useFirebaseAuthState(db, "NUN_SESSIONS", num);
        await wipeSession();
        
        const pSock = makeWASocket({
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
            logger: pino({ level: 'silent' }),
            browser: Browsers.macOS("Safari"),
            markOnlineOnConnect: false
        });
        
        pSock.ev.on('creds.update', saveCreds);
        
        // Wait for socket to initialize
        await delay(2000);
        
        let code = "";
        try {
            code = await pSock.requestPairingCode(num.replace('+', ''));
        } catch (pairError) {
            console.error("Pairing error:", pairError);
            return res.status(500).send({ error: "Failed to generate pairing code" });
        }
        
        res.send({ code });
        
        pSock.ev.on('connection.update', async (u) => {
            const { connection, lastDisconnect } = u;
            if (connection === 'open') {
                console.log(`✅ Paired successfully: ${num}`);
                pSock.ws?.close();
                await delay(1000);
                startUserBot(num);
            }
            if (connection === 'close') {
                console.log(`❌ Pairing closed for: ${num}`);
            }
        });
        
    } catch (e) {
        console.error("Code endpoint error:", e);
        res.status(500).send({ error: "System Busy" });
    }
});

// 🟢 ADD PING ENDPOINT FOR RENDER
app.get('/ping', (req, res) => {
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    const cmdPath = path.resolve(__dirname, 'commands');
    if (fs.existsSync(cmdPath)) {
        fs.readdirSync(cmdPath).forEach(folder => {
            const folderPath = path.join(cmdPath, folder);
            if (fs.lstatSync(folderPath).isDirectory()) {
                fs.readdirSync(folderPath).filter(f => f.endsWith('.js')).forEach(file => {
                    const cmd = require(path.join(folderPath, file));
                    if (cmd && cmd.name) { 
                        cmd.category = folder; 
                        commands.set(cmd.name.toLowerCase(), cmd); 
                    }
                });
            }
        });
    }
    console.log(`The Nun Vigil: ${PORT}`);
    
    // 🟢 AUTO-RESTORE with error handling
    getDocs(collection(db, "NUN_ACTIVE_USERS")).then(snap => {
        snap.forEach(doc => {
            if (doc.data().active) {
                setTimeout(() => {
                    startUserBot(doc.id).catch(e => console.error(`Failed to start ${doc.id}:`, e));
                }, 2000);
            }
        });
    }).catch(e => console.error("Firestore restore error:", e));
});

// Always Online
setInterval(async () => {
    for (let s of activeSessions.values()) {
        if (s.user) {
            try {
                const up = Math.floor(process.uptime() / 3600);
                await s.updateProfileStatus(`THE NUN 🥀 | VIGIL | ${up}h Active`).catch(() => {});
                await s.sendPresenceUpdate('available');
            } catch (e) {}
        }
    }
}, 30000);

// 🟢 ADDITIONAL: Keep Render alive
setInterval(() => {
    axios.get(`http://localhost:${PORT}/ping`).catch(() => {});
}, 60000);
