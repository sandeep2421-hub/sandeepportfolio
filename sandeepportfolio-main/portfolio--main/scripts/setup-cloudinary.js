// Quick Cloudinary Setup Script
// This script helps you configure Cloudinary credentials

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n🌟 Cloudinary Setup for Portfolio\n');
console.log('Get your credentials from: https://cloudinary.com/console\n');

const questions = [
    'Enter your Cloud Name: ',
    'Enter your API Key: ',
    'Enter your API Secret: '
];

let answers = [];

function askQuestion(index) {
    if (index === questions.length) {
        updateEnvFile();
        return;
    }

    rl.question(questions[index], (answer) => {
        answers.push(answer.trim());
        askQuestion(index + 1);
    });
}

function updateEnvFile() {
    const envPath = path.join(__dirname, '../.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update Cloudinary credentials
    envContent = envContent.replace(
        /CLOUDINARY_CLOUD_NAME=.*/,
        `CLOUDINARY_CLOUD_NAME=${answers[0]}`
    );
    envContent = envContent.replace(
        /CLOUDINARY_API_KEY=.*/,
        `CLOUDINARY_API_KEY=${answers[1]}`
    );
    envContent = envContent.replace(
        /CLOUDINARY_API_SECRET=.*/,
        `CLOUDINARY_API_SECRET=${answers[2]}`
    );

    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Cloudinary configuration updated successfully!\n');
    console.log('📋 Next steps:');
    console.log('1. Restart your server: npm run dev:full');
    console.log('2. Go to admin panel and test uploading an image');
    console.log('3. Check Cloudinary dashboard to see your uploads\n');
    console.log('🚀 Ready to deploy to Vercel? Check VERCEL_DEPLOYMENT_GUIDE.md\n');

    rl.close();
}

askQuestion(0);
