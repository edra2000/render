const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

// إعداد مجلد 'public' لعرض الموقع
app.use(express.static('public'));

// صفحة الترحيب الأساسية
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Crypto Dashboard</title>
      <style>
        body { font-family: Arial, text-align: center; padding: 50px; }
        a { color: #0066cc; text-decoration: none; }
      </style>
    </head>
    <body>
      <h1>مرحباً بك في لوحة العملات الرقمية!</h1>
      <p>لرؤية بيانات السوق، تفضل بزيارة:</p>
      <p><a href="/api/market">/api/market</a></p>
    </body>
    </html>
  `);
});

// رابط بيانات السوق
app.get('/api/market', async (req, res) => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send('حدث خطأ في جلب البيانات');
  }
});

// تشغيل الخادم
app.listen(port, () => {
  console.log(`الخادم يعمل على الرابط http://localhost:${port}`);
});
