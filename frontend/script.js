const BACKEND_URL = 'https://aigenseek-chat-backend.vercel.app/'; // Replace with your deployed backend URL

const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// Function to display a message
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    // Check if the content contains HTML (like a hyperlink)
    if (content.includes('<a ')) {
        messageDiv.innerHTML = content; // Render HTML as it is
    } else {
        messageDiv.textContent = content; // Render plain text
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}


// Function to display choices (buttons)
function addChoices(choices) {
    const choicesDiv = document.createElement('div');
    choicesDiv.classList.add('choices');

    choices.forEach((choice) => {
        const button = document.createElement('button');
        button.textContent = choice.name;
        button.addEventListener('click', () => sendMessage(choice.request)); // Send the choice payload
        choicesDiv.appendChild(button);
    });

    messagesContainer.appendChild(choicesDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Function to validate if a string is a URL
function isValidURL(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Function to send a message to the backend
async function sendMessage(requestPayload = null) {
    const userMessage = requestPayload ? requestPayload.payload.label : userInput.value.trim();

    if (!userMessage && !requestPayload) return;

    if (!requestPayload) {
        // Display user message in chat
        addMessage(userMessage, 'user');
        userInput.value = ''; // Clear input
    }

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: localStorage.getItem('userId') || crypto.randomUUID(),
                message: userMessage,
                request: requestPayload, // Send the full request payload for choices
            }),
        });

        const data = await response.json();

        // Display the bot responses
        data.forEach((responseItem) => {
            if (responseItem.type === 'text') {
                addMessage(responseItem.payload.message, 'bot');
            } else if (responseItem.type === 'choice') {
                addChoices(responseItem.payload.buttons);
            }
        });
    } catch (error) {
        console.error('Error connecting to backend:', error);
        addMessage('Unable to connect to the backend.', 'bot');
    }
}

// Fetch the initial greeting on page load
window.onload = async () => {
    await sendMessage({ payload: { label: 'launch' }, type: 'launch' });
};

// Event listeners for sending a message
sendButton.addEventListener('click', () => sendMessage());
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendMessage();
});

// -------------------------------------------
// Particle Code: Create a Universe-like Effect
// -------------------------------------------

const particlesContainer = document.querySelector('.particles');

// Function to generate random particles
function createParticles(count) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Randomize starting position, size, speed, and direction
        const size = Math.random() * 5 + 3; // Particle size: 3px to 8px
        const left = Math.random() * 100; // Random position on X-axis
        const top = Math.random() * 100; // Random position on Y-axis
        const duration = Math.random() * 20 + 15; // Animation duration: 15s to 35s
        const dx = Math.random() * 2 - 1; // Random horizontal direction
        const dy = Math.random() * 2 - 1; // Random vertical direction

        // Apply styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}vw`;
        particle.style.top = `${top}vh`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.setProperty('--dx', dx);
        particle.style.setProperty('--dy', dy);

        // Add particle to container
        particlesContainer.appendChild(particle);
    }
}

// Generate 100 particles
createParticles(100);
