const BACKEND_URL = 'https://backend-self-five-57.vercel.app'; // Deployed backend URL

const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// Function to display messages
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    if (content.includes('<a ')) {
        messageDiv.innerHTML = content; // Render hyperlinks as HTML
    } else {
        messageDiv.textContent = content;
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Function to display choice buttons
function addChoices(choices) {
    const choicesDiv = document.createElement('div');
    choicesDiv.classList.add('choices');

    choices.forEach((choice) => {
        const label = choice.payload?.label || choice.name;
        if (!label) {
            console.error('Invalid choice structure:', choice);
            return;
        }

        const button = document.createElement('button');
        button.textContent = label;
        button.addEventListener('click', () => sendMessage(choice)); // Pass choice as payload
        choicesDiv.appendChild(button);
    });

    messagesContainer.appendChild(choicesDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Function to send messages to the backend
async function sendMessage(requestPayload = null) {
    const userMessage = requestPayload ? requestPayload.payload.label : userInput.value.trim();

    if (!userMessage && !requestPayload) return;

    if (!requestPayload) {
        addMessage(userMessage, 'user');
        userInput.value = ''; // Clear input field
    }

    try {
        const response = await fetch(`${BACKEND_URL}/voiceflow-interact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: localStorage.getItem('userId') || crypto.randomUUID(),
                message: userMessage,
                request: requestPayload,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Clear existing choices to avoid duplicates
        const existingChoices = document.querySelector('.choices');
        if (existingChoices) existingChoices.remove();

        data.forEach((responseItem) => {
            if (responseItem.type === 'text') {
                addMessage(responseItem.payload.message, 'bot');
            } else if (responseItem.type === 'choice') {
                addChoices(responseItem.payload.buttons);
            } else {
                console.warn('Unhandled response type:', responseItem.type);
            }
        });
    } catch (error) {
        console.error('Error connecting to backend:', error);
        addMessage('Unable to connect to the backend.', 'bot');
    }
}

// Initialize chatbot on page load
window.onload = async () => {
    await sendMessage({ payload: { label: 'launch' }, type: 'launch' });
};

// Event listeners
sendButton.addEventListener('click', () => sendMessage());
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendMessage();
});
