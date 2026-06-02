// WhatsBot AI - Application State and Logic

// 1. Initial State
const state = {
    currentTab: 'dashboard',
    isConnected: false,
    aiConfig: {
        name: 'مساعد لورا الذكي',
        model: 'gemini-1.5-pro',
        language: 'iraqi',
        temperature: 0.3,
        apiKey: localStorage.getItem('gemini_api_key') || '',
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
    },
    conversations: [
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
        },
        {
            id: 'chat-2',
            name: 'سارة محمد',
            phone: '+964 750 246 8101',
            location: 'أربيل، عينكاوة',
            date: 'اليوم، 17:15',
            tag: 'customer',
            notes: 'زبونة دائمة للصبغ والقص. تم الاتفاق معها على الحجز يوم الخميس القادم الساعة 4 مساءً.',
            aiActive: true,
            messages: [
                { id: 'm3', sender: 'bot', text: 'مرحباً بك في صالون لورا للتجميل! ✨ كيف يمكنني مساعدتك اليوم؟ 🌸', time: '17:00' },
                { id: 'm4', sender: 'customer', text: 'مرحبا حبي، بس سؤال صالونكم المنصور بشارع الأميرات لو غير مكان؟', time: '17:05' },
                { id: 'm5', sender: 'bot', text: 'أهلاً بيج عيني سارة. نعم صالوننا بالمنصور بشارع الأميرات، قرب مول بابيلون. نفتح يومياً من 11 الصبح لـ 8 بالليل. تفضلي حابة تحجزين موعد؟ 🌸', time: '17:06' },
                { id: 'm6', sender: 'customer', text: 'اي فدوة، أريد حجز صبغ وقص شعر الخميس الجاي بـ 4 العصر باسم سارة محمد.', time: '17:10' },
                { id: 'm7', sender: 'bot', text: 'تدللين عيني سارة، تم تثبيت موعد صبغ وقص شعر يوم الخميس القادم الساعة 4:00 عصراً باسمج. ننتظرج بكل حب! 💖', time: '17:12' },
                { id: 'm8', sender: 'customer', text: 'شكرا جزيلا لكم فدوة لقلبكم ♥️', time: '17:15' }
            ]
        },
        {
            id: 'chat-3',
            name: 'علي الحسين',
            phone: '+964 771 555 9922',
            location: 'البصرة، العشار',
            date: 'أمس، 22:45',
            tag: 'spam',
            notes: 'أرسل إعلان ترويجي للمواد الطبية وصحون الأظافر. تم تحويله لسبام.',
            aiActive: false,
            messages: [
                { id: 'm9', sender: 'customer', text: 'السلام عليكم، متوفر عندكم توصيل مواد تجهيز صالونات للبصرة؟ عدنا عروض خيالية على أصباغ الشعر ومواد المانكير.', time: '22:40' },
                { id: 'm10', sender: 'manual', text: 'وعليكم السلام، نعتذر منك أخي نحن صالون تجميل ولسنا مكتب تجهيز. شكراً لك.', time: '22:45' }
            ]
        }
    ],
    activeChatId: 'chat-1',
    messagesChart: null,
    categoriesChart: null
};

// Socket.io initialization
let socket = null;
if (typeof io !== 'undefined') {
    socket = io();
    setupSocketListeners();
}

function setupSocketListeners() {
    socket.on('init-data', ({ aiConfig: serverConfig, conversations: serverConversations, isWhatsAppReady }) => {
        state.aiConfig = serverConfig;
        state.conversations = serverConversations;
        state.isConnected = isWhatsAppReady;
        
        if (serverConfig.apiKey) {
            localStorage.setItem('gemini_api_key', serverConfig.apiKey);
        }
        
        updateConnectionUI();
        loadActiveConversation();
        renderChatsList();
        updateUnreadCount();
        updateGeminiStatusBadge();
        
        const activeChat = state.conversations.find(c => c.id === state.activeChatId);
        if (activeChat) {
            syncPhoneSimulatorToSelectedChat(activeChat);
        }
    });

    socket.on('qr', (qrImageUrl) => {
        state.isConnected = false;
        updateConnectionUI();
        
        const qrImage = document.getElementById('qr-image');
        const qrSvg = document.getElementById('qr-svg-code');
        const placeholder = document.getElementById('qr-placeholder-wrapper');
        const scanner = document.getElementById('qr-scanner-wrapper');
        const loadingOverlay = document.getElementById('qr-loading-overlay');
        
        if (placeholder) placeholder.classList.add('hidden');
        if (scanner) scanner.classList.remove('hidden');
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        
        if (qrImage) {
            qrImage.src = qrImageUrl;
            qrImage.style.display = 'block';
        }
        if (qrSvg) {
            qrSvg.style.display = 'none';
        }
        
        addGlobalLog('نظام الويب', 'تم استلام رمز استجابة حقيقي من الهاتف. يرجى مسحه باستخدام واتساب للربط الحقيقي...');
    });

    socket.on('ready', () => {
        state.isConnected = true;
        updateConnectionUI();
        
        const loadingOverlay = document.getElementById('qr-loading-overlay');
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        
        addGlobalLog('نظام الويب', 'تم الاتصال بالهاتف الحقيقي ومزامنة البيانات بنجاح!');
    });

    socket.on('disconnected', (reason) => {
        state.isConnected = false;
        updateConnectionUI();
        addGlobalLog('نظام الويب', `انقطع الاتصال بالواتساب: ${reason}`);
    });

    socket.on('whatsapp-message', ({ chatId, message, conversations: updatedConversations }) => {
        state.conversations = updatedConversations;
        updateUnreadCount();
        
        if (chatId === state.activeChatId) {
            loadActiveConversation();
            const activeChat = state.conversations.find(c => c.id === state.activeChatId);
            if (activeChat) {
                syncPhoneSimulatorToSelectedChat(activeChat);
            }
        } else {
            renderChatsList();
        }
    });

    socket.on('typing', ({ chatId, show }) => {
        if (chatId === state.activeChatId) {
            showSimulatorTyping(show);
        }
    });

    socket.on('error-log', ({ message }) => {
        addGlobalLog('خطأ النظام', message);
        showNotification(message);
    });

    socket.on('config-updated', (newConfig) => {
        state.aiConfig = newConfig;
        updateGeminiStatusBadge();
    });

    socket.on('chats-updated', (newConversations) => {
        state.conversations = newConversations;
        renderChatsList();
        if (state.conversations.find(c => c.id === state.activeChatId)) {
            loadActiveConversation();
        }
    });
}

// 2. Preset Data Store
const presets = {
    salon: {
        name: 'مساعد لورا الذكي',
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
    },
    ecommerce: {
        name: 'مساعد مبيعات الفخامة',
        systemPrompt: `أنت مساعد مبيعات ذكي ومقنع لمتجر "عطور الفخامة" في العراق. تتحدث بلهجة عراقية مهذبة وودودة.
وظيفتك الإجابة على استفسارات الزبائن حول العطور المتوفرة وأسعارها وعروض التوصيل.
حفّز الزبون دائماً على الطلب، وعندما يبدي رغبته بالشراء، اطلب منه تزويدك باسمه الكامل، رقم هاتفه، وعنوانه التفصيلي لإتمام الطلب.`,
        faqs: [
            {
                id: 'faq-1',
                question: 'قائمة العطور المتوفرة والأسعار',
                answer: `العطور المتوفرة لدينا حالياً مع أسعارها:
1. عطر رويال عود (ملكي وفواح): 45,000 د.ع.
2. عطر سيلا بيل (نسائي هادئ وجذاب): 35,000 د.ع.
3. عطر ليدر (رجالي رسمي وثابت): 40,000 د.ع.
خصم 10% عند طلب عطرين أو أكثر!`
            },
            {
                id: 'faq-2',
                question: 'أسعار التوصيل وموعد الوصول',
                answer: `خدمة التوصيل متوفرة لكافة أنحاء العراق:
- داخل بغداد: 3,000 د.ع (يصل خلال 24 ساعة).
- جميع المحافظات: 5,000 د.ع (يستغرق 2 إلى 3 أيام).`
            },
            {
                id: 'faq-3',
                question: 'سياسة الاستبدال والضمان',
                answer: `جميع عطورنا أصلية 100% مع ضمان الثبات والفوحان لمدة 24 ساعة.
تتيح لك خدمة التوصيل فحص العطر ورشه عند الباب قبل الدفع للمندوب، وفي حال لم يعجبك يمكنك إرجاعه مباشرة مع دفع أجور التوصيل فقط.`
            }
        ]
    },
    booking: {
        name: 'مساعد عيادة د. علي',
        systemPrompt: `أنت مساعد الحجز الذكي لـ "عيادة الدكتور علي لطب الأسنان" في أربيل. تتحدث باللغة العربية الفصحى بأسلوب مهني وواضح ومحترم جداً.
تجيب عن أوقات الدوام، تكلفة الكشفية، وتساعد المرضى في اختيار موعد مناسب لتنظيف أو علاج الأسنان وتأكيده مع طلب الاسم الثلاثي ورقم الهاتف للاتصال.`,
        faqs: [
            {
                id: 'faq-1',
                question: 'أوقات الدوام والدوام الرسمي للعيادة',
                answer: `أوقات عمل عيادة الدكتور علي لطب الأسنان:
من السبت إلى الأربعاء: من الساعة 4:00 عصراً وحتى 9:00 مساءً.
الخميس والجمعة: عطلة العيادة الأسبوعية.`
            },
            {
                id: 'faq-2',
                question: 'عنوان العيادة وتفاصيل الوصول',
                answer: `عنوان العيادة: أربيل، شارع 60، قرب تقاطع مستشفى رزكاري، مجمع النور الطبي، الطابق الثاني شقة 5.`
            },
            {
                id: 'faq-3',
                question: 'أسعار الكشفية والخدمات الأساسية',
                answer: `تكلفة الخدمات في عيادتنا:
- كشفية واستشارة الطبيب: 25,000 د.ع.
- حشوة ضوئية تجميلية: تبدأ من 50,000 د.ع.
- تنظيف وتبييض أسنان (سيلر): 45,000 د.ع.
- قلع سن عادي: 30,000 د.ع.`
            }
        ]
    },
    support: {
        name: 'دعم الرافدين للإنترنت',
        systemPrompt: `أنت وكيل دعم فني ذكي وصبور لشركة "الرافدين لخدمات الإنترنت". تتحدث بلهجة هادئة وبسيطة.
تحاول دائماً تشخيص مشاكل بطء الإنترنت أو انقطاعه مع المشترك خطوة بخطوة.
اطلب من المشترك دائماً إعادة تشغيل الراوتر والنانو، والتحقق من لون لمبات الإشارة، وإذا لم تنحل المشكلة اطلب اسم المشترك ورقم هاتفه لفتح تذكرة صيانة.`,
        faqs: [
            {
                id: 'faq-1',
                question: 'خطوات حل بطء الإنترنت أو التقطيع',
                answer: `خطوات الفحص السريع لسرعة الإنترنت:
1. اطفئ الراوتر وجهاز النانو الخارجي من الكهرباء لمدة دقيقة كاملة ثم أعد تشغيلهما.
2. تأكد من أنك متصل بالشبكة الصحيحة وتأكد من عدد الأجهزة المكنكة التي تسحب السرعة.
3. قم بإجراء فحص السرعة عن طريق موقع speedtest.net للتأكد.`
            },
            {
                id: 'faq-2',
                question: 'لمبة الـ LOS الحمراء بالراوتر',
                answer: `إذا كانت لمبة الـ LOS تومض باللون الأحمر في راوتر الألياف الضوئية، فهذا يعني وجود قطع في السلك الخارجي أو خلل بالمنظومة العامة. يرجى تزويدنا باسم المشترك ورقم هاتفه لنرسل كادر الصيانة فوراً.`
            },
            {
                id: 'faq-3',
                question: 'تجديد الاشتراك والأسعار المتاحة',
                answer: `أسعار باقات إنترنت الرافدين الشهرية:
- الباقة الاقتصادية (15 ميجا): 30,000 د.ع.
- الباقة العائلية (30 ميجا): 45,000 د.ع.
- الباقة الفائقة (60 ميجا): 65,000 د.ع.
تجديد الاشتراك يتم يدوياً عن طريق إرسال يوزر الاشتراك أو الاسم للمندوب للتحويل الفوري.`
            }
        ]
    }
};

// 3. Document Ready Setup
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// 4. Initialization
function initApp() {
    setupTabSwitching();
    setupWhatsAppConnection();
    setupAISettings();
    setupLiveChat();
    setupPhoneSimulator();
    renderCharts();
    updateUnreadCount();
    updateGeminiStatusBadge();
    
    // Simulate current time on phone
    setInterval(updatePhoneTime, 10000);
    updatePhoneTime();
}

function updateGeminiStatusBadge() {
    const badge = document.getElementById('gemini-status-badge');
    if (!badge) return;
    if (state.aiConfig.apiKey) {
        badge.className = 'api-status-badge badge-real-gemini';
        badge.innerHTML = '<i class="ri-instance-fill"></i><span>Gemini متصل</span>';
    } else {
        badge.className = 'api-status-badge badge-simulation';
        badge.innerHTML = '<i class="ri-instance-line"></i><span>وضع المحاكاة</span>';
    }
}

// 5. Time Utilities
function updatePhoneTime() {
    const timeDisplay = document.getElementById('ios-time-display');
    if (timeDisplay) {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        timeDisplay.textContent = `${hours}:${minutes}`;
    }
}

function getFormattedTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes}`;
}

// 6. Tab Switching
function setupTabSwitching() {
    const navButtons = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const headerTitle = document.getElementById('header-title');
    const headerSubtitle = document.getElementById('header-subtitle');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            state.currentTab = targetTab;
            
            // Toggle Nav Active Class
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Toggle Tab Pane Active Class
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            
            // Update Header Meta
            updateHeader(targetTab);
        });
    });
}

function updateHeader(tabId) {
    const title = document.getElementById('header-title');
    const subtitle = document.getElementById('header-subtitle');
    
    const meta = {
        'dashboard': {
            title: 'أهلاً بك، صالون لورا',
            subtitle: 'إليك ملخص أداء مساعد الذكاء الاصطناعي اليوم.'
        },
        'whatsapp-connect': {
            title: 'ربط قناة الواتساب',
            subtitle: 'قم بربط حسابك بمساعد الذكاء الاصطناعي لتشغيل الردود الفورية.'
        },
        'ai-settings': {
            title: 'إعدادات وكيل الذكاء الاصطناعي',
            subtitle: 'خصص نبرة البوت، وموديل الذكاء، وقاعدة الأسئلة والأجوبة للمشروع.'
        },
        'live-chat': {
            title: 'المحادثات المباشرة (Live Chat)',
            subtitle: 'راقب محادثات البوت وتدخل يدوياً في أي لحظة للرد على زبائنك.'
        }
    };
    
    if (meta[tabId]) {
        title.textContent = meta[tabId].title;
        subtitle.textContent = meta[tabId].subtitle;
    }
}

// 7. WhatsApp Connection Simulator
function setupWhatsAppConnection() {
    const generateQrBtn = document.getElementById('generate-qr-btn');
    const placeholder = document.getElementById('qr-placeholder-wrapper');
    const scanner = document.getElementById('qr-scanner-wrapper');
    const loadingOverlay = document.getElementById('qr-loading-overlay');
    const loadingText = document.getElementById('qr-loading-text');
    
    const discView = document.getElementById('wa-disconnected-view');
    const connView = document.getElementById('wa-connected-view');
    const disconnectBtn = document.getElementById('disconnect-wa-btn');
    
    const globalStatusBadge = document.getElementById('global-status-badge');
    const globalStatusText = document.getElementById('global-status-text');
    const navStatusDot = document.getElementById('nav-status-dot');
    
    const logsList = document.getElementById('connection-logs-list');
    
    let autoConnectTimeout = null;
    let syncTimeout = null;

    function connectDevice() {
        state.isConnected = true;
        updateConnectionUI();
        addLog('نظام الويب', 'تمت المزامنة والربط بنجاح مع الرقم +964 770 123 4567');
        addLog('نظام الويب', 'الرد التلقائي بالذكاء الاصطناعي مفعّل الآن.');
        loadingOverlay.classList.add('hidden');
    }

    generateQrBtn.addEventListener('click', () => {
        if (socket) {
            socket.emit('generate-qr-request');
            placeholder.classList.add('hidden');
            scanner.classList.remove('hidden');
            loadingOverlay.classList.remove('hidden');
            loadingText.textContent = 'جاري الاتصال بالخادم وتوليد رمز الاستجابة الحقيقي...';
            return;
        }

        if (autoConnectTimeout) clearTimeout(autoConnectTimeout);
        if (syncTimeout) clearTimeout(syncTimeout);

        placeholder.classList.add('hidden');
        scanner.classList.remove('hidden');
        loadingOverlay.classList.remove('hidden');
        loadingText.textContent = 'جاري إنشاء رمز الاستجابة...';
        
        // Step 1: Simulate QR Generation quickly (800ms)
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            addLog('نظام الويب', 'تم توليد رمز الاستجابة السريعة بنجاح. بانتظار مسح المستخدم أو انقر فوق الرمز للمحاكاة الفورية...');
            
            // Step 2: Auto connect after 2 seconds OR immediately on click
            autoConnectTimeout = setTimeout(() => {
                if (!state.isConnected) {
                    loadingOverlay.classList.remove('hidden');
                    loadingText.textContent = 'تم المسح! جاري مزامنة البيانات...';
                    
                    syncTimeout = setTimeout(() => {
                        connectDevice();
                    }, 1000);
                }
            }, 2000);
            
        }, 800);
    });

    // Add click handler to QR Code container box for instant scan simulation
    const qrScannerBox = document.getElementById('qr-scanner-wrapper');
    if (qrScannerBox) {
        qrScannerBox.addEventListener('click', () => {
            if (state.isConnected) return;
            if (socket) return; // Real mode does not allow click connection simulation
            
            // Prevent triggering while the initial loading spinner is showing
            if (!loadingOverlay.classList.contains('hidden') && loadingText.textContent.includes('جاري إنشاء')) {
                return;
            }
            
            if (autoConnectTimeout) clearTimeout(autoConnectTimeout);
            if (syncTimeout) clearTimeout(syncTimeout);
            
            addLog('نظام الويب', 'تم مسح الرمز يدوياً بواسطة المستخدم.');
            loadingOverlay.classList.remove('hidden');
            loadingText.textContent = 'تم المسح يدوياً! جاري المزامنة الفورية...';
            
            setTimeout(() => {
                connectDevice();
            }, 500);
        });
    }
    
    disconnectBtn.addEventListener('click', () => {
        if (socket) {
            socket.emit('disconnect-device');
            return;
        }

        state.isConnected = false;
        updateConnectionUI();
        // Clear log queue
        logsList.innerHTML = `
            <div class="log-item">
                <span class="log-time">${getFormattedTime()}</span>
                <span class="log-text">تم قطع الاتصال بالهاتف يدوياً من قبل المستخدم.</span>
            </div>
        `;
    });
    
    function updateConnectionUI() {
        if (state.isConnected) {
            discView.classList.remove('active');
            discView.classList.add('hidden');
            connView.classList.remove('hidden');
            connView.classList.add('active');
            
            globalStatusBadge.className = 'connection-status-badge connected';
            globalStatusText.textContent = 'متصل بالواتساب';
            navStatusDot.className = 'status-dot connected';
            
            document.getElementById('wa-bot-status-text').textContent = 'متصل';
            document.getElementById('wa-connected-time').textContent = `اليوم، ${getFormattedTime()}`;
        } else {
            connView.classList.remove('active');
            connView.classList.add('hidden');
            discView.classList.remove('hidden');
            discView.classList.add('active');
            
            placeholder.classList.remove('hidden');
            scanner.classList.add('hidden');
            
            globalStatusBadge.className = 'connection-status-badge disconnected';
            globalStatusText.textContent = 'الواتساب غير متصل';
            navStatusDot.className = 'status-dot disconnected';
            
            document.getElementById('wa-bot-status-text').textContent = 'غير متصل';
        }
    }
    
    function addLog(source, text) {
        const item = document.createElement('div');
        item.className = 'log-item';
        item.innerHTML = `
            <span class="log-time">${getFormattedTime()}</span>
            <span class="log-text"><strong>[${source}]</strong> ${text}</span>
        `;
        logsList.appendChild(item);
        logsList.scrollTop = logsList.scrollHeight;
    }
}

// 8. AI Persona Settings & Presets
function setupAISettings() {
    const presetButtons = document.querySelectorAll('.preset-btn');
    const nameInput = document.getElementById('ai-name');
    const promptTextarea = document.getElementById('ai-system-prompt');
    const faqContainer = document.getElementById('faq-items-list');
    const saveBtn = document.getElementById('save-ai-settings-btn');
    
    const tempInput = document.getElementById('ai-temp');
    const tempVal = document.getElementById('ai-temp-val');
    
    const apiKeyInput = document.getElementById('gemini-api-key');
    const toggleApiKeyBtn = document.getElementById('toggle-api-key-btn');
    
    // Set initial API Key value
    if (apiKeyInput) {
        apiKeyInput.value = state.aiConfig.apiKey;
    }
    
    // Toggle API Key visibility
    if (toggleApiKeyBtn && apiKeyInput) {
        toggleApiKeyBtn.addEventListener('click', () => {
            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                toggleApiKeyBtn.innerHTML = '<i class="ri-eye-line"></i>';
                toggleApiKeyBtn.title = 'إخفاء مفتاح الـ API';
            } else {
                apiKeyInput.type = 'password';
                toggleApiKeyBtn.innerHTML = '<i class="ri-eye-off-line"></i>';
                toggleApiKeyBtn.title = 'إظهار مفتاح الـ API';
            }
        });
    }
    
    // Slider update
    tempInput.addEventListener('input', () => {
        tempVal.textContent = tempInput.value;
    });
    
    // Switch Presets
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const presetKey = btn.getAttribute('data-preset');
            const data = presets[presetKey];
            
            if (data) {
                // Apply preset with typing animation simulation
                nameInput.value = data.name;
                promptTextarea.value = data.systemPrompt;
                
                state.aiConfig.name = data.name;
                state.aiConfig.systemPrompt = data.systemPrompt;
                state.aiConfig.faqs = JSON.parse(JSON.stringify(data.faqs)); // deep copy
                
                renderFAQs();
                showNotification('تم تطبيق النموذج الجاهز بنجاح! يرجى النقر على حفظ لحفظ التغييرات.');
            }
        });
    });
    
    // Add FAQ row
    document.getElementById('add-faq-btn').addEventListener('click', () => {
        const newId = `faq-${Date.now()}`;
        state.aiConfig.faqs.push({
            id: newId,
            question: '',
            answer: ''
        });
        renderFAQs();
        
        // Scroll to the new item
        const list = document.getElementById('faq-items-list');
        list.scrollTop = list.scrollHeight;
    });
    
    // Save AI Config
    saveBtn.addEventListener('click', () => {
        // Grab values
        state.aiConfig.name = nameInput.value;
        state.aiConfig.model = document.getElementById('ai-model').value;
        state.aiConfig.language = document.getElementById('ai-language').value;
        state.aiConfig.temperature = parseFloat(tempInput.value);
        state.aiConfig.systemPrompt = promptTextarea.value;
        
        if (apiKeyInput) {
            state.aiConfig.apiKey = apiKeyInput.value.trim();
            localStorage.setItem('gemini_api_key', state.aiConfig.apiKey);
        }
        
        // Sync FAQs from Inputs
        const faqRows = document.querySelectorAll('.faq-item-row');
        state.aiConfig.faqs = [];
        
        faqRows.forEach(row => {
            const id = row.getAttribute('data-id');
            const question = row.querySelector('.faq-question-input').value;
            const answer = row.querySelector('.faq-answer-textarea').value;
            
            if (question.trim() || answer.trim()) {
                state.aiConfig.faqs.push({ id, question, answer });
            }
        });
        
        // Update Bot name in Simulator WhatsApp Header
        document.querySelector('.wa-chat-info h4').textContent = state.aiConfig.name;
        
        // Update Gemini Status Badge
        updateGeminiStatusBadge();
        
        if (socket) {
            socket.emit('update-config', state.aiConfig);
        }
        
        showNotification('تم حفظ إعدادات وقاعدة بيانات الذكاء الاصطناعي بنجاح!');
    });
    
    // Render FAQ Elements
    function renderFAQs() {
        faqContainer.innerHTML = '';
        state.aiConfig.faqs.forEach((faq, index) => {
            const row = document.createElement('div');
            row.className = 'faq-item-row';
            row.setAttribute('data-id', faq.id);
            row.innerHTML = `
                <div class="faq-row-header">
                    <div class="faq-badge">سؤال وجواب #${index + 1}</div>
                    <button class="delete-faq-btn" title="حذف" onclick="deleteFaq('${faq.id}')">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
                <div class="form-group">
                    <input type="text" class="faq-question-input" value="${faq.question}" placeholder="الكلمات المفتاحية أو السؤال (مثال: الأسعار، العناوين)">
                </div>
                <div class="form-group">
                    <textarea class="faq-answer-textarea" rows="3" placeholder="الإجابة التفصيلية...">${faq.answer}</textarea>
                </div>
            `;
            faqContainer.appendChild(row);
        });
    }
}

// Global scope delete FAQ helper
window.deleteFaq = function(id) {
    state.aiConfig.faqs = state.aiConfig.faqs.filter(faq => faq.id !== id);
    const container = document.getElementById('faq-items-list');
    const row = container.querySelector(`[data-id="${id}"]`);
    if (row) {
        row.style.opacity = 0;
        row.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            row.remove();
            // Re-render to update the header badges (#1, #2, #3...)
            const faqContainer = document.getElementById('faq-items-list');
            faqContainer.innerHTML = '';
            state.aiConfig.faqs.forEach((faq, index) => {
                const newRow = document.createElement('div');
                newRow.className = 'faq-item-row';
                newRow.setAttribute('data-id', faq.id);
                newRow.innerHTML = `
                    <div class="faq-row-header">
                        <div class="faq-badge">سؤال وجواب #${index + 1}</div>
                        <button class="delete-faq-btn" title="حذف" onclick="deleteFaq('${faq.id}')">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                    <div class="form-group">
                        <input type="text" class="faq-question-input" value="${faq.question}" placeholder="الكلمات المفتاحية أو السؤال">
                    </div>
                    <div class="form-group">
                        <textarea class="faq-answer-textarea" rows="3" placeholder="الإجابة التفصيلية...">${faq.answer}</textarea>
                    </div>
                `;
                faqContainer.appendChild(newRow);
            });
        }, 300);
    }
};

// 9. Live Chat Console Logic
function setupLiveChat() {
    const chatListWrapper = document.getElementById('chats-list-wrapper');
    const chatMessages = document.getElementById('chat-messages-container');
    const manualInput = document.getElementById('chat-manual-input');
    const sendManualBtn = document.getElementById('send-manual-message-btn');
    const aiToggle = document.getElementById('ai-auto-reply-toggle');
    
    // Render Chat Sessions Sidebar list
    renderChatsList();
    loadActiveConversation();
    
    // AI Toggle Event
    aiToggle.addEventListener('change', () => {
        const activeChat = state.conversations.find(c => c.id === state.activeChatId);
        if (activeChat) {
            activeChat.aiActive = aiToggle.checked;
            
            // Add notification text inside console
            appendSystemMessage(
                activeChat.aiActive 
                ? 'تم تفعيل الرد التلقائي للذكاء الاصطناعي لهذه المحادثة.' 
                : 'تم إيقاف الرد التلقائي. يتوجب عليك الرد يدوياً الآن.'
            );
            
            // Re-render sidebar list to update status badge
            renderChatsList();
        }
    });
    
    // Send Manual Message
    sendManualBtn.addEventListener('click', sendManualMessage);
    manualInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendManualMessage();
    });
    
    function sendManualMessage() {
        const text = manualInput.value.trim();
        if (!text) return;
        
        const activeChat = state.conversations.find(c => c.id === state.activeChatId);
        if (!activeChat) return;
        
        if (socket) {
            socket.emit('send-manual-message', { chatId: activeChat.id, text });
            
            // If AI auto reply was active, pause it on backend
            if (activeChat.aiActive) {
                activeChat.aiActive = false;
                aiToggle.checked = false;
                socket.emit('update-chat-meta', { chatId: activeChat.id, aiActive: false });
                appendSystemMessage('تم إيقاف الرد التلقائي تلقائياً للتدخل البشري.');
            }
            
            manualInput.value = '';
            return;
        }
        
        const time = getFormattedTime();
        const msgId = `msg-${Date.now()}`;
        
        // Add manual msg to local state
        activeChat.messages.push({
            id: msgId,
            sender: 'manual',
            text: text,
            time: time
        });
        
        // If AI auto reply was active, pause it (Standard CRM behavior: human answers pause AI)
        if (activeChat.aiActive) {
            activeChat.aiActive = false;
            aiToggle.checked = false;
            appendSystemMessage('تم إيقاف الرد التلقائي تلقائياً للتدخل البشري.');
        }
        
        manualInput.value = '';
        
        // Refresh views
        loadActiveConversation();
        renderChatsList();
        
        // Sync to Phone Simulator ONLY if phone simulator is showing this user!
        syncPhoneSimulatorMessages(activeChat);
        
        // Auto scroll
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // System message helper
    function appendSystemMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'wa-date-divider';
        msg.style.background = 'rgba(245, 158, 11, 0.08)';
        msg.style.border = '1px solid rgba(245, 158, 11, 0.15)';
        msg.style.color = 'var(--warning)';
        msg.style.alignSelf = 'center';
        msg.style.margin = '10px 0';
        msg.style.width = 'fit-content';
        msg.textContent = text;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function renderChatsList() {
    const wrapper = document.getElementById('chats-list-wrapper');
    wrapper.innerHTML = '';
    
    state.conversations.forEach(chat => {
        const lastMsg = chat.messages[chat.messages.length - 1];
        const preview = lastMsg ? lastMsg.text : 'لا توجد رسائل سابقة';
        const time = lastMsg ? lastMsg.time : '';
        const hasUnread = chat.messages.filter(m => m.sender === 'customer' && !m.read).length > 0;
        
        const item = document.createElement('div');
        item.className = `chat-list-item ${chat.id === state.activeChatId ? 'active' : ''}`;
        item.innerHTML = `
            <div class="chat-item-avatar">${chat.name.charAt(0)}</div>
            <div class="chat-item-details">
                <div class="chat-item-header">
                    <h4>${chat.name}</h4>
                    <span class="chat-item-time">${time}</span>
                </div>
                <div class="chat-item-footer">
                    <p class="chat-item-preview">${preview}</p>
                    ${chat.aiActive 
                        ? `<span class="chat-badge-status status-ai"><i class="ri-robot-line"></i> AI</span>`
                        : `<span class="chat-badge-status status-manual"><i class="ri-user-line"></i> يدوي</span>`
                    }
                </div>
            </div>
            ${hasUnread ? `<span class="chat-unread-dot"></span>` : ''}
        `;
        
        item.addEventListener('click', () => {
            // Mark customer messages as read
            chat.messages.forEach(m => {
                if (m.sender === 'customer') m.read = true;
            });
            
            state.activeChatId = chat.id;
            renderChatsList();
            loadActiveConversation();
            updateUnreadCount();
            
            // Sync Phone Simulator title and content to this chat!
            syncPhoneSimulatorToSelectedChat(chat);
        });
        
        wrapper.appendChild(item);
    });
}

function updateUnreadCount() {
    let unreadTotal = 0;
    state.conversations.forEach(chat => {
        const unreads = chat.messages.filter(m => m.sender === 'customer' && !m.read).length;
        unreadTotal += unreads;
    });
    
    const navBadge = document.getElementById('unread-chats-count');
    if (unreadTotal > 0) {
        navBadge.textContent = unreadTotal;
        navBadge.style.display = 'block';
    } else {
        navBadge.style.display = 'none';
    }
}

function loadActiveConversation() {
    const activeChat = state.conversations.find(c => c.id === state.activeChatId);
    if (!activeChat) return;
    
    // Update active user metadata header
    document.getElementById('active-chat-avatar').textContent = activeChat.name.charAt(0);
    document.getElementById('active-chat-name').textContent = activeChat.name;
    document.getElementById('active-chat-phone').textContent = activeChat.phone;
    
    // Update Right Panel Info
    document.getElementById('customer-tag-select').value = activeChat.tag;
    document.getElementById('customer-meta-location').textContent = activeChat.location;
    document.getElementById('customer-meta-date').textContent = activeChat.date;
    document.getElementById('customer-manual-notes').value = activeChat.notes;
    
    // Save notes event
    document.getElementById('customer-manual-notes').onblur = (e) => {
        activeChat.notes = e.target.value;
    };
    // Save tag event
    document.getElementById('customer-tag-select').onchange = (e) => {
        activeChat.tag = e.target.value;
    };
    
    // Update AI Auto reply toggle check
    document.getElementById('ai-auto-reply-toggle').checked = activeChat.aiActive;
    
    // Render message bubbles
    const messagesContainer = document.getElementById('chat-messages-container');
    messagesContainer.innerHTML = '';
    
    activeChat.messages.forEach(msg => {
        const bubble = document.createElement('div');
        
        if (msg.sender === 'customer') {
            bubble.className = 'msg-bubble incoming';
            bubble.innerHTML = `
                <div class="msg-msg-text">${msg.text}</div>
                <div class="msg-meta">
                    <span>${msg.time}</span>
                </div>
            `;
        } else {
            bubble.className = 'msg-bubble outgoing';
            const isAI = msg.sender === 'bot';
            bubble.innerHTML = `
                ${isAI ? `<span class="msg-ai-tag"><i class="ri-robot-line"></i> ${state.aiConfig.name}</span>` : ''}
                <div class="msg-msg-text">${msg.text}</div>
                <div class="msg-meta">
                    <span>${msg.time}</span>
                    <i class="ri-double-check-line read-check"></i>
                </div>
            `;
        }
        messagesContainer.appendChild(bubble);
    });
    
    // Update AI Summary Text Box
    generateAISummary(activeChat);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateAISummary(chat) {
    const summaryText = document.getElementById('ai-summary-text');
    
    // A quick local generator for summary to look extremely realistic
    const customerMsgs = chat.messages.filter(m => m.sender === 'customer');
    if (customerMsgs.length === 0) {
        summaryText.innerHTML = '<span style="color: var(--text-muted)">لا توجد رسائل كافية لإنشاء ملخص.</span>';
        return;
    }
    
    const lastMsgText = customerMsgs[customerMsgs.length - 1].text.toLowerCase();
    
    let summary = `الزبون <strong>${chat.name}</strong> يتواصل بخصوص صالون لورا. `;
    if (chat.id === 'chat-1') {
        summary = `الزبون يبحث عن حجز موعد لـ <strong>تنظيف بشرة وشعر ويفي</strong> لزوجته. يستفسر عن إمكانية الحجز في اليوم التالي عصراً.`;
    } else if (chat.id === 'chat-2') {
        summary = `تم إنهاء الحجز بنجاح لـ <strong>قص وصبغ شعر</strong> يوم الخميس القادم بـ 4 العصر. الزبونة راضية جداً وأنهت المحادثة بالشكر.`;
    } else if (chat.id === 'chat-3') {
        summary = `مرسل عرض تجهيز للمواد الطبية. المحادثة مغلقة حيث لا تطابق الخدمات المقدمة لدينا، مصنف كـ <strong>غير مهتم (Spam)</strong>.`;
    } else {
        // dynamic simulation
        if (lastMsgText.includes('حجز') || lastMsgText.includes('موعد')) {
            summary = `الزبون يرغب في <strong>تأكيد حجز موعد جديد</strong>. يستفسر حالياً عن المواعيد المتاحة للخدمات.`;
        } else if (lastMsgText.includes('سعر') || lastMsgText.includes('بكم') || lastMsgText.includes('بيش')) {
            summary = `الزبون يستفسر عن <strong>أسعار الخدمات وقائمة الأسعار المتاحة</strong>.`;
        } else if (lastMsgText.includes('عنوان') || lastMsgText.includes('وين') || lastMsgText.includes('مكان')) {
            summary = `يستعلم الزبون عن <strong>الموقع الجغرافي وساعات العمل</strong> للصالون.`;
        } else {
            summary = `الزبون يستفسر عن خدمات الصالون ويسأل: "${customerMsgs[customerMsgs.length - 1].text.substring(0, 40)}..."`;
        }
    }
    
    summaryText.innerHTML = summary;
}

// 10. Phone Customer Simulator Layout & AI local Engine
function setupPhoneSimulator() {
    const simulatorToggle = document.getElementById('simulator-toggle');
    const simulatorSection = document.querySelector('.simulator-section');
    const simSendBtn = document.getElementById('wa-simulator-send-btn');
    const simInput = document.getElementById('wa-simulator-input');
    const simChatBody = document.getElementById('wa-simulator-chat-body');
    
    // Toggle on small screens
    simulatorToggle.addEventListener('click', () => {
        simulatorSection.classList.toggle('open');
    });
    
    // Update initial simulator avatar name
    const activeChat = state.conversations.find(c => c.id === state.activeChatId);
    if (activeChat) {
        syncPhoneSimulatorToSelectedChat(activeChat);
    }
    
    // Send Customer Simulated Message
    simSendBtn.addEventListener('click', sendSimulatedCustomerMsg);
    simInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendSimulatedCustomerMsg();
    });
    
    function sendSimulatedCustomerMsg() {
        const text = simInput.value.trim();
        if (!text) return;
        
        const activeChat = state.conversations.find(c => c.id === state.activeChatId);
        if (!activeChat) return;
        
        const time = getFormattedTime();
        const msgId = `msg-customer-${Date.now()}`;
        
        // Push message to customer state (unread if AI is disabled)
        activeChat.messages.push({
            id: msgId,
            sender: 'customer',
            text: text,
            time: time,
            read: (state.isConnected && activeChat.aiActive) // if AI is on and WhatsApp is connected, it reads it instantly
        });
        
        simInput.value = '';
        
        // If WhatsApp is connected, simulate live response
        if (state.isConnected) {
            // Update Dashboard UI instantly
            loadActiveConversation();
            renderChatsList();
            
            // Update Simulator local chat view
            appendMessageToSimulator(text, 'wa-sent', time);
            
            if (activeChat.aiActive) {
                // Show AI thinking indicator in simulator status bar and dashboard console
                showSimulatorTyping(true);
                
                if (state.aiConfig.apiKey) {
                    const systemPrompt = buildSystemInstruction();
                    const history = compileGeminiHistory(activeChat.messages);
                    
                    callGeminiAPI(systemPrompt, history, state.aiConfig.temperature)
                        .then(botReplyText => {
                            const botMsgId = `msg-bot-${Date.now()}`;
                            
                            activeChat.messages.push({
                                id: botMsgId,
                                sender: 'bot',
                                text: botReplyText,
                                time: getFormattedTime()
                            });
                            
                            showSimulatorTyping(false);
                            loadActiveConversation();
                            renderChatsList();
                            appendMessageToSimulator(botReplyText, 'wa-received', getFormattedTime());
                            incrementStat('stat-ai-replies');
                        })
                        .catch(err => {
                            console.error('Gemini API Error:', err);
                            addGlobalLog('Gemini API', `خطأ في الاتصال: ${err.message}. تم التراجع للمحاكاة المحلية.`);
                            showNotification(`خطأ في Gemini: ${err.message}. تم استخدام المحاكاة.`);
                            
                            // Fallback to local simulation
                            const botReplyText = generateLocalAIReply(text, activeChat);
                            const botMsgId = `msg-bot-${Date.now()}`;
                            
                            activeChat.messages.push({
                                id: botMsgId,
                                sender: 'bot',
                                text: botReplyText,
                                time: getFormattedTime()
                            });
                            
                            showSimulatorTyping(false);
                            loadActiveConversation();
                            renderChatsList();
                            appendMessageToSimulator(botReplyText, 'wa-received', getFormattedTime());
                            incrementStat('stat-ai-replies');
                        });
                } else {
                    const delay = 1500 + Math.random() * 1500;
                    
                    setTimeout(() => {
                        const botReplyText = generateLocalAIReply(text, activeChat);
                        const botMsgId = `msg-bot-${Date.now()}`;
                        
                        activeChat.messages.push({
                            id: botMsgId,
                            sender: 'bot',
                            text: botReplyText,
                            time: getFormattedTime()
                        });
                        
                        showSimulatorTyping(false);
                        loadActiveConversation();
                        renderChatsList();
                        appendMessageToSimulator(botReplyText, 'wa-received', getFormattedTime());
                        incrementStat('stat-ai-replies');
                    }, delay);
                }
            } else {
                // AI is offline/paused for this user. Show notifications/unread signals
                updateUnreadCount();
                showNotification(`رسالة واردة جديدة من ${activeChat.name} (الرد التلقائي متوقف)`);
            }
        } else {
            // WhatsApp is disconnected! Show message failed warning in phone
            appendMessageToSimulator(text, 'wa-sent', time);
            appendMessageToSimulator('عذراً، لم يتم إرسال الرسالة. لوحة تحكم الواتساب غير متصلة بالشبكة.', 'wa-received', time);
            
            // Delete the last pushed customer message since it failed to reach the server
            activeChat.messages.pop();
            loadActiveConversation();
            renderChatsList();
        }
    }
}

// Increment statistics visually
function incrementStat(id) {
    const el = document.getElementById(id);
    if (el) {
        let val = el.textContent;
        if (val.includes('%') || val.includes('ثانية')) return;
        let num = parseInt(val) + 1;
        el.textContent = num;
    }
}

// Append message directly to WhatsApp Phone Stream
function appendMessageToSimulator(text, type, time) {
    const body = document.getElementById('wa-simulator-chat-body');
    const bubble = document.createElement('div');
    bubble.className = `wa-bubble ${type}`;
    bubble.innerHTML = `
        <div class="wa-msg-text">${text}</div>
        <div class="wa-msg-time">${time}</div>
    `;
    body.appendChild(bubble);
    body.scrollTop = body.scrollHeight;
}

// Show/Hide typing status on phone and dashboard
function showSimulatorTyping(show) {
    const simStatus = document.getElementById('wa-bot-status-text');
    const dashboardTyping = document.getElementById('chat-typing-indicator');
    const typingBotName = document.getElementById('typing-bot-name');
    
    typingBotName.textContent = state.aiConfig.name;
    
    if (show) {
        simStatus.textContent = 'يكتب الآن...';
        simStatus.style.color = '#25d366';
        dashboardTyping.classList.remove('hidden');
    } else {
        simStatus.textContent = 'متصل';
        simStatus.style.color = 'white';
        dashboardTyping.classList.add('hidden');
    }
}

// Sync Simulator content when user clicks different chat in CRM
function syncPhoneSimulatorToSelectedChat(chat) {
    // 1. Update title
    document.querySelector('.wa-chat-info h4').textContent = state.isConnected ? state.aiConfig.name : chat.name;
    
    // 2. Clear and fill simulator messages
    const simChatBody = document.getElementById('wa-simulator-chat-body');
    simChatBody.innerHTML = '<div class="wa-date-divider">اليوم</div>';
    
    chat.messages.forEach(msg => {
        const bubbleClass = (msg.sender === 'customer') ? 'wa-sent' : 'wa-received';
        appendMessageToSimulator(msg.text, bubbleClass, msg.time);
    });
}

function syncPhoneSimulatorMessages(chat) {
    const simChatBody = document.getElementById('wa-simulator-chat-body');
    simChatBody.innerHTML = '<div class="wa-date-divider">اليوم</div>';
    
    chat.messages.forEach(msg => {
        const bubbleClass = (msg.sender === 'customer') ? 'wa-sent' : 'wa-received';
        appendMessageToSimulator(msg.text, bubbleClass, msg.time);
    });
}

// 11. Custom Local Rules-Based AI Generation Engine
// This parser reads the prompt instructions and the user FAQs database, maps matching keywords,
// and styles the response in Arabic / Dialect appropriately!
function generateLocalAIReply(userMsg, chatSession) {
    const text = userMsg.toLowerCase().trim();
    const faqs = state.aiConfig.faqs;
    const dialect = state.aiConfig.language;
    const botName = state.aiConfig.name;
    const systemPrompt = state.aiConfig.systemPrompt;
    
    // Look for matching FAQs (Keyword search)
    let bestFaqMatch = null;
    let highestScore = 0;
    
    faqs.forEach(faq => {
        const keywords = faq.question.toLowerCase().split(/[ \-\،]/);
        let score = 0;
        
        keywords.forEach(kw => {
            if (kw.length > 2 && text.includes(kw)) {
                score += 2;
            }
        });
        
        if (score > highestScore) {
            highestScore = score;
            bestFaqMatch = faq;
        }
    });
    
    // If a high-confidence FAQ matched:
    if (bestFaqMatch && highestScore >= 2) {
        return formatDialectResponse(bestFaqMatch.answer, dialect);
    }
    
    // Otherwise, simulate System Instructions / Persona response matching
    if (text.includes('مرحبا') || text.includes('هلو') || text.includes('السلام') || text.includes('صباح') || text.includes('مساء')) {
        if (dialect === 'iraqi') {
            return `أهلاً وسهلاً بيج عيني! نورتينا 🌸 وياج ${botName} لخدمتج. بشنو أكدر أساعدج اليوم؟`;
        } else if (dialect === 'english') {
            return `Hello! Welcome. This is ${botName}. How can I assist you today?`;
        } else {
            return `أهلاً وسهلاً بكِ في مركزنا! معكم ${botName} المساعد الذكي. كيف يمكنني مساعدتكم اليوم؟`;
        }
    }
    
    if (text.includes('حجز') || text.includes('موعد') || text.includes('احجز') || text.includes('باجر') || text.includes('تأكيد')) {
        if (dialect === 'iraqi') {
            return `تدللين عيني، الحجوزات متوفرة. بس يا ريت تزودينا بالاسم الثلاثي، والخدمات الي حابة تسويها (مثلاً شعر، تنظيف بشرة، أظافر) واليوم والوقت الي يناسبج حتى أثبته الج فوراً 💖`;
        } else if (dialect === 'english') {
            return `Sure, we can help with that. Please provide your full name, the service requested, and your preferred date and time to confirm your booking.`;
        } else {
            return `بالتأكيد! لتأكيد موعد الحجز، يرجى تزويدنا بالاسم الكامل، نوع الخدمة المطلوبة، واليوم والوقت المفضلين لديكم.`;
        }
    }
    
    if (text.includes('شكرا') || text.includes('فدوة') || text.includes('تسلم') || text.includes('ممنون')) {
        if (dialect === 'iraqi') {
            return `فدوة لقلبج عيني تدللين! كل الهلا بيج بالصالون بأي وقت. إذا عندج أي سؤال ثاني أنا بالخدمة 💖`;
        } else if (dialect === 'english') {
            return `You are very welcome! If you need anything else, just let me know.`;
        } else {
            return `على الرحب والسعة! يسعدنا جداً خدمتكم في أي وقت. طاب يومكم بكل خير 🌸`;
        }
    }
    
    // Fallback response according to system instructions
    if (dialect === 'iraqi') {
        return `أهلاً عيني، بخصوص سؤالج ما عندي معلومة كاملة بخصوصه حالياً. بس تكدرين تفارقينا بالتفاصيل وراح أساعدج فوراً! 🌸`;
    } else if (dialect === 'english') {
        return `I'm not fully sure about that detail, but please give me a bit more context and I will gladly assist you!`;
    } else {
        return `أهلاً بكِ، عذراً لا أملك إجابة دقيقة على هذا الاستفسار حالياً. هل يمكنكِ تزويدي بمزيد من التفاصيل لأتمكن من مساعدتكِ بشكل أفضل؟`;
    }
}

// Convert Fusha content of FAQ to Iraqi dialect if selected, for rich simulation
function formatDialectResponse(answer, dialect) {
    if (dialect !== 'iraqi') return answer;
    
    // A quick search-and-replace dictionary to convert Fusha FAQs to Iraqi dialect automatically
    let localAns = answer;
    
    localAns = localAns.replace(/لدينا/g, 'عندنا');
    localAns = localAns.replace(/تبدأ من/g, 'تبدي من');
    localAns = localAns.replace(/حسب الطول/g, 'حسب طول الشعر');
    localAns = localAns.replace(/يومياً/g, 'كل يوم');
    localAns = localAns.replace(/يرجى تزويدنا/g, 'يا ريت تنطينا');
    localAns = localAns.replace(/يفضل دائماً/g, 'أحسن شي');
    localAns = localAns.replace(/لتجنب الانتظار/g, 'حتى لا تنتظرين');
    localAns = localAns.replace(/بالنسبة لحجوزات/g, 'بخصوص حجوزات');
    localAns = localAns.replace(/يتطلب دفع/g, 'لازم تدفعين');
    localAns = localAns.replace(/لتثبيت الموعد/g, 'حتى نثبت الحجز');
    
    return localAns;
}

// 11. Real Gemini API Integration
async function callGeminiAPI(systemInstruction, history, temperature) {
    const apiKey = state.aiConfig.apiKey;
    let modelName = state.aiConfig.model;
    if (!modelName.startsWith('gemini-')) {
        modelName = 'gemini-1.5-flash';
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: history,
            systemInstruction: {
                parts: [
                    { text: systemInstruction }
                ]
            },
            generationConfig: {
                temperature: temperature,
                maxOutputTokens: 1000
            }
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
    }
    
    const result = await response.json();
    const replyText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
        throw new Error('لم يتم إرجاع أي نص من Gemini API.');
    }
    
    return replyText.trim();
}

function compileGeminiHistory(chatMessages) {
    const compiled = [];
    let lastRole = null;
    
    chatMessages.forEach(msg => {
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
    const config = state.aiConfig;
    let languageText = '';
    if (config.language === 'iraqi') {
        languageText = 'اللهجة العراقية الودية، المهذبة والمحترمة (مثل: عيني، فدوة، تدللين، كل الهلا)';
    } else if (config.language === 'english') {
        languageText = 'English';
    } else {
        languageText = 'اللغة العربية الفصحى المبسطة والمهذبة';
    }

    let faqsSection = '';
    if (config.faqs && config.faqs.length > 0) {
        faqsSection = `\n\nقاعدة بيانات الأسئلة والأجوبة المعتمدة والموثوقة (استخدمها للإجابة بدقة متناهية ولا تؤلف معلومات غير موجودة فيها):\n` +
            config.faqs.map((faq, index) => `${index + 1}. [الموضوع]: ${faq.question}\n   [الإجابة الرسمية المعتمدة]: ${faq.answer}`).join('\n\n');
    }

    return `${config.systemPrompt}

اللغة واللهجة المطلوب التحدث بها: ${languageText}.${faqsSection}

ملاحظات هامة جداً:
1. التزم بشخصية المساعد المحددة في التعليمات ولا تخرج عنها.
2. لا تذكر للزبون أنك نموذج لغوي أو ذكاء اصطناعي إلا إذا سألك مباشرة، وتصرف دائماً كمساعد حقيقي للنشاط التجاري.
3. التزم بالأسعار والتفاصيل المتوفرة في قاعدة البيانات أعلاه فقط.
4. أجب باختصار وبشكل ودود ومباشر يناسب محادثات واتساب (تجنب الإجابات الطويلة جداً التي لا داعي لها).`;
}

// 12. Notification helper
function showNotification(text) {
    // Create floating glass notification
    const alertBox = document.createElement('div');
    alertBox.style.position = 'fixed';
    alertBox.style.bottom = '20px';
    alertBox.style.right = '20px';
    alertBox.style.background = 'rgba(17, 25, 40, 0.9)';
    alertBox.style.border = '1px solid var(--primary)';
    alertBox.style.borderRadius = '12px';
    alertBox.style.padding = '14px 20px';
    alertBox.style.color = '#fff';
    alertBox.style.fontFamily = 'var(--font-ar)';
    alertBox.style.fontSize = '13.5px';
    alertBox.style.zIndex = '9999';
    alertBox.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    alertBox.style.display = 'flex';
    alertBox.style.alignItems = 'center';
    alertBox.style.gap = '10px';
    alertBox.style.backdropFilter = 'blur(10px)';
    alertBox.style.animation = 'slideInNotification 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    
    alertBox.innerHTML = `
        <i class="ri-checkbox-circle-fill" style="color: var(--primary); font-size: 20px;"></i>
        <span>${text}</span>
    `;
    
    document.body.appendChild(alertBox);
    
    setTimeout(() => {
        alertBox.style.opacity = '0';
        alertBox.style.transform = 'translateY(10px)';
        alertBox.style.transition = 'all 0.3s';
        setTimeout(() => alertBox.remove(), 300);
    }, 4000);
}

// Style for notification slide in
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes slideInNotification {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
`;
document.head.appendChild(styleSheet);

// 13. Render Charts (Chart.js)
function renderCharts() {
    const messagesCtx = document.getElementById('messagesChart').getContext('2d');
    const categoriesCtx = document.getElementById('categoriesChart').getContext('2d');
    
    // Chart 1: Line Chart
    state.messagesChart = new Chart(messagesCtx, {
        type: 'line',
        data: {
            labels: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
            datasets: [{
                label: 'الرسائل الواردة',
                data: [45, 62, 55, 84, 95, 120, 75],
                borderColor: '#10b981',
                borderWidth: 3,
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointRadius: 4
            }, {
                label: 'الردود التلقائية (AI)',
                data: [35, 50, 48, 70, 85, 105, 68],
                borderColor: '#8b5cf6',
                borderWidth: 2,
                borderDash: [5, 5],
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.4,
                pointBackgroundColor: '#8b5cf6',
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    rtl: true,
                    labels: {
                        color: '#d1d5db',
                        font: { family: 'Cairo', size: 11 }
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#9ca3af', font: { family: 'Cairo', size: 10 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af', font: { family: 'Cairo', size: 11 } }
                }
            }
        }
    });
    
    // Chart 2: Doughnut Chart
    state.categoriesChart = new Chart(categoriesCtx, {
        type: 'doughnut',
        data: {
            labels: ['حجوزات مواعيد', 'استفسار أسعار', 'موقع وعناوين', 'أخرى'],
            datasets: [{
                data: [55, 25, 12, 8],
                backgroundColor: [
                    '#10b981', // green
                    '#8b5cf6', // purple
                    '#3b82f6', // blue
                    'rgba(255, 255, 255, 0.1)' // gray
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    rtl: true,
                    labels: {
                        color: '#d1d5db',
                        font: { family: 'Cairo', size: 11 },
                        padding: 15
                    }
                }
            }
        }
    });
}

function addGlobalLog(source, text) {
    const logsList = document.getElementById('connection-logs-list');
    if (logsList) {
        const item = document.createElement('div');
        item.className = 'log-item';
        item.innerHTML = `
            <span class="log-time">${getFormattedTime()}</span>
            <span class="log-text"><strong>[${source}]</strong> ${text}</span>
        `;
        logsList.appendChild(item);
        logsList.scrollTop = logsList.scrollHeight;
    }
}
