const express = require('express');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/send-whatsapp-video', (req, res) => {
  const { recipients, videoUrl } = req.body;

  if (!recipients || !videoUrl) {
    return res.status(400).json({ success: false, message: 'Invalid request. Missing recipients or videoUrl.' });
  }

 
  recipients.forEach((to) => {
    const message = `Check out this video: ${videoUrl}`;
    console.log(`WhatsApp video sent to ${to}: ${message}`);
  });

  res.json({ success: true, message: 'WhatsApp video sent successfully.' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
