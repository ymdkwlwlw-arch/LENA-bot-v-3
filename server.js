const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('LENA Bot is running successfully!');
});

app.listen(PORT, () => {
  console.log(`Web server is running on port ${PORT}`);
});

require('./index.js');

