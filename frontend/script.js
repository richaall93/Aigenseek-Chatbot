const BACKEND_URL = 'https://backend-self-five-57.vercel.app'; // Replace with your backend URL

const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// Function to display messages
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.innerHTML = content; // Render as HTML to handle links
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Function to display choice buttons
function addChoices(choices) {
    const choicesDiv = document.createElement('div');
    choicesDiv.classList.add('choices');

    choices.forEach((choice) => {
        const label = choice.payload?.label || choice.name;
        if (!label || !choice.request) {
            console.error('Invalid choice structure:', choice);
            return;
        }

        const button = document.createElement('button');
        button.textContent = label;
        button.addEventListener('click', () => sendMessage(choice.request)); // Pass the exact request
        choicesDiv.appendChild(button);
    });

    messagesContainer.appendChild(choicesDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Function to send messages to the backend
async function sendMessage(requestPayload = null) {
    const userMessage = requestPayload ? requestPayload.payload?.label || requestPayload.name : userInput.value.trim();

    if (!userMessage && !requestPayload) return;

    if (!requestPayload) {
        addMessage(userMessage, 'user'); // Display user message
        userInput.value = ''; // Clear input field
    }

    try {
        console.log('Sending payload:', requestPayload || { message: userMessage });

        const response = await fetch(`${BACKEND_URL}/voiceflow-interact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: localStorage.getItem('userId') || crypto.randomUUID(),
                message: userMessage,
                request: requestPayload,
            }),
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

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
    console.log('Initializing chatbot...');
    await sendMessage({ payload: { label: 'launch' }, type: 'launch' });
};

// Event listeners for user interaction
sendButton.addEventListener('click', () => sendMessage());
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendMessage();
});

// Particle Effects: Create a Universe-like Effect
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
if (particlesContainer) {
    createParticles(100);
}
