// Node.js script to generate config.js from .env file
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');
let envConfig = {
    SPOTIFY_CLIENT_ID: '',
    NODE_ENV: 'development',
    DEV_REDIRECT_URI: '',
    PROD_REDIRECT_URI: ''
};

if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=').trim();
            if (key && value) {
                envConfig[key.trim()] = value;
            }
        }
    });
}

// Generate config.js
const configContent = `// Auto-generated from .env - DO NOT EDIT MANUALLY
// Run 'node generate-config.js' to regenerate this file

window.CONFIG = {
    SPOTIFY_CLIENT_ID: '${envConfig.SPOTIFY_CLIENT_ID}',
    NODE_ENV: '${envConfig.NODE_ENV}',
    DEV_REDIRECT_URI: '${envConfig.DEV_REDIRECT_URI}',
    PROD_REDIRECT_URI: '${envConfig.PROD_REDIRECT_URI}'
};
`;

const configPath = path.join(__dirname, 'config.js');
fs.writeFileSync(configPath, configContent, 'utf8');
console.log('✅ config.js generated successfully!');
console.log(`   Client ID: ${envConfig.SPOTIFY_CLIENT_ID ? '***' + envConfig.SPOTIFY_CLIENT_ID.slice(-4) : 'NOT SET'}`);
console.log(`   Environment: ${envConfig.NODE_ENV}`);
