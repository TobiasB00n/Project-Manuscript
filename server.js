import express from "express";
import path from 'path';
import { Bot, InlineKeyboard, Keyboard,InputFile } from "grammy";
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import crypto from "crypto";
import { bot } from "./js/bot.js";

const app = express();
const port = 3000;

app.use(express.json());

bot.command("start", (ctx) => ctx.reply(`hello`));

// bot.on('message', (ctx) => {console.log(ctx.message.text)});
console.log('Bot started');

app.use('/api', apiRoutes);
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/images',express.static('images'))
app.get('/', (req, res) => {
  res.sendFile('index.html', {root: '.'})
});


app.post('/webapp-data', (req, res) => {
  const data = req.body;
  console.log(data);
  const receivedHash = data.hash;
  console.log(receivedHash);
})

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)

// });

bot.start()