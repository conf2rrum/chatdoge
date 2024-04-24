const API_KEY = "sk-";
const OpenAI = require('openai');
const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');
// const serverless = require('serverless-http');
const app = express()
const fs = require('fs');
const { toFile } = require('openai');
const path = require('path');

// CORS 이슈 해결
// let corsOptions = {
//     origin: 'https://chatgenie.pages.dev',
//     credentials: true
// }

app.use(cors());

// POST 요청 받을 수 있게 만듬
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const openai = new OpenAI({
    apiKey: API_KEY, // This is the default and can be omitted
});

// Create assistant with file search
async function createAssistant() {
    // Create assistant
    const myAssistant = await openai.beta.assistants.create({
        instructions: "당신의 이름은 지니 입니다. 당신은 대한민국의 도로명교육 전문가 입니다. 당신은 초등학생들에게 대한민국의 도로명 체계에 대해 가르쳐야 합니다. 당신은 초등학생들이 이해하기 쉽게 알려줘야 합니다. 초등학생들에게 친근하게 알려주세요. 첨부된 파일에 있는 내용을 토대로 알려주세요. 학생들의 질문이 도로명에 대한 것이 아니라면, 도로명에 대해 질문하도록 말해주세요.",
        name: "도로명교육 전문가",
        tools: [{ type: "file_search" }],
        model: "gpt-3.5-turbo-0125",
    });

    // Read files
    const filesDir = './';
    const fileNames = (await fs.promises.readdir(filesDir)).filter(name => name.endsWith('.pdf'));
    console.log(fileNames);

    const files = await Promise.all(fileNames.map(fileName => toFile(fs.createReadStream(path.join(filesDir, fileName)))));

    // Create a vector store including our files
    let vectorStore = await openai.beta.vectorStores.create({
        name: "도로명교육 이론",
    });

    await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, { files });

    await openai.beta.assistants.update(myAssistant.id, {
        tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
    });

    console.log(myAssistant);
}

// Only excute to create assistant
// Be sure not to forget to get assistant's ID
// Assistant ID: asst_QSnIoI9IDSs9v2Zzv6zfTD1n
// createAssistant();

// POST method route
app.post('/ask', async (req, res) => {
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


