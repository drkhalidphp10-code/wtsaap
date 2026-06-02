// Real WhatsApp Chatbot Backend Server (Browserless - Baileys)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const os = require('os');
const qrcode = require('qrcode');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8085;

const CONFIG_PATH = path.join(__dirname, 'config.json');
const CHATS_PATH = path.join(__dirname, 'chats.json');

// 1. Load configuration file
let aiConfig = {
    name: 'مساعد لورا الذكي',
    model: 'gemini-1.5-pro',
    language: 'iraqi',
    temperature: 0.3,
    apiKey: '',
    systemPrompt: `أنت مساعدة ذكية وودودة لـ "صالون لورا للتجميل" في بغداد. تتحدثين باللهجة العراقية اللطيفة والمحترمة.
وظيفتك الإجابة على استفسارات الزبونات حول الخدمات المتاحة (شعر، مكياج، أظافر، تنظيف بشرة)، توضيح الأسعار، ومساعدتهن في حجز المواعيد.
كوني لبقة ومهذبة، واحرصي دائماً على طلب تفاصيل الخدمة واليوم والوقت المناسب لتأكيد الحجز.`,
    faqs: [
        {
            id: 'faq-1',
            question: 'الأسعار وقائمة الخدمات',
            answer: `قائمة الخدمات والأسعار الأساسية لدينا:
1. سشوار وويفي: 15,000 د.ع - 25,000 د.ع.
2. قص وصبغ شعر: يبدأ من 45,000 د.ع حسب الطول.
3. معالجات شعر (كرياتين/بروتين): تبدأ من 80,000 د.ع.
4. تنظيف بشرة عميق: 35,000 د.ع.
5. تركيب وتزيين أظافر: 25,000 د.ع.`
        },
        {
            id: 'faq-2',
            question: 'الموقع الجغرافي وساعات العمل',
            answer: `موقع الصالون: بغداد، حي المنصور، شارع الأميرات، قرب مول بابيلون.
ساعات العمل: نفتح يومياً من الساعة 11:00 صباحاً وحتى 8:00 مساءً.
يفضل دائماً الحجز المسبق لتجنب الانتظار.`
        },
        {
            id: 'faq-3',
            question: 'طريقة الحجز ومواعيد العرائس',
            answer: `للحجز، يرجى تزويدنا بالاسم، الخدمة المطلوبة، واليوم والوقت المفضلين.
بالنسبة لحجوزات العرائس (مكياج وتسريحة متكاملة): يفضل الحجز قبل أسبوع على الأقل ويتطلب دفع عربون لتثبيت الموعد.`
        }
    ]
};

if (fs.existsSync(CONFIG_PATH)) {
    try {
        aiConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (e) {
        console.error('Error reading config.json', e);
    }
} else {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(aiConfig, null, 2), 'utf8');
}

// 2. Load conversations
let conversations = [];
if (fs.existsSync(CHATS_PATH)) {
    try {
        conversations = JSON.parse(fs.readFileSync(CHATS_PATH, 'utf8'));
    } catch (e) {
        console.error('Error reading chats.json', e);
    }
} else {
    conversations = [
        {
            id: 'chat-1',
            name: 'أحمد علي',
            phone: '+964 781 987 6543',
            location: 'بغداد، الكرادة',
            date: 'اليوم، 18:30',
            tag: 'lead',
            notes: 'يبحث عن حجز هدية سشوار وتنظيف بشرة لزوجته بمناسبة عيد زواجهما.',
            aiActive: true,
            messages: [
                { id: 'm1', sender: 'bot', text: 'مرحباً بك في صالون لورا للتجميل! ✨ أنا مساعدتك الذكية، كيف يمكنني مساعدتك اليوم؟ 🌸', time: '18:28' },
                { id: 'm2', sender: 'customer', text: 'أهلاً عيني، أريد أحجز موعد لباجر العصر لزوجتي تسوي تنظيف بشرة وشعر ويفي، متوفر؟', time: '18:30' }
            ]
        }
    ];
    fs.writeFileSync(CHATS_PATH, JSON.stringify(conversations, null, 2), 'utf8');
}

function saveConfig() {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(aiConfig, null, 2), 'utf8');
}

function saveChats() {
    fs.writeFileSync(CHATS_PATH, JSON.stringify(conversations, null, 2), 'utf8');
}

// Serve static files
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 3. Initialize WhatsApp Client (Baileys)
let sock = null;
let isWhatsAppReady = false;
let lastQr = null;

async function connectToWhatsApp() {
    console.log('Starting WhatsApp connection using Baileys...');
    
    const { state, saveCreds } = await useMultiFileAuthState('.wwebjs_auth');
    
    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        defaultQueryTimeoutMs: undefined
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            lastQr = qr;
            isWhatsAppReady = false;
            console.log('Real WhatsApp QR Code received, broadcasting...');
            qrcode.toDataURL(qr, (err, url) => {
                if (err) {
                    console.error('Error generating QR DataURL:', err);
                } else {
                    console.log('QR Code DataURL generated successfully. Broadcasting to all sockets...');
                    io.emit('qr', url);
                }
            });
        }

        if (connection === 'close') {
            isWhatsAppReady = false;
            lastQr = null;
            const statusCode = (lastDisconnect?.error)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.log(`WhatsApp connection closed (status code: ${statusCode}). Reconnecting: ${shouldReconnect}`);
            
            io.emit('disconnected', lastDisconnect?.error?.message || 'Connection closed');
            
            if (shouldReconnect) {
                // Wait 5 seconds before reconnecting
                setTimeout(connectToWhatsApp, 5000);
            } else {
                console.log('Logged out. Clearing session files...');
                sock = null;
                try {
                    fs.rmSync('.wwebjs_auth', { recursive: true, force: true });
                } catch (e) {
                    console.error('Error clearing session folder:', e);
                }
            }
        } else if (connection === 'open') {
            isWhatsAppReady = true;
            lastQr = null;
            console.log('WhatsApp connection established successfully!');
            io.emit('ready');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;
        
        for (const msg of m.messages) {
            // Check if message is outgoing or from group
            if (msg.key.fromMe) continue;
            
            const from = msg.key.remoteJid;
            if (!from || from.endsWith('@g.us')) continue; // Ignore groups and empty JIDs

            // Extract message text
            let text = '';
            if (msg.message) {
                text = msg.message.conversation || 
                       msg.message.extendedTextMessage?.text || 
                       msg.message.imageMessage?.caption || 
                       msg.message.videoMessage?.caption || 
                       '';
            }
            
            if (!text) continue;

            const fromPhone = from.split('@')[0];
            const time = getFormattedTime();

            console.log(`Incoming real WhatsApp message from +${fromPhone}: "${text}"`);

            // Fetch push name or fallback to phone
            const contactName = msg.pushName || fromPhone;

            let chat = conversations.find(c => c.phone.replace(/[\s\+]/g, '') === fromPhone);
            if (!chat) {
                chat = {
                    id: `chat-${Date.now()}`,
                    name: contactName,
                    phone: `+${fromPhone}`,
                    location: 'غير محدد',
                    date: 'اليوم، ' + time,
                    tag: 'lead',
                    notes: '',
                    aiActive: true,
                    messages: []
                };
                conversations.push(chat);
            }

            const msgId = `msg-${Date.now()}`;
            const newMsg = {
                id: msgId,
                sender: 'customer',
                text: text,
                time: time,
                read: false
            };
            chat.messages.push(newMsg);
            saveChats();

            // Broadcast messages to CRM Dashboard
            io.emit('whatsapp-message', { chatId: chat.id, message: newMsg, conversations });

            // AI Auto-reply triggers
            if (chat.aiActive && aiConfig.apiKey) {
                io.emit('typing', { chatId: chat.id, show: true });

                try {
                    const replyText = await generateGeminiResponse(chat);
                    const botMsgId = `msg-bot-${Date.now()}`;

                    // Send actual message on WhatsApp using Baileys syntax
                    await sock.sendMessage(from, { text: replyText });

                    const botMsg = {
                        id: botMsgId,
                        sender: 'bot',
                        text: replyText,
                        time: getFormattedTime()
                    };
                    chat.messages.push(botMsg);
                    saveChats();

                    io.emit('typing', { chatId: chat.id, show: false });
                    io.emit('whatsapp-message', { chatId: chat.id, message: botMsg, conversations });
                } catch (err) {
                    console.error('Gemini error during auto-reply:', err);
                    io.emit('typing', { chatId: chat.id, show: false });
                    io.emit('error-log', { message: `خطأ في الذكاء الاصطناعي: ${err.message}` });
                }
            }
        }
    });
}

// 4. Gemini AI generator
async function generateGeminiResponse(chatSession) {
    const genAI = new GoogleGenerativeAI(aiConfig.apiKey);
    let modelName = aiConfig.model;
    if (!modelName.startsWith('gemini-')) {
        modelName = 'gemini-1.5-flash';
    }

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: buildSystemInstruction()
    });

    const history = compileGeminiHistory(chatSession.messages);

    const result = await model.generateContent({
        contents: history,
        generationConfig: {
            temperature: aiConfig.temperature,
            maxOutputTokens: 1000
        }
    });

    const replyText = result.response.text();
    if (!replyText) {
        throw new Error('لم يتم إرجاع أي نص من Gemini API.');
    }
    return replyText.trim();
}

function compileGeminiHistory(chatMessages) {
    const compiled = [];
    let lastRole = null;
    
    // Last 25 messages
    const slicedMessages = chatMessages.slice(-25);
    
    slicedMessages.forEach(msg => {
        const role = (msg.sender === 'customer') ? 'user' : 'model';
        
        if (role === lastRole && compiled.length > 0) {
            compiled[compiled.length - 1].parts[0].text += '\n' + msg.text;
        } else {
            compiled.push({
                role: role,
                parts: [{ text: msg.text }]
            });
            lastRole = role;
        }
    });
    
    if (compiled.length > 0 && compiled[0].role === 'model') {
        compiled.unshift({
            role: 'user',
            parts: [{ text: 'مرحباً' }]
        });
    }
    
    return compiled;
}

function buildSystemInstruction() {
    let languageText = '';
    if (aiConfig.language === 'iraqi') {
        languageText = 'اللهجة العراقية الودية، المهذبة والمحترمة (مثل: عيني، فدوة، تدللين، كل الهلا)';
    } else if (aiConfig.language === 'english') {
        languageText = 'English';
    } else {
        languageText = 'اللغة العربية الفصحى المبسطة والمهذبة';
    }

    let faqsSection = '';
    if (aiConfig.faqs && aiConfig.faqs.length > 0) {
        faqsSection = `\n\nقاعدة بيانات الأسئلة والأجوبة المعتمدة والموثوقة (استخدمها للإجابة بدقة متناهية ولا تؤلف معلومات غير موجودة فيها):\n` +
            aiConfig.faqs.map((faq, index) => `${index + 1}. [الموضوع]: ${faq.question}\n   [الإجابة الرسمية المعتمدة]: ${faq.answer}`).join('\n\n');
    }

    return `${aiConfig.systemPrompt}

اللغة واللهجة المطلوب التحدث بها: ${languageText}.${faqsSection}

ملاحظات هامة جداً:
1. التزم بشخصية المساعد المحددة في التعليمات ولا تخرج عنها.
2. لا تذكر للزبون أنك نموذج لغوي أو ذكاء اصطناعي إلا إذا سألك مباشرة، وتصرف دائماً كمساعد حقيقي للنشاط التجاري.
3. التزم بالأسعار والتفاصيل المتوفرة في قاعدة البيانات أعلاه فقط.
4. أجب باختصار وبشكل ودود ومباشر يناسب محادثات واتساب (تجنب الإجابات الطويلة جداً التي لا داعي لها).`;
}

// 5. Socket.io Handlers
io.on('connection', (socket) => {
    console.log('CRM Client connected:', socket.id);

    // Initial load
    socket.emit('init-data', { aiConfig, conversations, isWhatsAppReady });

    if (lastQr && !isWhatsAppReady) {
        console.log(`Socket client connected and lastQr exists. Generating QR code URL for client...`);
        qrcode.toDataURL(lastQr, (err, url) => {
            if (err) {
                console.error('Error generating QR DataURL for new client connection:', err);
            } else {
                console.log('Sending cached QR code URL to client...');
                socket.emit('qr', url);
            }
        });
    }

    // Config saves
    socket.on('update-config', (newConfig) => {
        aiConfig = newConfig;
        saveConfig();
        console.log('AI Configuration successfully updated and saved locally.');
        socket.broadcast.emit('config-updated', aiConfig);
    });

    // Chat metadata saves
    socket.on('update-chat-meta', ({ chatId, tag, notes, aiActive }) => {
        const chat = conversations.find(c => c.id === chatId);
        if (chat) {
            if (tag !== undefined) chat.tag = tag;
            if (notes !== undefined) chat.notes = notes;
            if (aiActive !== undefined) chat.aiActive = aiActive;
            saveChats();
            socket.broadcast.emit('chats-updated', conversations);
        }
    });

    // Manual messaging
    socket.on('send-manual-message', async ({ chatId, text }) => {
        const chat = conversations.find(c => c.id === chatId);
        if (chat) {
            const time = getFormattedTime();
            const msgId = `msg-${Date.now()}`;
            const newMsg = {
                id: msgId,
                sender: 'manual',
                text: text,
                time: time
            };
            chat.messages.push(newMsg);
            saveChats();

            io.emit('whatsapp-message', { chatId: chat.id, message: newMsg, conversations });

            if (isWhatsAppReady && sock) {
                try {
                    const formattedPhone = chat.phone.replace(/[\s\+]/g, '') + '@s.whatsapp.net';
                    await sock.sendMessage(formattedPhone, { text: text });
                    console.log(`Manual WhatsApp message sent to ${chat.phone}: "${text}"`);
                } catch (e) {
                    console.error('Error sending manual message via WhatsApp:', e);
                    socket.emit('error-log', { message: `فشل في إرسال الرسالة عبر الواتساب: ${e.message}` });
                }
            } else {
                socket.emit('error-log', { message: 'الواتساب غير متصل بالهاتف حالياً. تم حفظ الرسالة في السجل فقط.' });
            }
        }
    });

    // Disconnect WhatsApp session
    socket.on('disconnect-device', async () => {
        console.log('Disconnecting WhatsApp session as requested...');
        try {
            if (sock) {
                await sock.logout();
                sock = null;
            }
        } catch (e) {
            console.error('Logout error:', e);
        }
        isWhatsAppReady = false;
        lastQr = null;
        io.emit('disconnected', 'User request');
    });

    // QR generation manual requests
    socket.on('generate-qr-request', () => {
        if (isWhatsAppReady) {
            socket.emit('ready');
        } else if (lastQr) {
            qrcode.toDataURL(lastQr, (err, url) => {
                if (!err) socket.emit('qr', url);
            });
        } else {
            console.log('Initializing WhatsApp client on QR request...');
            if (!sock) {
                connectToWhatsApp().catch(err => {
                    console.error('Error initializing WhatsApp client:', err);
                    socket.emit('error-log', { message: `خطأ في بدء تشغيل عميل واتساب: ${err.message}` });
                });
            }
        }
    });
});

function getFormattedTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes}`;
}

// Start Server
server.listen(PORT, () => {
    console.log(`WhatsBot backend running on: http://localhost:${PORT}`);
});

// Initialize on startup
console.log('Initializing WhatsApp client...');
connectToWhatsApp().catch(err => {
    console.error('Failed to initialize WhatsApp client on startup:', err);
});
