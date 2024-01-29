
const puppeteer = require('puppeteer');
const config = require('./config');
const fs = require('fs');

const start = async () => {
  const browser = await puppeteer.launch({
    headless: false, 
    userDataDir: './user_data',
  });
  const page = await browser.newPage();
  const userAgent =
    'Mozilla/5.0 (X11; Linux x86_64)' +
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
  await page.setUserAgent(userAgent);
  await page.goto('http://web.whatsapp.com');

  try {
    await page.waitForSelector('#app > div > div.landing-wrapper > div.landing-window > div.landing-main > div > div > div._2I5ox > div', { timeout: 60000 });
    console.log('Logged in');

    let contactList = getContact(config.contact);
    contactList = contactList.split(/\r?\n/).slice(0, 2); 

    for (const contact of contactList) {
      await sendVideoToContact(page, contact, config.videoPath);
    }

    console.log('Done');
  } catch (error) {
    console.error('Error during login:', error.message);
  } finally {
    await page.waitForTimeout(10000);
    browser.close();
  }
};

const sendVideoToContact = async (page, contact, videoPath) => {
  await page.goto(`https://web.whatsapp.com/send?phone=${contact}`);
  await page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  try {
    await page.waitForSelector('._2S1VP', { timeout: 60000 });
  } catch (error) {
    console.log('Invalid phone number ' + contact);
    return;
  }

  // Upload the video file
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.uploadFile(videoPath);
    console.log('Video uploaded to ' + contact);
  } else {
    console.log('Failed to upload video to ' + contact);
  }

  // Send the message
  await page.focus('._2S1VP.copyable-text.selectable-text');
  await page.keyboard.press(String.fromCharCode(13));
  console.log('Success: Video sent to ' + contact);
};

const getContact = (path) => {
  const contact = fs.readFileSync(path, { encoding: 'utf-8' });
  return contact;
};

start();
