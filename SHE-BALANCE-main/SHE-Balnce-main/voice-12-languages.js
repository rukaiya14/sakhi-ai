/**
 * Voice Assistant - 12 Indian Languages Support
 * Supports: English + Hindi, Bengali, Marathi, Tamil, Telugu, Kannada, Malayalam, Gujarati, Punjabi, Odia, Assamese
 */

// Language keywords for command recognition - ALL SIDEBAR ITEMS
const LANGUAGE_KEYWORDS = {
    dashboard: {
        en: ['dashboard', 'home', 'main'],
        hi: ['डैशबोर्ड', 'होम', 'मुख्य'],
        ta: ['டாஷ்போர்டு', 'முகப்பு'],
        te: ['డాష్‌బోర్డ్', 'హోమ్']
    },
    aisakhi: {
        en: ['ai', 'sakhi', 'assistant', 'help', 'support'],
        hi: ['एआई', 'सखी', 'सहायक', 'मदद'],
        ta: ['ஏஐ', 'சகி', 'உதவியாளர்'],
        te: ['ఏఐ', 'సఖి', 'సహాయకుడు']
    },
    skills: {
        en: ['skill', 'skills', 'my skills', 'abilities'],
        hi: ['कौशल', 'हुनर', 'मेरे कौशल', 'स्किल'],
        ta: ['திறன்', 'என் திறன்கள்'],
        te: ['నైపుణ్యాలు', 'నా నైపుణ్యాలు']
    },
    opportunities: {
        en: ['opportunity', 'opportunities', 'job', 'jobs', 'work'],
        hi: ['अवसर', 'नौकरी', 'काम', 'रोजगार', 'जॉब'],
        ta: ['வாய்ப்பு', 'வேலை'],
        te: ['అవకాశం', 'ఉద్యోగం', 'పని']
    },
    food: {
        en: ['food', 'marketplace', 'market', 'chef', 'cooking'],
        hi: ['खाना', 'भोजन', 'बाजार', 'फूड'],
        ta: ['உணவு', 'சந்தை'],
        te: ['ఆహారం', 'మార్కెట్']
    },
    artisan: {
        en: ['artisan', 'marketplace', 'craft', 'handicraft'],
        hi: ['कारीगर', 'शिल्पकार', 'बाजार'],
        ta: ['கைவினைஞர்', 'கைவினை'],
        te: ['హస్తకళాకారుడు', 'హస్తకళ']
    },
    addproduct: {
        en: ['add', 'product', 'new product', 'upload', 'sell'],
        hi: ['जोड़ें', 'उत्पाद', 'नया', 'बेचें'],
        ta: ['சேர்', 'தயாரிப்பு'],
        te: ['జోడించు', 'ఉత్పత్తి']
    },
    community: {
        en: ['community', 'group', 'social', 'network'],
        hi: ['समुदाय', 'समूह', 'सामाजिक'],
        ta: ['சமூகம்', 'குழு'],
        te: ['సమాజం', 'సమూహం']
    },
    resource: {
        en: ['resource', 'circularity', 'recycle', 'reuse'],
        hi: ['संसाधन', 'पुनर्चक्रण', 'रीसायकल'],
        ta: ['வளம்', 'மறுசுழற்சி'],
        te: ['వనరు', 'రీసైకిల్']
    },
    invisible: {
        en: ['invisible', 'labor', 'labour', 'work', 'time'],
        hi: ['अदृश्य', 'श्रम', 'काम', 'समय'],
        ta: ['கண்ணுக்கு தெரியாத', 'உழைப்பு'],
        te: ['అదృశ్య', 'శ్రమ']
    },
    virtual: {
        en: ['virtual', 'factory', 'manufacturing'],
        hi: ['वर्चुअल', 'फैक्ट्री', 'कारखाना'],
        ta: ['மெய்நிகர்', 'தொழிற்சாலை'],
        te: ['వర్చువల్', 'ఫ్యాక్టరీ']
    },
    progress: {
        en: ['progress', 'growth', 'development', 'track'],
        hi: ['प्रगति', 'विकास', 'प्रोग्रेस'],
        ta: ['முன்னேற்றம்', 'வளர்ச்சி'],
        te: ['పురోగతి', 'అభివృద్ధి']
    },
    settings: {
        en: ['settings', 'setting', 'preferences', 'config'],
        hi: ['सेटिंग्स', 'सेटिंग', 'विकल्प'],
        ta: ['அமைப்புகள்'],
        te: ['సెట్టింగ్‌లు']
    },
    earnings: {
        en: ['earning', 'earnings', 'income', 'money', 'balance'],
        hi: ['कमाई', 'आय', 'पैसा', 'अर्निंग', 'इनकम'],
        ta: ['வருமானம்', 'பணம்'],
        te: ['ఆదాయం', 'డబ్బు']
    },
    learning: {
        en: ['learning', 'learn', 'mentor', 'training', 'course'],
        hi: ['सीखना', 'शिक्षा', 'लर्निंग'],
        ta: ['கற்றல்', 'கல்வி'],
        te: ['నేర్చుకోవడం', 'విద్య']
    }
};

// Check if command matches any keyword - MORE FLEXIBLE
function matchesKeywords(cmd, category) {
    // Normalize the command - remove spaces, special chars
    const normalized = cmd.toLowerCase().replace(/[^\w\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]/g, '');
    
    for (const lang in LANGUAGE_KEYWORDS[category]) {
        for (const keyword of LANGUAGE_KEYWORDS[category][lang]) {
            const normalizedKeyword = keyword.toLowerCase().replace(/[^\w\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]/g, '');
            
            // Check if keyword is in command
            if (normalized.includes(normalizedKeyword) || cmd.includes(keyword.toLowerCase())) {
                console.log(`✅ Matched "${keyword}" in category "${category}"`);
                return true;
            }
        }
    }
    return false;
}

class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 
                              localStorage.getItem('shebalance_language') || 'en';
        this.apiBaseUrl = 'http://localhost:5000/api';
        
        this.initSpeechRecognition();
        this.watchLanguageChanges();
        console.log('🎙️ Voice Assistant initialized - 12 Languages');
        console.log('📍 Current language:', this.currentLanguage);
    }
    
    watchLanguageChanges() {
        // Watch for language changes in localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'selectedLanguage' || e.key === 'shebalance_language') {
                this.currentLanguage = e.newValue || 'en';
                if (this.recognition) {
                    this.recognition.lang = this.getLanguageCode();
                    console.log('🔄 Language changed to:', this.currentLanguage);
                }
            }
        });
        
        // Also check periodically
        setInterval(() => {
            const newLang = localStorage.getItem('selectedLanguage') || 
                           localStorage.getItem('shebalance_language');
            if (newLang && newLang !== this.currentLanguage) {
                this.currentLanguage = newLang;
                if (this.recognition) {
                    this.recognition.lang = this.getLanguageCode();
                    console.log('🔄 Language updated to:', this.currentLanguage);
                }
            }
        }, 1000);
    }
    
    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('❌ Speech recognition not supported');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 3; // Get multiple alternatives
        
        // Set to auto-detect or use current language
        const langCode = this.getLanguageCode();
        this.recognition.lang = langCode;
        console.log('🌐 Recognition language set to:', langCode);
        
        this.recognition.onstart = () => {
            console.log('🎤 Listening...');
            this.updateUI('listening');
        };
        
        this.recognition.onresult = (event) => {
            // Try all alternatives
            let transcript = '';
            for (let i = 0; i < event.results[0].length; i++) {
                const alternative = event.results[0][i].transcript;
                console.log(`Alternative ${i + 1}:`, alternative);
                if (i === 0) transcript = alternative;
            }
            
            console.log('✅ Heard:', transcript);
            console.log('🔍 Checking keywords...');
            
            // Test keyword matching
            const cmd = transcript.toLowerCase().trim();
            console.log('📝 Lowercase command:', cmd);
            console.log('💼 Jobs match?', matchesKeywords(cmd, 'jobs'));
            console.log('💰 Earnings match?', matchesKeywords(cmd, 'earnings'));
            console.log('🍽️ Food match?', matchesKeywords(cmd, 'food'));
            
            this.processCommand(transcript);
        };
        
        this.recognition.onerror = (event) => {
            console.error('❌ Error:', event.error);
            let errorMessage = 'Sorry, I could not understand that';
            
            if (event.error === 'no-speech') {
                errorMessage = 'No speech detected. Please try again.';
            } else if (event.error === 'not-allowed') {
                errorMessage = 'Microphone access denied. Please allow microphone in browser settings.';
            } else if (event.error === 'network') {
                errorMessage = 'Network error. Please check connection.';
            } else if (event.error === 'language-not-supported') {
                errorMessage = 'Language not supported. Trying English...';
                // Fallback to English
                this.currentLanguage = 'en';
                this.recognition.lang = 'en-US';
            }
            
            this.updateUI('error', errorMessage);
            this.isListening = false;
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
        };
    }
    
    startListening() {
        if (!this.recognition) {
            alert('Speech recognition not supported. Use Chrome or Edge.');
            return;
        }
        
        if (this.isListening) {
            this.stopListening();
            return;
        }
        
        try {
            // Update language from localStorage before starting
            this.currentLanguage = localStorage.getItem('selectedLanguage') || 
                                  localStorage.getItem('shebalance_language') || 
                                  this.currentLanguage;
            
            const langCode = this.getLanguageCode();
            this.recognition.lang = langCode;
            
            console.log('🎤 Starting recognition with language:', langCode);
            
            this.recognition.start();
            this.isListening = true;
        } catch (error) {
            console.error('❌ Start error:', error);
            this.updateUI('error', 'Could not start listening. Please try again.');
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    
    async processCommand(transcript) {
        const cmd = transcript.toLowerCase().trim();
        console.log('🤖 Processing:', cmd);
        console.log('⚡ Instant execution mode - no delays!');
        
        let response = '';
        let action = null;
        let actionName = '';
        
        // Check command category using keyword matching
        if (matchesKeywords(cmd, 'earnings')) {
            console.log('✅ MATCHED: Earnings');
            actionName = 'Scroll to Earnings';
            response = this.getResponse('earnings');
            action = () => {
                console.log('📍 Scrolling to earnings section...');
                const earningsSection = document.getElementById('earnings');
                if (earningsSection) {
                    earningsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    console.log('✅ Scrolled to earnings!');
                } else {
                    console.log('📍 No earnings section, staying on dashboard');
                }
            };
        }
        else if (matchesKeywords(cmd, 'dashboard')) {
            console.log('✅ MATCHED: Dashboard');
            actionName = 'Open Dashboard';
            response = 'Opening Dashboard';
            action = () => window.location.href = 'dashboard.html';
        }
        else if (matchesKeywords(cmd, 'aisakhi')) {
            console.log('✅ MATCHED: AI Sakhi');
            actionName = 'Open AI Sakhi';
            response = 'Opening AI Sakhi Assistant';
            action = () => {
                if (typeof openAISakhi === 'function') {
                    openAISakhi();
                } else {
                    const panel = document.getElementById('aiSakhiPanel');
                    const overlay = document.getElementById('aiSakhiOverlay');
                    if (panel && overlay) {
                        panel.classList.add('active');
                        overlay.classList.add('active');
                    }
                }
            };
        }
        else if (matchesKeywords(cmd, 'skills')) {
            console.log('✅ MATCHED: Skills');
            actionName = 'Open Skills';
            response = 'Opening My Skills';
            action = () => window.location.href = 'skills.html';
        }
        else if (matchesKeywords(cmd, 'opportunities')) {
            console.log('✅ MATCHED: Opportunities');
            actionName = 'Open Opportunities';
            response = this.getResponse('jobs');
            action = () => window.location.href = 'opportunities.html';
        }
        else if (matchesKeywords(cmd, 'food')) {
            console.log('✅ MATCHED: Food');
            actionName = 'Open Food Marketplace';
            response = this.getResponse('food');
            action = () => window.location.href = 'food-marketplace.html';
        }
        else if (matchesKeywords(cmd, 'artisan')) {
            console.log('✅ MATCHED: Artisan');
            actionName = 'Open Artisan Marketplace';
            response = 'Opening Artisan Marketplace';
            action = () => window.location.href = 'artisan-marketplace.html';
        }
        else if (matchesKeywords(cmd, 'addproduct')) {
            console.log('✅ MATCHED: Add Product');
            actionName = 'Add Product';
            response = 'Opening Add Product';
            action = () => window.location.href = 'artisan-marketplace.html#add-product';
        }
        else if (matchesKeywords(cmd, 'community')) {
            console.log('✅ MATCHED: Community');
            actionName = 'Open Community';
            response = 'Opening Community';
            action = () => window.location.href = 'community.html';
        }
        else if (matchesKeywords(cmd, 'resource')) {
            console.log('✅ MATCHED: Resource Circularity');
            actionName = 'Open Resource Circularity';
            response = 'Opening Resource Circularity';
            action = () => window.location.href = 'resource-circularity.html';
        }
        else if (matchesKeywords(cmd, 'invisible')) {
            console.log('✅ MATCHED: Invisible Labor');
            actionName = 'Open Invisible Labor';
            response = 'Opening Invisible Labor';
            action = () => window.location.href = 'invisible-labor.html';
        }
        else if (matchesKeywords(cmd, 'virtual')) {
            console.log('✅ MATCHED: Virtual Factory');
            actionName = 'Open Virtual Factory';
            response = 'Opening Virtual Factory';
            action = () => window.location.href = 'virtual-factory.html';
        }
        else if (matchesKeywords(cmd, 'progress')) {
            console.log('✅ MATCHED: Progress');
            actionName = 'Open Progress';
            response = this.getResponse('progress');
            action = () => window.location.href = 'progress.html';
        }
        else if (matchesKeywords(cmd, 'settings')) {
            console.log('✅ MATCHED: Settings');
            actionName = 'Open Settings';
            response = 'Opening Settings';
            action = () => window.location.href = 'settings.html';
        }
        else if (matchesKeywords(cmd, 'learning')) {
            console.log('✅ MATCHED: Learning');
            actionName = 'Open Learning';
            response = this.getResponse('learning');
            action = () => window.location.href = 'skills.html';
        }
        else {
            console.log('❌ NO MATCH FOUND');
            response = this.getResponse('unknown');
        }
        
        // Execute action IMMEDIATELY - no delays!
        if (action) {
            console.log('⚡ INSTANT EXECUTION!');
            console.log('📍 Command:', transcript);
            console.log('🎯 Action:', actionName);
            console.log('🚀 Executing NOW...');
            
            // Stop listening immediately
            this.stopListening();
            
            // Close modal FIRST
            const modal = document.getElementById('voiceModal');
            if (modal) {
                modal.style.display = 'none';
                console.log('✅ Modal closed');
            }
            
            // Execute action RIGHT NOW (no setTimeout!)
            try {
                console.log('🔥 Executing action...');
                action();
                console.log('✅ Action executed successfully!');
            } catch (error) {
                console.error('❌ Action execution error:', error);
            }
            
            // Speak response in background (non-blocking, no await)
            this.speak(response).catch(err => console.log('Speech error:', err));
            
            return; // Exit immediately
        }
        
        // No action found - show message
        console.log('⚠️ No action to execute');
        this.updateUI('error', response);
        await this.speak(response);
        setTimeout(() => this.closeModal(), 2000);
    }
    
    getResponse(category) {
        const responses = {
            earnings: {
                en: 'Showing your earnings',
                hi: 'आपकी कमाई दिखा रहे हैं',
                bn: 'আপনার আয় দেখাচ্ছি',
                mr: 'तुमची कमाई दाखवत आहे',
                ta: 'உங்கள் வருமானத்தைக் காட்டுகிறது',
                te: 'మీ ఆదాయాన్ని చూపిస్తోంది',
                kn: 'ನಿಮ್ಮ ಆದಾಯವನ್ನು ತೋರಿಸುತ್ತಿದೆ',
                ml: 'നിങ്ങളുടെ വരുമാനം കാണിക്കുന്നു',
                gu: 'તમારી આવક બતાવી રહ્યા છીએ',
                pa: 'ਤੁਹਾਡੀ ਆਮਦਨ ਦਿਖਾ ਰਹੇ ਹਾਂ',
                or: 'ଆପଣଙ୍କ ଆୟ ଦେଖାଉଛି',
                as: 'আপোনাৰ উপাৰ্জন দেখুৱাইছো'
            },
            jobs: {
                en: 'Finding new opportunities',
                hi: 'नए अवसर खोज रहे हैं',
                bn: 'নতুন সুযোগ খুঁজছি',
                mr: 'नवीन संधी शोधत आहे',
                ta: 'புதிய வாய்ப்புகளைக் கண்டுபிடிக்கிறது',
                te: 'కొత్త అవకాశాలను కనుగొంటోంది',
                kn: 'ಹೊಸ ಅವಕಾಶಗಳನ್ನು ಹುಡುಕುತ್ತಿದೆ',
                ml: 'പുതിയ അവസരങ്ങൾ കണ്ടെത്തുന്നു',
                gu: 'નવી તકો શોધી રહ્યા છીએ',
                pa: 'ਨਵੇਂ ਮੌਕੇ ਲੱਭ ਰਹੇ ਹਾਂ',
                or: 'ନୂତନ ସୁଯୋଗ ଖୋଜୁଛି',
                as: 'নতুন সুযোগ বিচাৰি আছো'
            },
            food: {
                en: 'Opening food marketplace',
                hi: 'फूड मार्केटप्लेस खोल रहे हैं',
                bn: 'খাদ্য বাজার খুলছি',
                mr: 'अन्न बाजार उघडत आहे',
                ta: 'உணவு சந்தையைத் திறக்கிறது',
                te: 'ఆహార మార్కెట్‌ను తెరుస్తోంది',
                kn: 'ಆಹಾರ ಮಾರುಕಟ್ಟೆಯನ್ನು ತೆರೆಯುತ್ತಿದೆ',
                ml: 'ഭക്ഷണ മാർക്കറ്റ് തുറക്കുന്നു',
                gu: 'ખોરાક બજાર ખોલી રહ્યા છીએ',
                pa: 'ਖਾਣੇ ਦਾ ਬਾਜ਼ਾਰ ਖੋਲ੍ਹ ਰਹੇ ਹਾਂ',
                or: 'ଖାଦ୍ୟ ବଜାର ଖୋଲୁଛି',
                as: 'খাদ্য বজাৰ খুলিছো'
            },
            progress: {
                en: 'Showing your progress',
                hi: 'आपकी प्रगति दिखा रहे हैं',
                bn: 'আপনার অগ্রগতি দেখাচ্ছি',
                mr: 'तुमची प्रगती दाखवत आहे',
                ta: 'உங்கள் முன்னேற்றத்தைக் காட்டுகிறது',
                te: 'మీ పురోగతిని చూపిస్తోంది',
                kn: 'ನಿಮ್ಮ ಪ್ರಗತಿಯನ್ನು ತೋರಿಸುತ್ತಿದೆ',
                ml: 'നിങ്ങളുടെ പുരോഗതി കാണിക്കുന്നു',
                gu: 'તમારી પ્રગતિ બતાવી રહ્યા છીએ',
                pa: 'ਤੁਹਾਡੀ ਤਰੱਕੀ ਦਿਖਾ ਰਹੇ ਹਾਂ',
                or: 'ଆପଣଙ୍କ ପ୍ରଗତି ଦେଖାଉଛି',
                as: 'আপোনাৰ প্ৰগতি দেখুৱাইছো'
            },
            learning: {
                en: 'Opening AI Learning Mentor',
                hi: 'एआई लर्निंग मेंटर खोल रहे हैं',
                bn: 'এআই লার্নিং মেন্টর খুলছি',
                mr: 'एआय लर्निंग मेंटर उघडत आहे',
                ta: 'AI கற்றல் வழிகாட்டியைத் திறக்கிறது',
                te: 'AI లెర్నింగ్ మెంటార్‌ను తెరుస్తోంది',
                kn: 'AI ಕಲಿಕೆ ಮಾರ್ಗದರ್ಶಕವನ್ನು ತೆರೆಯುತ್ತಿದೆ',
                ml: 'AI പഠന ഉപദേഷ്ടാവ് തുറക്കുന്നു',
                gu: 'AI લર્નિંગ મેન્ટર ખોલી રહ્યા છીએ',
                pa: 'AI ਸਿੱਖਣ ਸਲਾਹਕਾਰ ਖੋਲ੍ਹ ਰਹੇ ਹਾਂ',
                or: 'AI ଶିକ୍ଷା ପରାମର୍ଶଦାତା ଖୋଲୁଛି',
                as: 'AI শিক্ষা পৰামৰ্শদাতা খুলিছো'
            },
            help: {
                en: 'Opening AI Sakhi Assistant',
                hi: 'एआई सखी सहायक खोल रहे हैं',
                bn: 'এআই সখী সহায়ক খুলছি',
                mr: 'एआय सखी साहाय्यक उघडत आहे',
                ta: 'AI சகி உதவியாளரைத் திறக்கிறது',
                te: 'AI సఖి సహాయకుడిని తెరుస్తోంది',
                kn: 'AI ಸಖಿ ಸಹಾಯಕವನ್ನು ತೆರೆಯುತ್ತಿದೆ',
                ml: 'AI സഖി സഹായി തുറക്കുന്നു',
                gu: 'AI સખી સહાયક ખોલી રહ્યા છીએ',
                pa: 'AI ਸਖੀ ਸਹਾਇਕ ਖੋਲ੍ਹ ਰਹੇ ਹਾਂ',
                or: 'AI ସଖୀ ସହାୟକ ଖୋଲୁଛି',
                as: 'AI সখী সহায়ক খুলিছো'
            },
            unknown: {
                en: 'I can help with earnings, jobs, food, progress, learning, or assistance',
                hi: 'मैं कमाई, नौकरी, खाना, प्रगति, सीखने या सहायता में मदद कर सकती हूं',
                bn: 'আমি আয়, চাকরি, খাবার, অগ্রগতি, শেখা বা সাহায্যে সহায়তা করতে পারি',
                mr: 'मी कमाई, नोकरी, अन्न, प्रगती, शिकणे किंवा मदतीसाठी मदत करू शकते',
                ta: 'நான் வருமானம், வேலை, உணவு, முன்னேற்றம், கற்றல் அல்லது உதவியில் உதவ முடியும்',
                te: 'నేను ఆదాయం, ఉద్యోగం, ఆహారం, పురోగతి, నేర్చుకోవడం లేదా సహాయంలో సహాయం చేయగలను',
                kn: 'ನಾನು ಆದಾಯ, ಉದ್ಯೋಗ, ಆಹಾರ, ಪ್ರಗತಿ, ಕಲಿಕೆ ಅಥವಾ ಸಹಾಯದಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಹುದು',
                ml: 'എനിക്ക് വരുമാനം, ജോലി, ഭക്ഷണം, പുരോഗതി, പഠനം അല്ലെങ്കിൽ സഹായത്തിൽ സഹായിക്കാം',
                gu: 'હું આવક, નોકરી, ખોરાક, પ્રગતિ, શીખવા અથવા સહાયમાં મદદ કરી શકું છું',
                pa: 'ਮੈਂ ਆਮਦਨ, ਨੌਕਰੀ, ਖਾਣਾ, ਤਰੱਕੀ, ਸਿੱਖਣ ਜਾਂ ਸਹਾਇਤਾ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ',
                or: 'ମୁଁ ଆୟ, ଚାକିରି, ଖାଦ୍ୟ, ପ୍ରଗତି, ଶିକ୍ଷା କିମ୍ବା ସାହାଯ୍ୟରେ ସାହାଯ୍ୟ କରିପାରିବି',
                as: 'মই উপাৰ্জন, চাকৰি, খাদ্য, প্ৰগতি, শিকা বা সহায়ত সহায় কৰিব পাৰো'
            }
        };
        
        return responses[category][this.currentLanguage] || responses[category]['en'];
    }
    
    async speak(text) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/voice/speak`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text, language: this.currentLanguage })
            });
            
            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play();
                audio.onended = () => URL.revokeObjectURL(audioUrl);
                return;
            }
        } catch (error) {
            console.log('⚠️ AWS Polly not available, using browser speech');
        }
        
        this.speakBrowser(text);
    }
    
    speakBrowser(text) {
        this.synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.getLanguageCode();
        utterance.rate = 0.9;
        this.synthesis.speak(utterance);
    }
    
    getLanguageCode() {
        // Get language from selector or localStorage
        const storedLang = localStorage.getItem('selectedLanguage') || 
                          localStorage.getItem('shebalance_language') || 
                          this.currentLanguage;
        
        const languageMap = {
            'en': 'en-US',
            'en-IN': 'en-IN',
            'hi': 'hi-IN',
            'hi-IN': 'hi-IN',
            'bn': 'bn-IN',
            'bn-IN': 'bn-IN',
            'mr': 'mr-IN',
            'mr-IN': 'mr-IN',
            'ta': 'ta-IN',
            'ta-IN': 'ta-IN',
            'te': 'te-IN',
            'te-IN': 'te-IN',
            'kn': 'kn-IN',
            'kn-IN': 'kn-IN',
            'ml': 'ml-IN',
            'ml-IN': 'ml-IN',
            'gu': 'gu-IN',
            'gu-IN': 'gu-IN',
            'pa': 'pa-IN',
            'pa-IN': 'pa-IN',
            'or': 'or-IN',
            'or-IN': 'or-IN',
            'as': 'as-IN',
            'as-IN': 'as-IN'
        };
        
        // Extract language code (remove -IN if present)
        const langCode = storedLang.split('-')[0];
        const fullCode = languageMap[storedLang] || languageMap[langCode] || 'en-US';
        
        console.log('🌐 Language mapping:', storedLang, '→', fullCode);
        return fullCode;
    }
    
    closeModal() {
        const modal = document.getElementById('voiceModal');
        if (modal) modal.style.display = 'none';
        this.stopListening();
    }
    
    updateUI(state, message = '') {
        const statusEl = document.getElementById('voiceStatus');
        const btnEl = document.getElementById('voiceBtn');
        const animationEl = document.querySelector('.voice-animation');
        
        if (!statusEl || !btnEl) return;
        
        if (state === 'listening') {
            statusEl.textContent = '🎤 Listening... Speak now';
            statusEl.style.background = '#ffebee';
            statusEl.style.color = '#f44336';
            btnEl.innerHTML = '<i class="fas fa-stop"></i><span>Stop</span>';
            btnEl.classList.add('recording');
            if (animationEl) animationEl.classList.add('active');
        }
        else if (state === 'processing') {
            statusEl.textContent = `Processing: "${message}"`;
            statusEl.style.background = '#fff3e0';
            statusEl.style.color = '#ff9800';
            btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processing</span>';
            btnEl.classList.remove('recording');
            if (animationEl) animationEl.classList.remove('active');
        }
        else if (state === 'success') {
            statusEl.textContent = `✅ ${message}`;
            statusEl.style.background = '#e8f5e9';
            statusEl.style.color = '#4caf50';
            btnEl.innerHTML = '<i class="fas fa-check"></i><span>Done!</span>';
            if (animationEl) animationEl.classList.remove('active');
        }
        else if (state === 'error') {
            statusEl.textContent = `❌ ${message}`;
            statusEl.style.background = '#ffebee';
            statusEl.style.color = '#f44336';
            btnEl.innerHTML = '<i class="fas fa-microphone"></i><span>Try Again</span>';
            btnEl.classList.remove('recording');
            if (animationEl) animationEl.classList.remove('active');
        }
        else {
            statusEl.textContent = 'Click "Start Listening" and speak';
            statusEl.style.background = '#f5f5f5';
            statusEl.style.color = '#666';
            btnEl.innerHTML = '<i class="fas fa-microphone"></i><span>Start Listening</span>';
            btnEl.classList.remove('recording');
            if (animationEl) animationEl.classList.remove('active');
        }
    }
}

// Global instance
let voiceAssistant = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Initializing 12-Language Voice Assistant...');
    voiceAssistant = new VoiceAssistant();
});

function startVoiceCommand() {
    const modal = document.getElementById('voiceModal');
    if (modal) modal.style.display = 'block';
}

function closeVoiceModal() {
    if (voiceAssistant) voiceAssistant.closeModal();
}

function toggleVoice() {
    if (!voiceAssistant) {
        voiceAssistant = new VoiceAssistant();
        setTimeout(toggleVoice, 500);
        return;
    }
    
    if (voiceAssistant.isListening) {
        voiceAssistant.stopListening();
    } else {
        voiceAssistant.startListening();
    }
}

window.voiceAssistant = voiceAssistant;
window.startVoiceCommand = startVoiceCommand;
window.closeVoiceModal = closeVoiceModal;
window.toggleVoice = toggleVoice;

console.log('✅ 12-Language Voice Assistant loaded');
