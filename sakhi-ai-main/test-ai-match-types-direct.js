// Direct test of AI Match Types function
const virtualFactory = require('../SHE-BALANCE-main/SHE-Balnce-main/backend/virtual-factory-titan');

const testOrder = {
    product: "Hand-Embroidered Table Runners",
    quantity: 500,
    skills: ["embroidery", "tailoring"],
    deadline: 45,
    budget: 1250000,
    company: "Taj Hotels"
};

console.log('Testing AI Match Types function...');
console.log('Order:', testOrder);
console.log('');

virtualFactory.getAIMatchTypes(testOrder)
    .then(result => {
        console.log('✅ SUCCESS!');
        console.log('Result:', JSON.stringify(result, null, 2));
    })
    .catch(error => {
        console.error('❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
    });
