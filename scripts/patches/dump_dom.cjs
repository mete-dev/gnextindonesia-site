const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.content();
  console.log("DOM content length:", content.length);
  if (content.length < 1000) {
     console.log("DOM is empty or very small. Content:", content);
  } else {
     const body = await page.evaluate(() => document.body.innerHTML);
     console.log("Body length:", body.length);
     if (body.length < 500) {
        console.log("Body content:", body);
     }
  }

  await browser.close();
})();
