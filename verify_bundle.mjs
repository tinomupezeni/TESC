import fs from 'fs';
import path from 'path';

const bundlePath = 'frontend/dist/assets/'; // Path to built assets
const files = fs.readdirSync(bundlePath);
const jsFiles = files.filter(f => f.endsWith('.js'));

console.log('Searching for "Briefcase" usage in bundles...');
let foundUsage = false;

for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(bundlePath, file), 'utf8');
    if (content.includes('Briefcase')) {
        console.log(`Found potential reference in: ${file}`);
        foundUsage = true;
    }
}

if (!foundUsage) {
    console.error('CRITICAL: "Briefcase" not found in any JS bundle. The icon is likely missing or fully stripped.');
    process.exit(1);
} else {
    console.log('SUCCESS: References to "Briefcase" found in bundles.');
    process.exit(0);
}
