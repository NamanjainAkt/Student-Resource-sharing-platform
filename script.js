// Initialize storage
const STORAGE_KEY = 'resources';
const USERS_KEY = 'users';
let currentUser = null;

// Auth handlers
document.getElementById('loginBtn').addEventListener('click', () => showModal('loginModal'));
document.getElementById('registerBtn').addEventListener('click', () => showModal('registerModal'));

// Form submission
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('resourceTitle').value;
    const file = document.getElementById('resourceFile').files[0];
    const desc = document.getElementById('resourceDesc').value;

    if (!currentUser) {
        alert('Please login to upload resources');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const resource = {
            id: Date.now(),
            title,
            filename: file.name,
            content: e.target.result,
            description: desc,
            uploader: currentUser.username,
            date: new Date().toISOString()
        };

        saveResource(resource);
        loadResources();
        this.reset();
    };
    reader.readAsDataURL(file);
});

// Storage functions
function saveResource(resource) {
    const resources = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    resources.push(resource);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
}

function loadResources() {
    const container = document.getElementById('resourcesContainer');
    const resources = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    container.innerHTML = resources.map(resource => `
        <div class="resource-card">
            <h3>${resource.title}</h3>
            <p class="meta">Uploaded by ${resource.uploader}</p>
            <p>${resource.description}</p>
            <a href="${resource.content}" download="${resource.filename}" class="download-btn">Download</a>
        </div>
    `).join('');
}

// Auth simulation
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Auth form handlers
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        document.getElementById('loginModal').style.display = 'none';
        updateAuthUI();
    } else {
        alert('Invalid credentials');
    }
});

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    if (!username || !password) {
        alert('Please fill all fields');
        return;
    }

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }

    const newUser = { username, password };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    currentUser = newUser;
    document.getElementById('registerModal').style.display = 'none';
    updateAuthUI();
});

function updateAuthUI() {
    const authButtons = document.querySelector('nav');
    if (currentUser) {
        // Add to updateAuthUI function
        const themeToggle = `<button id="themeToggle">🌙</button>`;
        
        // In updateAuthUI()
        authButtons.innerHTML = `<a href="http://localhost:5173/" class="gemini-link">Gemini Clone</a>
        <button id="aiSummarizerBtn">AI Summarizer</button>
        ${currentUser ? `<span>Welcome ${currentUser.username}</span>` : ''}
        ${themeToggle}
        ${currentUser ? '<button id="logoutBtn">Logout</button>' : '<button id="loginBtn">Login</button><button id="registerBtn">Register</button>'}`;
        
        // Add theme toggle handler
        document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
        document.getElementById('aiSummarizerBtn')?.addEventListener('click', () => window.location.href = 'http://localhost:5173/');
        
        // New theme functions
        function toggleTheme() {
            const isDark = document.body.hasAttribute('data-theme');
            document.body.setAttribute('data-theme', isDark ? null : 'dark');
            localStorage.setItem('theme', isDark ? 'light' : 'dark');
            document.getElementById('themeToggle').textContent = isDark ? '🌙' : '☀️';
        }
        
        // Initialize theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme === 'dark' ? 'dark' : null);
        document.getElementById('themeToggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        document.getElementById('logoutBtn').addEventListener('click', logout);
    } else {
        authButtons.innerHTML = `
            <a href="http://localhost:5173/" class="gemini-link">Gemini Clone</a>
            <button id="aiSummarizerBtn">AI Summarizer</button>
            <button id="loginBtn">Login</button>
            <button id="registerBtn">Register</button>
        `;
        document.getElementById('loginBtn').addEventListener('click', () => showModal('loginModal'));
        document.getElementById('registerBtn').addEventListener('click', () => showModal('registerModal'));
    }
}

function logout() {
    currentUser = null;
    updateAuthUI();
}

// Chat handlers
document.getElementById('sendButton').addEventListener('click', handleMessage);
document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleMessage();
});

function handleMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    input.value = '';
    simulateAIResponse(message);
}

function appendMessage(content, sender) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = `message-bubble ${sender}`;
    messageEl.textContent = content;
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function simulateAIResponse(prompt) {
    const status = document.getElementById('aiStatus');
    status.textContent = 'Gemini is thinking...';
    
    setTimeout(() => {
        appendMessage(`I received: ${prompt}`, 'ai');
        status.textContent = 'Ready';
    }, 1500);
}

// Initialize auth UI
updateAuthUI();

// Initial load
loadResources();