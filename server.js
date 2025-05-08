const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();
const port = process.env.PORT || 3000;

// 1. إعدادات الأمان الأساسية
app.use(helmet());
app.use(cors({
  origin: '*' // يمكنك تحديد نطاقات معينة بدلاً من *
}));

// 2. معدل الحد من الطلبات (Rate Limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100 // 100 طلب لكل IP
});
app.use(limiter);

// 3. مجلد static مع خيارات ذاكرة التخزين المؤقت
app.use(express.static('public', {
  maxAge: '1d' // تخزين مؤقت لمدة يوم
}));

// 4. صفحة الترحيب مع تحسينات SEO
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="description" content="لوحة متابعة أسعار العملات الرقمية مباشرة من CoinGecko API">
      <title>لوحة العملات الرقمية</title>
      <style>
        body {
          font-family: 'Tajawal', Arial, sans-serif;
          text-align: center;
          padding: 2rem;
          line-height: 1.6;
          background-color: #f5f5f5;
        }
        h1 { color: #2c3e50; }
        a {
          display: inline-block;
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #3498db;
          color: white;
          border-radius: 5px;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        a:hover {
          background: #2980b9;
          transform: translateY(-2px);
        }
      </style>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body>
      <h1>مرحباً بك في لوحة متابعة العملات الرقمية</h1>
      <p>لرؤية بيانات السوق المباشرة، تفضل بزيارة:</p>
      <a href="/api/market">عرض بيانات السوق</a>
    </body>
    </html>
  `);
});

// 5. نقطة نهاية API مع معالجة الأخطاء المحسنة
app.get('/api/market', async (req, res) => {
  try {
    // إضافة معلمات افتراضية
    const vsCurrency = req.query.vs_currency || 'usd';
    const perPage = Math.min(parseInt(req.query.per_page) || 100, 250);
    
    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vsCurrency}&per_page=${perPage}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CryptoDashboard/1.0'
      },
      timeout: 5000 // مهلة 5 ثواني
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // إضافة رؤوس التحكم في الذاكرة المؤقتة
    res.set('Cache-Control', 'public, max-age=300'); // 5 دقائق
    res.json(data);
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'حدث خطأ في جلب البيانات',
      details: error.message
    });
  }
});

// 6. معالجة المسارات غير الموجودة
app.use((req, res) => {
  res.status(404).json({ error: 'الصفحة غير موجودة' });
});

// 7. تشغيل الخادم مع معالجة الأخطاء غير الملتقطة
app.listen(port, () => {
  console.log(`🟢 الخادم يعمل على http://localhost:${port}`);
}).on('error', (err) => {
  console.error('🔴 خطأ في تشغيل الخادم:', err);
});
