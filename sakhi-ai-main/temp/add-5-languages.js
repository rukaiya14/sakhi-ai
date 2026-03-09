const fs = require('fs');

// Read the current file
const filePath = 'SHE-BALANCE-main/SHE-Balnce-main/translations-working.js';
let content = fs.readFileSync(filePath, 'utf8');

// Find the position to insert (before 'en-IN')
const insertPosition = content.indexOf("    'en-IN': {");

if (insertPosition === -1) {
    console.error('Could not find en-IN section');
    process.exit(1);
}

// Kannada translations
const kannada = `
    'kn-IN': {
        sheBalance: 'ಶೀಬ್ಯಾಲೆನ್ಸ್', newBadge: 'ಹೊಸ', greeting: 'ನಮಸ್ಕಾರ', logout: 'ಲಾಗ್ಔಟ್',
        dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', aiSakhi: 'AI ಸಖಿ ಸಹಾಯಕ', aiLearningMentor: 'ನಿಮ್ಮ AI ಕಲಿಕೆ ಮಾರ್ಗದರ್ಶಿ',
        aiLearningMentorDesc: 'ವೈಯಕ್ತಿಕ ಕಲಿಕೆ ರೋಡ್‌ಮ್ಯಾಪ್ ಮತ್ತು ವೃತ್ತಿ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ',
        mySkills: 'ನನ್ನ ಕೌಶಲ್ಯಗಳು', opportunities: 'ಅವಕಾಶಗಳು',
        foodMarketplace: 'ಆಹಾರ ಮಾರುಕಟ್ಟೆ', artisanMarketplace: 'ಕುಶಲಕರ್ಮಿ ಮಾರುಕಟ್ಟೆ',
        addProduct: 'ಉತ್ಪನ್ನ ಸೇರಿಸಿ', community: 'ಸಮುದಾಯ',
        resourceCircularity: 'ಸಂಪನ್ಮೂಲ ಚಕ್ರೀಯತೆ', invisibleLabor: 'ಅದೃಶ್ಯ ಶ್ರಮ',
        virtualFactory: 'ವರ್ಚುವಲ್ ಕಾರ್ಖಾನೆ', progress: 'ಪ್ರಗತಿ', settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
        voiceCommand: 'ಧ್ವನಿ ಆಜ್ಞೆ', clickToEdit: '(ಸಂಪಾದಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ)',
