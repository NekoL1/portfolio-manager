import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { replaceInFileSync } from 'replace-in-file';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
  path: resolve(__dirname, '.env')
});

const now = new Date();
const buildTimestamp = `${new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'America/Toronto'
}).format(now)} - ${new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  hour12: true,
  minute: '2-digit',
  timeZone: 'America/Toronto'
}).format(now)}`;

try {
  const changedFiles = replaceInFileSync({
    files: './dist/apps/client/main.*.js',
    from: /{BUILD_TIMESTAMP}/g,
    to: buildTimestamp,
    allowEmptyPaths: false
  });
  console.log('Build version set: ' + buildTimestamp);
  console.log(changedFiles);
} catch (error) {
  console.error('Error occurred:', error);
}
