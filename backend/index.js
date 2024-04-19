const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const OpenAI = require('openai');

const app = express()
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cors());

const openai = new OpenAI({
    apiKey: 'API KEY', // This is the default and can be omitted
});
  
// POST method route
app.post('/tellFortune', async (req, res) => {
    let {userMessages, assistantMessages} = req.body
    console.log(userMessages);
    console.log(assistantMessages);
    let messages = [
        { role: 'system', content: '당신의 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 챗도지 입니다. 당신은 사람의 인생을 매우 명확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다.' },
        { role: 'user', content: '당신의 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 챗도지 입니다. 당신은 사람의 인생을 매우 명확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다.' },
        { role: 'assistant', content: '안녕하세요, 저는 챗도지입니다. 어떤 운세나 인생 관련 질문이든 무엇이든 물어보세요. 당신을 도울 수 있도록 최선을 다하겠습니다.' },
    ]

    while (userMessages.length != 0 || assistantMessages.length != 0) {
        if (userMessages.length != 0) {
            messages.push(
                JSON.parse('{"role": "user", "content": "'+String(userMessages.shift()).replace(/\n/g,"")+'"}')
            )
        }
        if (assistantMessages.length != 0) {
            messages.push(
                JSON.parse('{"role": "assistant", "content": "'+String(assistantMessages.shift()).replace(/\n/g,"")+'"}')
            )
        }
    }

    console.log(messages);

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        max_tokens: 200,
        temperature: 1.0,
        messages: messages
    });
        
    let fortune = completion.choices[0].message['content']
    // console.log(fortune);
    res.json({"assistant": fortune})
});

app.listen(3000)
