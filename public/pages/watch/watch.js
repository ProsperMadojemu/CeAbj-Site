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
                websocketFunction();
            } else {
                throw new Error('Session invalid');
            }
        } catch (error) {
            console.error('Failed to fetch or validate session:', error);
            localStorage.removeItem('userSession');
        }
    };

    const updateUI = (user) => {
        const { title, firstName, lastName, isAdmin } = user;
        const userGreeting = document.querySelector('.userGreeting');
        const loginButton = document.getElementById('Login-Button');
        const userIcon = document.getElementById('loginIcon');
        const drawerBox = document.getElementById("drawerBox")
        if (!isAdmin) {
            userGreeting.textContent = `${title} ${firstName} ${lastName}`;
            loginButton.classList.add('hidden-class');
            userIcon.classList.replace('login_icon', 'login_icon-visible');
            drawerBox.innerHTML = "";
            drawerBox.innerHTML = `
                <div class="profile-wrapper">
                    <i class="fa-duotone fa-circle-user"></i>
                    <span id="userId">${title} ${firstName} ${lastName}</span>
                </div>
                <hr>
                <ul class="links">
                    <li>
                        <a href="/dashboard/edit-profile">
                            <i class="fa-duotone fa-chart-tree-map fa-lg"></i>
                            <p>DashBoard</p>
                        </a>
                    </li>
                    <li>
                        <a href="/dashboard/submit-report">
                            <i class="fa-duotone fa-file-chart-column fa-lg"></i>
                            <p>Submit Report</p>
                        </a>
                    </li>
                </ul>
            `;
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
    const websocketFunction = () => {
        function getTimeFormat(date) {
            const hour = date.getHours();
            const minutes = date.getMinutes();
            return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        }

        const ws = new WebSocket('ws://localhost:5000');

        ws.onopen = () => {
            console.log('connected to server');

            ws.send(JSON.stringify('hello server'))
        }

        ws.onmessage = (message) => {
            const socketData = JSON.parse(message.data);
            if (socketData.type === 'update') {
                // console.log(message, socketData.type);
            }
            if (socketData.type === 'new-comment') {
                const { comment } = socketData
                console.log(comment);
                populateComments(comment);
            }
        };
        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };
        document.getElementById('commentForm').addEventListener('submit', function (e) {
            e.preventDefault();

            const commentText = document.getElementById('commentText').value;
            const userName = `${user.firstName} ${user.lastName}`;
            const date = new Date();

            try {
                if (commentText.trim() !== '') {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            type: 'comment',
                            name: userName,
                            content: commentText,
                            time: getTimeFormat(date)
                        }))
                        document.getElementById('commentText').value = ''
                    }
                }
            } catch (err) {
                console.log(err);
            }
        });
        function populateComments(data) {
            const commentContainer = document.getElementById('comments');
            commentContainer.innerHTML = ''
            data.forEach(comment => {
                const commentElement = createCommentElement(comment);
                commentContainer.appendChild(commentElement);
            });
        }
        // async function getUserName() {
        //     try {
        //         const response = await fetch('/check-session');
        //         const user = await response.json();
        //         return `${user.firstName}`;
        //     } catch (error) {
        //         return 'Guest'; // Fallback to 'Guest' in case of error
        //     }
        // }


        function formatTime(date) {
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);

            if (diffInSeconds < 60) {
                return `${diffInSeconds}s ago`;
            }

            const diffInMinutes = Math.floor(diffInSeconds / 60);
            if (diffInMinutes < 60) {
                return `${diffInMinutes}m ago`;
            }

            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `sent at ${hours}:${minutes}`;
        }
        function createCommentElement(comment) {
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

            commentElement.appendChild(header);
            commentElement.appendChild(time);
            commentElement.appendChild(content);

            return commentElement;
        }
    }
    const menuBtn = document.getElementById("menu-btn");
    const closeBtn = document.getElementById("close-btn");
    const drawer = document.getElementById("drawer");

    menuBtn.addEventListener("click", () => {
        drawer.classList.add("open");
    });

    closeBtn.addEventListener("click", () => {
        drawer.classList.remove("open");
    });
});
