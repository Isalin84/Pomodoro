import fs from 'node:fs';

const requiredFiles = [
  'app.js',
  'styles.css',
  'images/season-summer.webp',
  'images/season-autumn.webp',
  'images/season-winter.webp',
  'images/season-spring.webp',
];

const missing = requiredFiles.filter(file => !fs.existsSync(file) || fs.statSync(file).size === 0);
if (missing.length) {
  console.error(`Missing build artifacts: ${missing.join(', ')}`);
  process.exit(1);
}

const index = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');

if (index.includes('cdn.tailwindcss.com') || index.includes('type="text/babel"')) {
  console.error('index.html still uses runtime Tailwind or Babel.');
  process.exit(1);
}

if (!index.includes('styles.css') || !index.includes('app.js')) {
  console.error('index.html does not reference the production build artifacts.');
  process.exit(1);
}

if (/\bimport\s+.*react\/jsx-runtime/.test(app)) {
  console.error('The compiled app unexpectedly imports react/jsx-runtime.');
  process.exit(1);
}

console.log('Production build artifacts look valid.');
