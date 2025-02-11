const BACKEND_URL = 'https://backend-self-five-57.vercel.app'; // Backend URL

const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// Function to add a message to the chat
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    if (content.includes('<a ')) {
        messageDiv.innerHTML = content; // Hyperlinks are rendered as HTML
    } else {
        messageDiv.textContent = content;
    }
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Function to display choices as buttons
function addChoices(choices) {
    const choicesDiv = document.createElement('div');
    choicesDiv.classList.add('choices');

    choices.forEach((choice) => {
        if (choice.payload && choice.payload.label) {
            const button = document.createElement('button');
            button.textContent = choice.payload.label; // Set button label
            button.addEventListener('click', () => {
                sendMessage(choice);
            });
            choicesDiv.appendChild(button);
        }
    });

    messagesContainer.appendChild(choicesDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Function to send a message to the backend
async function sendMessage(requestPayload = null) {
    const userMessage = requestPayload ? requestPayload.payload.label : userInput.value.trim();

    if (!userMessage && !requestPayload) return;

    if (!requestPayload) {
        addMessage(userMessage, 'user'); // Display user's message
        userInput.value = ''; // Clear input
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

        const data = await response.json();

        if (!data || !Array.isArray(data)) {
            throw new Error('Unexpected API response');
        }

        data.forEach((responseItem) => {
            if (responseItem.type === 'text' && responseItem.payload) {
                addMessage(responseItem.payload.message, 'bot');
            } else if (responseItem.type === 'choice' && responseItem.payload.buttons) {
                addChoices(responseItem.payload.buttons);
            }
        });
    } catch (error) {
        console.error('Error connecting to backend:', error.message);
        addMessage('Unable to connect to the backend.', 'bot');
    }
}

// Initialize chatbot on page load
window.onload = async () => {
    addMessage('Initializing chatbot...', 'bot');
    await sendMessage({ payload: { label: 'launch' }, type: 'launch' });
};

// Event listeners
sendButton.addEventListener('click', () => sendMessage());
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendMessage();
});


// Particle Effect: Universe-like background
const particlesContainer = document.querySelector('.particles');

function createParticles(count) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 5 + 3;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const duration = Math.random() * 20 + 15;
        const dx = Math.random() * 2 - 1;
        const dy = Math.random() * 2 - 1;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}vw`;
        particle.style.top = `${top}vh`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.setProperty('--dx', dx);
        particle.style.setProperty('--dy', dy);

        particlesContainer.appendChild(particle);
    }
}

createParticles(100);
