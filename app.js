import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { Bot } from "grammy";
const app = express();
const port = 3000;
import { bot } from "./js/bot.js";
app.use(express.json());
app.use('/api', apiRoutes);
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/images',express.static('images'))
app.get('/', (req, res) => {
  res.sendFile('index.html', {root: '.'})
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  bot.start()
});
