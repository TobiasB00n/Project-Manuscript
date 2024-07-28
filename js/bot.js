import { Bot, InlineKeyboard, Keyboard,InputFile } from "grammy";
import {createWriteStream, readSync, writeFile } from 'fs'
import { Readable } from 'stream'
import { create } from "domain";
export { bot };
// import {vercel} from "vercel";
// const botToken = process.env.BOT_TOKEN
// const bot = new Bot(botToken)
const bot = new Bot(process.env.BOT_TOKEN);
// const bot = new Bot('7114805522:AAGpmCWhAR3iBxg8Jbww4EbJd8Wtx6bo4oA')
bot.command("start", (ctx) => ctx.reply(`Welcome to Quranic bot!
Enter "/" then enter name of surah and number of ayah. 

( example: /baqara 171 )

For help: /help


  Внимание:

Если бот не отвечает на запрос в течение 25 секунд, отправьте запрос повторно. 
Бот работает без локальной базы данных. Он делает запросы к API, и не все запросы проходят успешно, поэтому иногда могут отсутствовать ответы. 
Бот предоставляет только самые старые манускрипты, которые может найти. 
Если у вас есть сомнения относительно даты или самого манускрипта, повторите свой запрос или проверьте на https://corpuscoranicum.de/en/verse-navigator/sura/1/verse/1/manuscripts.

Pay attention: 

If the bot does not respond to a request within 25 seconds, please resend the request.
The bot operates without a local database. It makes requests to APIs, and not all requests are successful, so responses may sometimes be missing.
The bot provides only the oldest manuscripts it can find. 
If you have doubts about the date or the accuracy of the manuscript, please repeat your request or check it on https://corpuscoranicum.de/en/verse-navigator/sura/1/verse/1/manuscripts .
  `));



bot.command("help", (ctx) => ctx.reply(`In the command menu, commands for Surahs 1 - 100 are visible, but this does not mean that Surahs 101 to 114 are absent.
Here are the Surahs that are not visible:
/qaria       "101 surah 1 - 11 ayah"
/takathur  "102 surah 1 - 8 ayah"
/asr           "103 surah 1 - 3 ayah"
/humaza   "104 surah 1 - 9 ayah"
/fil             "105 surah 1 - 5 ayah"
/quraysh   "106 surah 1 - 4 ayah"
/maun      "107 surah 1 - 7 ayah"
/kawthar  "108 surah 1 - 3 ayah"
/kafirun    "109 surah 1 - 6 ayah"
/nasr       "110 surah 1 - 3 ayah"
/masad   "111 surah 1 - 5 ayah"
/ikhlas     "112 surah 1 - 4 ayah"
/falaq      "113 surah 1 - 5 ayah"
/nas         "114 surah 1 - 6 ayah"

`))



let idArray = [];

async function getManuscriptId(surahNumber, verseNumber) {
    const response = await fetch(`https://api.corpuscoranicum.de/api/data/manuscripts/sura/${surahNumber}/verse/${verseNumber}`);
    const data = await response.json();

    for (let i = 0; i < data.data.length; i++) {
        let idOfManuscript = data.data[i].manuscript_id; 
        idArray.push(`https://api.corpuscoranicum.de/api/data/manuscripts/${idOfManuscript}`)
      
    } 
    return idArray
}
let link;
let location;
let fullDate;
let titleOfManuscript;
let idOfManuscript;
let urlOfManuscript;

async function getManuscriptImage(surahNumber, verseNumber) {
  const response = await fetch(`https://api.corpuscoranicum.de/api/data/manuscripts/sura/${surahNumber}/verse/${verseNumber}`);
  const data = await response.json();

  for (let i = 0; i < data.data.length; i++) {
     idOfManuscript = data.data[i].manuscript_id;
    if (idOfManuscript == manId){
      urlOfManuscript = data.data[i].pages[0].images[0].image_url;
      location = data.data[i].archive.name;
      titleOfManuscript = data.data[i].title;
      link = data.data[i].archive.link
      return urlOfManuscript
    }else{continue}
    
  }
}



let minimumDate = 2000;
let manId;
let date;
let manuscriptInfo;
let manuscriptDate;
let parseDate;

async function getEarliestDate(surahNumber, verseNumber) {
  try {
    let urlList = await getManuscriptId(surahNumber, verseNumber);

    let promiseList = urlList.map(url => fetch(url));
    let promiseAllResults = await Promise.allSettled(promiseList);

    for (const result of promiseAllResults) {
      if (result.status === 'fulfilled') {
        manuscriptInfo = await result.value.json();
        if (manuscriptInfo.data.date) {
          parseDate = manuscriptInfo.data.date.split('-')[0].replace(/^\s+|\s+$/gm, '');
          date = +parseDate;
          if (date < minimumDate) {
            manId = manuscriptInfo.data.id;
            minimumDate = date;
            fullDate = manuscriptInfo.data.date 
          }
        }
      }
    }

    console.log(`Minimum date: ${minimumDate}`);
    console.log(`Manuscript ID: ${manId}`);

  } catch (e) {
    console.error(e);
  }
}

async function sendManuscript(surahNumber, verseNumber, ctx) {
  try {
    const manuscriptId = await getManuscriptId(surahNumber, verseNumber);
    await getEarliestDate(surahNumber, verseNumber);
    const urlOfManuscript = await getManuscriptImage(surahNumber, verseNumber);
    await ctx.replyWithPhoto(urlOfManuscript);
    return manuscriptId;
    
  } catch (error) {
    console.error('Error in sendManuscript:', error);
    throw error; 
  }
}



// Title: 
//    ${ titleOfManuscript }
const surahNames = [
  "fatiha", "baqara", "imran", "nisa", "maida", "anam", "araf", "anfal", "tawba",
  "yunus", "hud", "yusuf", "rad", "ibrahim", "hijr", "nahl", "isra", "kahf", "maryam", "taha",
  "anbiya", "hajj", "muminun", "nur", "furqan", "shuara", "naml", "qasas", "ankabut", "rum",
  "luqman", "sajda", "ahzab", "saba", "fatir", "yasin", "saffat", "sad", "zumar", "ghafir",
  "fussilat", "shura", "zukhruf", "dukhan", "jathiya", "ahqaf", "muhammad", "fath", "hujurat", "qaf",
  "dhariyat", "tur", "najm", "qamar", "rahman", "waqia", "hadid", "mujadila", "hashr", "mumtahina",
  "saff", "jumua", "munafiqun", "taghabun", "talaq", "tahrim", "mulk", "qalam", "haqqa", "maarij",
  "nuh", "jinn", "muzzammil", "muddathir", "qiyama", "insan", "mursalat", "naba", "naziat", "abasa",
  "takwir", "infitar", "mutaffifin", "inshiqaq", "buruj", "tariq", "ala", "ghashiya", "fajr", "balad",
  "shams", "layl", "duha", "sharh", "tin", "alaq", "qadr", "bayyina", "zalzala", "adiyat", "qaria",
  "takathur", "asr", "humaza", "fil", "quraysh", "maun", "kawthar", "kafirun", "nasr", "masad", "ikhlas", "falaq", "nas"
];

surahNames.forEach((surahName, index) => {
  bot.command(surahName, async (ctx) => {
    let verseNumber = ctx.match;
    let surahNumber = index + 1;

    if (isNaN(verseNumber) || verseNumber <= 0 || verseNumber > totalVerses[surahNumber - 1]) {
      await ctx.reply("Sorry, wrong ayah :(");
      return;
    }
    
    await ctx.reply("⌛")
    await ctx.reply("Please wait...")
    await sendManuscript(surahNumber, verseNumber, ctx)
    await ctx.reply(`Date: ${fullDate}

    Link: ${link}

    Location: ${location}`)
  });
});

bot.on('message', (ctx) => {
  console.log(ctx.message)})

const totalVerses = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
  123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
  34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
  60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
  28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
  15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3
];

 bot.api.setMyCommands([
  
  { command: "fatiha", description: "1 surah 1 - 7 ayah" },
  { command: "baqara", description: "2 surah 1 - 286 ayah" },
  { command: "imran", description: "3 surah 1 - 200 ayah" },
  { command: "nisa", description: "4 surah 1 - 176 ayah" },
  { command: "maida", description: "5 surah 1 - 120 ayah" },
  { command: "anam", description: "6 surah 1 - 165 ayah" },
  { command: "araf", description: "7 surah 1 - 206 ayah" },
  { command: "anfal", description: "8 surah 1 - 75 ayah" },
  { command: "tawba", description: "9 surah 1 - 129 ayah" },
  { command: "yunus", description: "10 surah 1 - 109 ayah" },
  { command: "hud", description: "11 surah 1 - 123 ayah" },
  { command: "yusuf", description: "12 surah 1 - 111 ayah" },
  { command: "rad", description: "13 surah 1 - 43 ayah" },
  { command: "ibrahim", description: "14 surah 1 - 52 ayah" },
  { command: "hijr", description: "15 surah 1 - 99 ayah" },
  { command: "nahl", description: "16 surah 1 - 128 ayah" },
  { command: "isra", description: "17 surah 1 - 111 ayah" },
  { command: "kahf", description: "18 surah 1 - 110 ayah" },
  { command: "maryam", description: "19 surah 1 - 98 ayah" },
  { command: "taha", description: "20 surah 1 - 135 ayah" },
  { command: "anbiya", description: "21 surah 1 - 112 ayah" },
  { command: "hajj", description: "22 surah 1 - 78 ayah" },
  { command: "muminun", description: "23 surah 1 - 118 ayah" },
  { command: "nur", description: "24 surah 1 - 64 ayah" },
  { command: "furqan", description: "25 surah 1 - 77 ayah" },
  { command: "shuara", description: "26 surah 1 - 227 ayah" },
  { command: "naml", description: "27 surah 1 - 93 ayah" },
  { command: "qasas", description: "28 surah 1 - 88 ayah" },
  { command: "ankabut", description: "29 surah 1 - 69 ayah" },
  { command: "rum", description: "30 surah 1 - 60 ayah" },
  { command: "luqman", description: "31 surah 1 - 34 ayah" },
  { command: "sajda", description: "32 surah 1 - 30 ayah" },
  { command: "ahzab", description: "33 surah 1 - 73 ayah" },
  { command: "saba", description: "34 surah 1 - 54 ayah" },
  { command: "fatir", description: "35 surah 1 - 45 ayah" },
  { command: "yasin", description: "36 surah 1 - 83 ayah" },
  { command: "saffat", description: "37 surah 1 - 182 ayah" },
  { command: "sad", description: "38 surah 1 - 88 ayah" },
  { command: "zumar", description: "39 surah 1 - 75 ayah" },
  { command: "ghafir", description: "40 surah 1 - 85 ayah" },
  { command: "fussilat", description: "41 surah 1 - 54 ayah" },
  { command: "shura", description: "42 surah 1 - 53 ayah" },
  { command: "zukhruf", description: "43 surah 1 - 89 ayah" },
  { command: "dukhan", description: "44 surah 1 - 59 ayah" },
  { command: "jathiya", description: "45 surah 1 - 37 ayah" },
  { command: "ahqaf", description: "46 surah 1 - 35 ayah" },
  { command: "muhammad", description: "47 surah 1 - 38 ayah" },
  { command: "fath", description: "48 surah 1 - 29 ayah" },
  { command: "hujurat", description: "49 surah 1 - 18 ayah" },
  { command: "qaf", description: "50 surah 1 - 45 ayah" },
  { command: "dhariyat", description: "51 surah 1 - 60 ayah" },
  { command: "tur", description: "52 surah 1 - 49 ayah" },
  { command: "najm", description: "53 surah 1 - 62 ayah" },
  { command: "qamar", description: "54 surah 1 - 55 ayah" },
  { command: "rahman", description: "55 surah 1 - 78 ayah" },
  { command: "waqia", description: "56 surah 1 - 96 ayah" },
  { command: "hadid", description: "57 surah 1 - 29 ayah" },
  { command: "mujadila", description: "58 surah 1 - 22 ayah" },
  { command: "hashr", description: "59 surah 1 - 24 ayah" },
  { command: "mumtahina", description: "60 surah 1 - 13 ayah" },
  { command: "saff", description: "61 surah 1 - 14 ayah" },
  { command: "jumua", description: "62 surah 1 - 11 ayah" },
  { command: "munafiqun", description: "63 surah 1 - 11 ayah" },
  { command: "taghabun", description: "64 surah 1 - 18 ayah" },
  { command: "talaq", description: "65 surah 1 - 12 ayah" },
  { command: "tahrim", description: "66 surah 1 - 12 ayah" },
  { command: "mulk", description: "67 surah 1 - 30 ayah" },
  { command: "qalam", description: "68 surah 1 - 52 ayah" },
  { command: "haqqa", description: "69 surah 1 - 52 ayah" },
  { command: "maarij", description: "70 surah 1 - 44 ayah" },
  { command: "nuh", description: "71 surah 1 - 28 ayah" },
  { command: "jinn", description: "72 surah 1 - 28 ayah" },
  { command: "muzzammil", description: "73 surah 1 - 20 ayah" },
  { command: "muddathir", description: "74 surah 1 - 56 ayah" },
  { command: "qiyama", description: "75 surah 1 - 40 ayah" },
  { command: "insan", description: "76 surah 1 - 31 ayah" },
  { command: "mursalat", description: "77 surah 1 - 50 ayah" },
  { command: "naba", description: "78 surah 1 - 40 ayah" },
  { command: "naziat", description: "79 surah 1 - 46 ayah" },
  { command: "abasa", description: "80 surah 1 - 42 ayah" },
  { command: "takwir", description: "81 surah 1 - 29 ayah" },
  { command: "infitar", description: "82 surah 1 - 19 ayah" },
  { command: "mutaffifin", description: "83 surah 1 - 36 ayah" },
  { command: "inshiqaq", description: "84 surah 1 - 25 ayah" },
  { command: "buruj", description: "85 surah 1 - 22 ayah" },
  { command: "tariq", description: "86 surah 1 - 17 ayah" },
  { command: "ala", description: "87 surah 1 - 19 ayah" },
  { command: "ghashiya", description: "88 surah 1 - 26 ayah" },
  { command: "fajr", description: "89 surah 1 - 30 ayah" },
  { command: "balad", description: "90 surah 1 - 20 ayah" },
  { command: "shams", description: "91 surah 1 - 15 ayah" },
  { command: "layl", description: "92 surah 1 - 21 ayah" },
  { command: "duha", description: "93 surah 1 - 11 ayah" },
  { command: "sharh", description: "94 surah 1 - 8 ayah" },
  { command: "tin", description: "95 surah 1 - 8 ayah" },
  { command: "alaq", description: "96 surah 1 - 19 ayah" },
  { command: "qadr", description: "97 surah 1 - 5 ayah" },
  { command: "bayyina", description: "98 surah 1 - 8 ayah" },
  { command: "zalzala", description: "99 surah 1 - 8 ayah" },
  { command: "adiyat", description: "100 surah 1 - 11 ayah" },
  // { command: "qaria", description:  "101 surah 1 - 11 ayah" },
  // { command: "takathur", description:"102 surah 1 - 8 ayah" },
  // { command: "asr", description:    "103 surah 1 - 3 ayah" },
  // { command: "humaza", description: "104 surah 1 - 9 ayah" },
  // { command: "fil", description:    "105 surah 1 - 5 ayah" },
  // { command: "quraysh", description:"106 surah 1 - 4 ayah" },
  // { command: "maun", description:   "107 surah 1 - 7 ayah" },
  // { command: "kawthar", description:"108 surah 1 - 3 ayah" },
  // { command: "kafirun", description:"109 surah 1 - 6 ayah" },
  // { command: "nasr", description:   "110 surah 1 - 3 ayah" },
  // { command: "masad", description:  "111 surah 1 - 5 ayah" },
  // { command: "ikhlas", description: "112 surah 1 - 4 ayah" },
  // { command: "falaq", description:  "113 surah 1 - 5 ayah" },
  // { command: "nas", description:    "114 surah 1 - 6 ayah" }
 ]);

// const chunkArray = (array, chunkSize) => {
//   const results = [];
//   for (let i = 0; i < array.length; i += chunkSize) {
//     results.push(array.slice(i, i + chunkSize));
//   }
//   return results;
// };

// const chunks = chunkArray(commands, 20);

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// async function setupBotCommands() {
//   for (const chunk of chunks) {
//     try {
//       await bot.api.setMyCommands(chunk);
//       console.log("Bot commands set successfully:", chunk);
//       await delay(500); // Задержка в 500 мс между запросами
//     } catch (err) {
//       if (err.error_code === 429 && err.parameters && err.parameters.retry_after) {
//         const retryAfter = err.parameters.retry_after;
//         console.error(`Too Many Requests: retry after ${retryAfter} seconds`);
//         await delay(retryAfter * 1000);
//       } else {
//         console.error("Failed to set bot commands:", err);
//       }
//     }
//   }
// }

// setupBotCommands();


 bot.start()
