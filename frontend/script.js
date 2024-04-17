const chatMessages = document.querySelector('.chat-messages');
const chatInputField = document.querySelector('.chat-input-field');
const chatSendButton = document.querySelector('.chat-send-button');

// 메시지를 서버에 전송하는 함수
async function sendMessage(message) {
    try {
        const response = await fetch('http://localhost:3000/tellFortune', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: message })
        });

        const data = await response.json();
        console.log(data);
        displayMessage(data, 'assistant');
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// 메시지를 화면에 표시하는 함수
function displayMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', `chat-message--${sender}`);
  
    // 문자열이 아닌 객체 형태로 전달되었을 때 처리
    if (typeof message === 'object') {
      messageElement.textContent = message.assistant;
    } else {
      messageElement.textContent = message;
    }
  
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

// 사용자가 메시지를 전송할 때 실행되는 이벤트 핸들러
chatSendButton.addEventListener('click', () => {
    const message = chatInputField.value.trim();
    if (message) {
      displayMessage(message, 'user');
      sendMessage(message);
      chatInputField.value = '';
    }
  });