document.addEventListener('DOMContentLoaded', () => {
    const initializeUserSession = async () => {
        try {
            const localUserSession = localStorage.getItem('userSession');
    
            if (localUserSession) {
                const userSession = JSON.parse(localUserSession);
                if (userSession.email) {
                    updateUI(userSession);
                    return;
                }
            }
    
            const response = await fetch('/check-session', { credentials: 'include' });
            if (!response.ok) {
                throw new Error('Session check failed');
            }
    
            const sessionData = await response.json();
            if (sessionData.email) {
                localStorage.setItem('userSession', JSON.stringify(sessionData));
                updateUI(sessionData);
            } else {
                throw new Error('Session invalid');
            }
        } catch (error) {
            console.error('Failed to fetch or validate session:', error);
            localStorage.removeItem('userSession');
        }
    };
    
    const updateUI = (user) => {
        const { firstName, lastName, isAdmin } = user;
        const userGreeting = document.querySelector('.userGreeting');
        const loginButton = document.getElementById('Login-Button');
        const userIcon = document.getElementById('loginIcon');
    
        if (!isAdmin) {
            userGreeting.textContent = `Hi, ${firstName} ${lastName}`;
            loginButton.classList.add('hidden-class');
            userIcon.classList.replace('login_icon', 'login_icon-visible');
            const userDropMenu = document.getElementById('user-dropdown');
            const cancelDropdown = document.getElementById('cancel-click');
            loginIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDropdown(userDropMenu, 'show');
            });
        
            document.addEventListener('click', (e) => {
                if (!userDropMenu.contains(e.target) && !loginIcon.contains(e.target)) {
                    toggleDropdown(userDropMenu, 'hide');
                }
            });
            const toggleDropdown = (menu, action) => {
                if (menu) {
                    menu.classList.toggle('login-content-before-click', action === 'hide');
                    menu.classList.toggle('login-content-after-click', action === 'show');
                } else {
                    console.warn('Menu element not found');
                }
            };
            cancelDropdown.addEventListener('click', () => toggleDropdown(userDropMenu, 'hide'));
        }
        const logoutUser = async () => {
            try {
                await fetch('/api/user/logout', { method: 'POST', credentials: 'include' });
                localStorage.removeItem('userSession');
                window.location.reload();
            } catch (error) {
                console.error('Logout failed:', error);
            }
        };
        document.getElementById('Logout-Button').addEventListener('click', logoutUser)
    };
    

    initializeUserSession();

    document.getElementById('Logout-Button').addEventListener('click', ()=>{ console.log('clikc')});

    const logoutUser = async () => {
        console.log('click');
        
        try {
            await fetch('/api/user/logout', { method: 'POST', credentials: 'include' });
            localStorage.removeItem('userSession');
            window.location.reload();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };
    
    const getTimeFormat = (date) =>  {
        `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    const formatTime = (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        return `sent at ${getTimeFormat(date)}`;
    };


    const createCommentElement = (comment) => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';

        const header = document.createElement('div');
        header.className = 'comment-header';
        header.textContent = comment.name;

        const time = document.createElement('div');
        time.className = 'comment-time';
        time.dataset.timestamp = comment.time;
        time.textContent = comment.time;

        const content = document.createElement('div');
        content.textContent = comment.content;

        commentElement.append(header, time, content);
        return commentElement;
    };

    const populateComments = (data) => {
        const commentContainer = document.getElementById('comments');
        commentContainer.innerHTML = '';
        data.forEach(comment => {
            const commentElement = createCommentElement(comment);
            commentContainer.appendChild(commentElement);
        });
    };

    const initializeWebSocket = (ws, user) => {
        ws.onopen = () => {
            console.log('Connected to server');
            ws.send(JSON.stringify('hello server'));
        };

        ws.onmessage = ({ data }) => {
            const socketData = JSON.parse(data);
            if (socketData.type === 'new-comment') {
                console.log(socketData.comment);
                populateComments(socketData.comment);
            }
        };

        ws.onclose = () => console.log('Disconnected from WebSocket server');

        document.getElementById('commentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const commentText = document.getElementById('commentText').value.trim();
            if (commentText && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'comment',
                    name: `${user.firstName} ${user.lastName}`,
                    content: commentText,
                    time: getTimeFormat(new Date())
                }));
                document.getElementById('commentText').value = '';
            }
        });
    };

});
