const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('studio_user', JSON.stringify({
      id: 'test',
      email: 'test@example.com',
      name: 'Test',
      role: 'admin',
      portalAccess: ['all']
    }));
  });

  await page.goto('http://localhost:3000/studio');
  await new Promise(r => setTimeout(r, 2000));
  
  const rootHtml = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root ? root.innerHTML : 'No root element found';
  });
  
  console.log('ROOT HTML:', rootHtml.substring(0, 500));
  
  await browser.close();
})();
