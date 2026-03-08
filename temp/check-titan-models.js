// Check available Titan models
const { BedrockClient, ListFoundationModelsCommand } = require("@aws-sdk/client-bedrock");

async function checkTitanModels() {
    const client = new BedrockClient({ region: 'us-east-1' });
    
    try {
        const command = new ListFoundationModelsCommand({
            byProvider: 'Amazon'
        });
        
        const response = await client.send(command);
        
        console.log('\n=== Available Amazon Titan Models ===\n');
        
        response.modelSummaries
            .filter(model => model.modelId.includes('titan-text'))
            .forEach(model => {
                console.log(`Model ID: ${model.modelId}`);
                console.log(`Model Name: ${model.modelName}`);
                console.log(`Status: ${model.modelLifecycle?.status || 'ACTIVE'}`);
                console.log('---');
            });
            
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkTitanModels();
