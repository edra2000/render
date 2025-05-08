const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public')); // عرض ملفات static مثل HTML و CSS و JS

app.get('/api/market', async (req, res) => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching market data');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
