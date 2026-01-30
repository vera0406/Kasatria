
const fs = require('fs');
require('dotenv').config({ path: '.env' });

const env = (k) => process.env[k] || '';

const configObj = {
  GOOGLE_CLIENT_ID: env('GOOGLE_CLIENT_ID'),
  GOOGLE_SHEET_ID: env('GOOGLE_SHEET_ID'),
  GOOGLE_API_KEY: env('GOOGLE_API_KEY'),
  APP_NAME: env('APP_NAME') || '3D Data Visualization',
  REDIRECT_URI: env('REDIRECT_URI') || ''
};

const fileContent = `const CONFIG = ${JSON.stringify(configObj, null, 2)};
if (typeof window !== 'undefined') window.CONFIG = CONFIG;
if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG;
`;

fs.writeFileSync('config.js', fileContent, { encoding: 'utf8' });
console.log('Wrote config.js');
