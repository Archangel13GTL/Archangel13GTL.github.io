#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DATA_FILE = path.join(__dirname, '..', 'data', 'ranking.json');
const METRICS = ['STYLE_SIM', 'COMPLETENESS', 'FUNCTIONALITY', 'RECENT_ACTIVITY'];

let raw;
try {
  raw = fs.readFileSync(DATA_FILE, 'utf8');
} catch (err) {
  console.error(`Failed to read ${DATA_FILE}: ${err.message}`);
  process.exit(1);
}

let ranking;
try {
  ranking = JSON.parse(raw);
} catch (err) {
  console.error(`Invalid JSON in ${DATA_FILE}: ${err.message}`);
  process.exit(1);
}

const rows = ranking.map(entry => {
  const total = METRICS.reduce((sum, key) => sum + Number(entry[key] || 0), 0);
  return {
    repo: entry.repo,
    STYLE_SIM: entry.STYLE_SIM,
    COMPLETENESS: entry.COMPLETENESS,
    FUNCTIONALITY: entry.FUNCTIONALITY,
    RECENT_ACTIVITY: entry.RECENT_ACTIVITY,
    total
  };
});

rows.sort((a, b) => b.total - a.total);
console.table(rows);

const editor = process.env.EDITOR || 'vi';
rows.slice(0, 3).forEach(row => {
  const result = spawnSync(editor, [row.repo], { stdio: 'inherit' });
  if (result.error) {
    console.error(`Failed to open ${row.repo}: ${result.error.message}`);
  }
});
