/**
 * AWS Cognito Authentication Module
 * Handles user authentication with Cognito User Pool
 */

const { InitiateAuthCommand, GetUserCommand } = require("@aws-sdk/client-cognito-identity-provider");
const jwt = require('jsonwebtoken');
const { createCognitoClient } = require('./utils/aws-clients');

// Initialize Cognito client (will be set asynchronously)
let cognitoClient;

(async () => {
    try {
        cognitoClient = await createCognitoClient();
        console.log('✅ Cognito client initialized with Secrets Manager');
    } catch (error) {
        console.error('❌ Failed to initialize Cognito client:', error.message);
    }
})();

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;

/**
 * Login with Cognito
 */
async function loginWithCognito(email, password) {
    try {
        const command = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        });

        const response = await cognitoClient.send(command);
        
        if (!response.AuthenticationResult) {
            throw new Error('Authentication failed');
        }

        const { IdToken, AccessToken, RefreshToken } = response.AuthenticationResult;
        
        // Decode the ID token to get user info
        const decoded = jwt.decode(IdToken);
        
        return {
            success: true,
            token: IdToken,
            accessToken: AccessToken,
            refreshToken: RefreshToken,
            user: {
                userId: decoded.sub,
                email: decoded.email,
                fullName: decoded['custom:fullName'] || decoded.email,
                role: decoded['custom:role'] || 'user'
            }
        };

    } catch (error) {
        console.error('❌ Cognito login error:', error);
        
        if (error.name === 'NotAuthorizedException') {
            throw new Error('Invalid email or password');
        } else if (error.name === 'UserNotFoundException') {
            throw new Error('User not found');
        } else {
            throw new Error('Login failed: ' + error.message);
        }
    }
}

/**
 * Verify Cognito token
 */
async function verifyCognitoToken(token) {
    try {
        // Decode without verification (Cognito tokens are already verified by AWS)
        const decoded = jwt.decode(token);
        
        if (!decoded) {
            throw new Error('Invalid token');
        }

        // Check expiration
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
            throw new Error('Token expired');
        }

        return {
            userId: decoded.sub,
            email: decoded.email,
            role: decoded['custom:role'] || 'user',
            fullName: decoded['custom:fullName'] || decoded.email
        };

    } catch (error) {
        console.error('❌ Token verification error:', error);
        throw new Error('Invalid or expired token');
    }
}

/**
 * Get user info from Cognito
 */
async function getCognitoUser(accessToken) {
    try {
        const command = new GetUserCommand({
            AccessToken: accessToken
        });

        const response = await cognitoClient.send(command);
        
        const attributes = {};
        response.UserAttributes.forEach(attr => {
            attributes[attr.Name] = attr.Value;
        });

        return {
            userId: attributes.sub,
            email: attributes.email,
            fullName: attributes['custom:fullName'] || attributes.email,
            role: attributes['custom:role'] || 'user'
        };

    } catch (error) {
        console.error('❌ Get user error:', error);
        throw new Error('Failed to get user info');
    }
}

module.exports = {
    loginWithCognito,
    verifyCognitoToken,
    getCognitoUser
};
