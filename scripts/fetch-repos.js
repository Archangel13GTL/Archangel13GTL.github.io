#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  const url = 'https://api.github.com/users/Archangel13GTL/repos';
  const raw = execSync(`curl -sL ${url}`, { encoding: 'utf8' });
  const repos = JSON.parse(raw);

  const dataDir = path.join(__dirname, '..', 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'repos.json'), JSON.stringify(repos, null, 2));

  const regex = /portfolio|tenet|tenetx|professional/i;
  const candidates = repos
    .filter(repo => regex.test(repo.name) || regex.test(repo.description || ''))
    .map(repo => repo.name);

  console.log('Candidate repositories:', candidates.join(', '));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
