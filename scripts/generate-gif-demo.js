#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

async function main() {
  const outArg = process.argv.find(a => a.startsWith('--out=')) || '--out=assets/demos/demo.gif';
  const outGif = outArg.split('=')[1];
  const outMp4 = outGif.replace(/\.gif$/i, '.mp4');
  const outDir = path.dirname(outGif);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'], defaultViewport: { width: 1280, height: 720 }});
  const page = await browser.newPage();
  const indexPath = path.join(__dirname, '..', 'index.html');
  await page.goto('file://' + indexPath, { waitUntil: 'networkidle0' });

  // Scroll the page
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  // Open demo panel if available
  const demoButton = await page.$('.code-demo .run-sandbox');
  if (demoButton) {
    await demoButton.click();
    await page.waitForTimeout(500);
  }

  // Record the interaction
  const recorder = new PuppeteerScreenRecorder(page);
  await recorder.start(outMp4);
  await page.waitForTimeout(3000);
  await recorder.stop();
  await browser.close();

  try {
    execSync(`ffmpeg -y -i ${outMp4} ${outGif}`, { stdio: 'inherit' });
  } catch (err) {
    console.error('ffmpeg conversion failed:', err.message);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
