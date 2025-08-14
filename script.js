 // Application State
        let currentUser = null;
        let messages = [];
        let onlineUsers = [];
        let typingUsers = new Set();
        let isTyping = false;
        let typingTimeout = null;

        // DOM Elements
        const loginContainer = document.getElementById('loginContainer');
        const chatApp = document.getElementById('chatApp');
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const messagesContainer = document.getElementById('messagesContainer');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const onlineUsersList = document.getElementById('onlineUsersList');
        const typingIndicator = document.getElementById('typingIndicator');
        const typingUserSpan = document.getElementById('typingUser');
        const currentUserName = document.getElementById('currentUserName');
        const currentUserAvatar = document.getElementById('currentUserAvatar');
        const logoutBtn = document.getElementById('logoutBtn');
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // Load messages from localStorage
            loadMessages();
            
            // Setup event listeners
            loginForm.addEventListener('submit', handleLogin);
            messageInput.addEventListener('input', handleTyping);
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
            sendButton.addEventListener('click', sendMessage);
            logoutBtn.addEventListener('click', handleLogout);
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });

            // Simulate initial online users
            simulateOnlineUsers();
        });

        // Login Handler
        function handleLogin(e) {
            e.preventDefault();
            const username = usernameInput.value.trim();
            
            if (username) {
                currentUser = {
                    id: Date.now(),
                    name: username,
                    avatar: username.charAt(0).toUpperCase()
                };
                
                // Update UI
                currentUserName.textContent = username;
                currentUserAvatar.textContent = currentUser.avatar;
                
                // Show chat app
                loginContainer.style.display = 'none';
                chatApp.style.display = 'block';
                
                // Add user to online users
                addUserToOnlineList(currentUser);
                
                // Show system message
                addSystemMessage(`${username} joined the chat`);
                
                // Simulate WebSocket connection
                simulateWebSocketConnection();
                
                // Load and display messages
                displayMessages();
            }
        }

        // Logout Handler
        function handleLogout() {
            if (currentUser) {
                // Show system message
                addSystemMessage(`${currentUser.name} left the chat`);
                
                // Remove from online users
                removeUserFromOnlineList(currentUser.id);
                
                // Reset state
                currentUser = null;
                messages = [];
                onlineUsers = [];
                
                // Show login screen
                chatApp.style.display = 'none';
                loginContainer.style.display = 'flex';
                
                // Clear form
                usernameInput.value = '';
            }
        }

        // Send Message
        function sendMessage() {
            const messageText = messageInput.value.trim();
            
            if (messageText && currentUser) {
                const message = {
                    id: Date.now(),
                    userId: currentUser.id,
                    username: currentUser.name,
                    text: messageText,
                    timestamp: new Date().toISOString()
                };
                
                // Add to messages array
                messages.push(message);
                
                // Save to localStorage
                saveMessages();
                
                // Display message
                displayMessage(message);
                
                // Clear input
                messageInput.value = '';
                
                // Stop typing indicator
                stopTyping();
                
                // Simulate receiving a response after a delay
                simulateResponse(message);
            }
        }

        // Display Message
        function displayMessage(message) {
            const messageEl = document.createElement('div');
            messageEl.className = 'message';
            
            if (message.userId === currentUser.id) {
                messageEl.classList.add('own');
            }
            
            const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            messageEl.innerHTML = `
                <div class="message-avatar">${message.username.charAt(0).toUpperCase()}</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${message.username}</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-text">${message.text}</div>
                </div>
            `;
            
            messagesContainer.appendChild(messageEl);
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Display System Message
        function addSystemMessage(text) {
            const messageEl = document.createElement('div');
            messageEl.className = 'system-message';
            messageEl.textContent = text;
            
            messagesContainer.appendChild(messageEl);
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Display All Messages
        function displayMessages() {
            messagesContainer.innerHTML = '';
            
            // Add welcome message
            addSystemMessage(`Welcome to the chat room, ${currentUser.name}!`);
            
            // Display all messages
            messages.forEach(message => {
                displayMessage(message);
            });
        }

        // Handle Typing
        function handleTyping() {
            if (!isTyping) {
                isTyping = true;
                // Simulate sending typing event
                simulateTypingEvent();
            }
            
            // Clear previous timeout
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            
            // Set new timeout
            typingTimeout = setTimeout(() => {
                stopTyping();
            }, 1000);
        }

        // Stop Typing
        function stopTyping() {
            isTyping = false;
            // Simulate sending stop typing event
            simulateStopTypingEvent();
        }

        // Show Typing Indicator
        function showTypingIndicator(username) {
            typingUserSpan.textContent = username;
            typingIndicator.style.display = 'flex';
        }

        // Hide Typing Indicator
        function hideTypingIndicator() {
            typingIndicator.style.display = 'none';
        }

        // Add User to Online List
        function addUserToOnlineList(user) {
            // Check if user already exists
            if (!onlineUsers.find(u => u.id === user.id)) {
                onlineUsers.push(user);
                updateOnlineUsersList();
            }
        }

        // Remove User from Online List
        function removeUserFromOnlineList(userId) {
            onlineUsers = onlineUsers.filter(user => user.id !== userId);
            updateOnlineUsersList();
        }

        // Update Online Users List
        function updateOnlineUsersList() {
            onlineUsersList.innerHTML = '';
            
            onlineUsers.forEach(user => {
                const userEl = document.createElement('div');
                userEl.className = 'online-user';
                
                userEl.innerHTML = `
                    <div class="online-user-avatar">
                        ${user.avatar}
                        <div class="online-indicator"></div>
                    </div>
                    <div class="online-user-name">${user.name}</div>
                `;
                
                onlineUsersList.appendChild(userEl);
            });
        }

        // Save Messages to localStorage
        function saveMessages() {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        }

        // Load Messages from localStorage
        function loadMessages() {
            const savedMessages = localStorage.getItem('chatMessages');
            if (savedMessages) {
                messages = JSON.parse(savedMessages);
            }
        }

        // Simulate WebSocket Connection
        function simulateWebSocketConnection() {
            // Simulate receiving initial messages
            setTimeout(() => {
                if (messages.length === 0) {
                    // Add some initial messages
                    const initialMessages = [
                        {
                            id: Date.now() - 10000,
                            userId: 999,
                            username: 'System',
                            text: 'Welcome to the real-time chat application!',
                            timestamp: new Date(Date.now() - 10000).toISOString()
                        },
                        {
                            id: Date.now() - 5000,
                            userId: 1001,
                            username: 'Alex',
                            text: 'Hey everyone! How are you doing?',
                            timestamp: new Date(Date.now() - 5000).toISOString()
                        }
                    ];
                    
                    initialMessages.forEach(msg => {
                        messages.push(msg);
                        displayMessage(msg);
                    });
                    
                    saveMessages();
                }
            }, 1000);
        }

        // Simulate Online Users
        function simulateOnlineUsers() {
            // Add some mock online users
            const mockUsers = [
                { id: 1001, name: 'Alex', avatar: 'A' },
                { id: 1002, name: 'Sam', avatar: 'S' },
                { id: 1003, name: 'Jordan', avatar: 'J' }
            ];
            
            mockUsers.forEach(user => {
                addUserToOnlineList(user);
            });
        }

        // Simulate Response to Message
        function simulateResponse(originalMessage) {
            // Simulate other users responding
            setTimeout(() => {
                if (Math.random() > 0.3) { // 70% chance of response
                    const responses = [
                        "That's interesting!",
                        "I agree with you.",
                        "Tell me more about that.",
                        "Thanks for sharing!",
                        "That's a great point!",
                        "I see what you mean."
                    ];
                    
                    const randomUser = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    
                    const responseMessage = {
                        id: Date.now(),
                        userId: randomUser.id,
                        username: randomUser.name,
                        text: randomResponse,
                        timestamp: new Date().toISOString()
                    };
                    
                    messages.push(responseMessage);
                    saveMessages();
                    displayMessage(responseMessage);
                }
            }, 2000 + Math.random() * 3000); // Random delay between 2-5 seconds
        }

        // Simulate Typing Event
        function simulateTypingEvent() {
            // In a real app, this would be sent via WebSocket
            // Here we'll just simulate other users typing
            if (Math.random() > 0.7) { // 30% chance of someone else typing
                setTimeout(() => {
                    const randomUser = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
                    if (randomUser.id !== currentUser.id) {
                        showTypingIndicator(randomUser.name);
                        
                        // Hide after a random time
                        setTimeout(() => {
                            hideTypingIndicator();
                        }, 1000 + Math.random() * 2000);
                    }
                }, 500);
            }
        }

        // Simulate Stop Typing Event
        function simulateStopTypingEvent() {
            // In a real app, this would be sent via WebSocket
            // Here we don't need to do anything special
        }

        // Show Notification
        function showNotification(title, message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            
            const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
            
            notification.innerHTML = `
                <i class="fas ${icon} notification-icon"></i>
                <div class="notification-content">
                    <div class="notification-title">${title}</div>
                    <div class="notification-message">${message}</div>
                </div>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            document.body.appendChild(notification);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                notification.remove();
            }, 5000);
            
            // Close button
            notification.querySelector('.notification-close').addEventListener('click', () => {
                notification.remove();
            });
        }