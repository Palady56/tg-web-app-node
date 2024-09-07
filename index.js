require('dotenv').config()

const express = require('express')
const cors = require('cors')

const TelegramBot = require('node-telegram-bot-api');
const webAppUrl = process.env.WEB_APP_URL

const token = process.env.TOKEN;

const bot = new TelegramBot(token, { polling: true });
const app = express()

app.use(express.json())
app.use(cors())

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    await bot.sendMessage(chatId, 'Click button below to fill the form', {
      reply_markup: {
        keyboard: [
          [{ text: 'Fill out the form', web_app: { url: webAppUrl + '/form' } }]
        ]
      }
    })

    await bot.sendMessage(chatId, 'Visit our online store using the button below', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Make an order', web_app: { url: webAppUrl } }]
        ]
      }
    })
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data)
      console.log("data:", data);
      
      await bot.sendMessage(chatId, `Your city: ${data?.city}`)
      await bot.sendMessage(chatId, `Your street: ${data?.street}`)
      await bot.sendMessage(chatId, "Thanks for the feedback!")

      setTimeout(async () => {
        await bot.sendMessage(chatId, "You will get all the information in this chat")
      }, 3000)

    } catch (error) {
      console.log(new Error("Data error:", error));

    }

  }
})

app.post('/web-data', async (req, res) => {
  const { queryId, products,  totalPrice} = req.body;
  
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Successful purchase",
      input_message_content: {message_text: "You purchased goods for the amount" + products} // totalPrice repalce
    })
    return res.status(200)

  } catch (error) {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Failed to purchase the item",
      input_message_content: {message_text: "Failed to purchase the item"}
    })
    return res.status(500).json({})
  }
  
  
})

const PORT = process.env.PORT

app.listen(PORT, () => console.log("Server started on PORT", PORT));