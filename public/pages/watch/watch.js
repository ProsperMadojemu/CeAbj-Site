document.addEventListener('DOMContentLoaded', () => {
    // const logOut = document.querySelector('.logout_button');
    fetch('/check-session')
        .then(response => response.json())
        .then(user => {
            if (user.email && !user.isAdmin) {
                const loginIcon = document.getElementById('loginIcon');
                loginIcon.classList.remove('login_icon');
                loginIcon.classList.add('login_icon-visible');

                const welcomeGreeting = document.querySelector('.userGreeting');
                const cancelDropdown = document.getElementById('cancel-click');
                const userIcon = document.querySelector('#loginIcon');
                const userDropMenu = document.querySelector('#user-dropdown');
                const logoutButton = document.getElementById('Logout-Button');

                userIcon.addEventListener('click', function (event) {
                    event.stopPropagation();
                    userDropMenu.classList.remove('login-content-before-click');
                    userDropMenu.classList.add('login-content-after-click');
                });

                document.addEventListener('click', function (event) {
                    if (!userDropMenu.contains(event.target) && !userIcon.contains(event.target)) {
                        userDropMenu.classList.remove('login-content-after-click');
                        userDropMenu.classList.add('login-content-before-click');
                    }
                });

                cancelDropdown.addEventListener('click', function () {
                    userDropMenu.classList.remove('login-content-after-click');
                    userDropMenu.classList.add('login-content-before-click');
                });

                welcomeGreeting.innerHTML = `Hi, ${user.firstName} ${user.lastName}`;
                logoutButton.addEventListener('click', () => {
                    fetch('/api/user/logout', { method: 'POST' })
                        .then(() => {
                            window.location.reload();
                        });
                });
            } else {
                window.location.href = '/login';
            }

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
        })
        .catch(error => {
            console.error('Error checking session:', error);
        });


});
