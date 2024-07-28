 import path from 'path';
// import { Bot, InlineKeyboard, Keyboard,InputFile } from "grammy";
// import { fileURLToPath } from 'url';
// // import apiRoutes from './routes/api.js';
 import { bot } from "./js/bot.js";
  // import  vercel from "vercel";

import crypto from "crypto";
import express from "express";

const app = express();
const port = 3000;

// const TELEGRAM_BOT_TOKEN = '110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw';

const verifyTelegramWebAppData = (telegramInitData) => {

  const encoded = decodeURIComponent(telegramInitData);
  
  // Подпись HMAC-SHA-256 токена бота с константной строкой WebAppData, используемой в качестве ключа
  const secret = crypto
    .createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest();

  // Разделение данных на пары ключ-значение
  const arr = encoded.split('&');
  const hashIndex = arr.findIndex(str => str.startsWith('hash='));
  const hash = arr.splice(hashIndex, 1)[0].split('=')[1];

  // Сортировка данных в алфавитном порядке
  arr.sort((a, b) => a.localeCompare(b));

  // Создание строки проверки данных
  const dataCheckString = arr.join('\n');

  // Вычисление HMAC-SHA-256 подписи строки проверки данных с секретным ключом
  const calculatedHash = crypto
    .createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');

  // Проверка совпадения хешей
  return calculatedHash === hash;
};


app.use(express.json());


// bot.on('message', (ctx) => {console.log(ctx.message.text)});
console.log('Bot started');

// app.use('/api', apiRoutes);
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/images',express.static('images'))
app.get('/', (req, res) => {
  res.sendFile('index.html', {root: '.'})
});


app.post('/webapp/initData', (req, res) => {
  const data = req.body.telegramInitData;
  // console.log(data);
  const receivedHash = data.hash;
  // console.log(receivedHash);
  if (verifyTelegramWebAppData(telegramInitData)) {
    res.send("Данные валидны и получены от Telegram");
  } else {
    res.status(400).send("Данные невалидны");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)});

  

// bot.launch();
// bot.start()

