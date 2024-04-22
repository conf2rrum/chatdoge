const API_KEY = "sk-";
const OpenAI = require('openai');
const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');
// const serverless = require('serverless-http');
const app = express()


// CORS 이슈 해결
// let corsOptions = {
//     origin: 'https://chatdoge-173.pages.dev',
//     credentials: true
// }

app.use(cors());

// POST 요청 받을 수 있게 만듬
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const openai = new OpenAI({
    apiKey: API_KEY, // This is the default and can be omitted
});
  
// POST method route
app.post('/tellFortune', async (req, res) => {
    let { userMessage, threadId } = req.body
    const assistantId = "asst_QSnIoI9IDSs9v2Zzv6zfTD1n"

    if (threadId == '') {
        const emptyThread = await openai.beta.threads.create();
        threadId = emptyThread.id;
        await openai.beta.threads.messages.create(
            threadId,
            { role: "user", content: userMessage }
        );
    }
    await openai.beta.threads.messages.create(
        threadId,
        { role: "user", content: userMessage }
    );

    let run = await openai.beta.threads.runs.create(
        threadId,
        { assistant_id: assistantId }
    );

    while (run.status != "completed") {
        run = await openai.beta.threads.runs.retrieve(
            threadId,
            run.id
        );
        // time.sleep(0.5)
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const threadMessages = await openai.beta.threads.messages.list(threadId);
    assistantLastMsg = threadMessages.data[0].content[0].text.value

    res.json({ "assistant": assistantLastMsg, "threadId": threadId })
});

// module.exports.handler = serverless(app);
app.listen(3000)
