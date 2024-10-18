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
        
            userIcon.addEventListener('click', function(event) {
                event.stopPropagation();
                userDropMenu.classList.remove('login-content-before-click');
                userDropMenu.classList.add('login-content-after-click');
            });
            
            document.addEventListener('click', function(event) {
                if (!userDropMenu.contains(event.target) && !userIcon.contains(event.target)) {
                    userDropMenu.classList.remove('login-content-after-click');
                    userDropMenu.classList.add('login-content-before-click');
                }
            });
            
            cancelDropdown.addEventListener('click', function() {
                userDropMenu.classList.remove('login-content-after-click');
                userDropMenu.classList.add('login-content-before-click');
            });
            
            welcomeGreeting.innerHTML = `Hi, ${user.firstName} ${user.lastName}`;
            logoutButton.addEventListener('click', () => {
                fetch('/logout', { method: 'POST' })
                    .then(() => {
                        window.location.reload();
                    });
            });
        } else {
            window.location.href = '/login';
        }
        fetchComments();
    document.getElementById('commentForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const commentText = document.getElementById('commentText').value;
        const userName = getUserName();
        const timeNow = new Date();

        if (commentText.trim() !== '') {
            const comment = {
                userName: userName,
                text: commentText,
                timestamp: timeNow.toISOString()
            };

            postComment(comment);
            document.getElementById('commentText').value = '';
        }
    });

    function getUserName() {
        return `${user.firstName} ${user.lastName}`
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

    function updateTimes() {
        const times = document.querySelectorAll('.comment-time');
        times.forEach(time => {
            const date = new Date(time.dataset.timestamp);
            time.textContent = formatTime(date);
        });
    }

    setInterval(updateTimes, 60000); // Update times every minute

    function fetchComments() {
        fetch('http://localhost:5000/comments')
            .then(response => response.json())
            .then(comments => {
                const commentsContainer = document.getElementById('comments');
                commentsContainer.innerHTML = '';
                comments.forEach(comment => {
                    const commentElement = createCommentElement(comment);
                    commentsContainer.appendChild(commentElement);
                });
                updateTimes();
            });
    }


    function postComment(comment) {
        fetch('http://localhost:5000/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(comment)
        })
        .then(response => response.json())
        .then(newComment => {
            const commentsContainer = document.getElementById('comments');
            const commentElement = createCommentElement(newComment);
            commentsContainer.appendChild(commentElement);
            updateTimes();
        });
    }

    function createCommentElement(comment) {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';

        const header = document.createElement('div');
        header.className = 'comment-header';
        header.textContent = comment.userName;

        const time = document.createElement('div');
        time.className = 'comment-time';
        time.dataset.timestamp = comment.timestamp;
        time.textContent = formatTime(new Date(comment.timestamp));

        const content = document.createElement('div');
        content.textContent = comment.text;

        commentElement.appendChild(header);
        commentElement.appendChild(time);
        commentElement.appendChild(content);
        
        return commentElement;
    }
    })
    .catch(error => {
        console.error('Error checking session:', error);
    });

    const ws = new WebSocket('ws://localhost:5000');

    ws.onopen = () => {
        console.log('connected to server');
        
        ws.send(JSON.stringify('hello server'))
    }

    ws.onmessage= (message) => {
        const data = message.data;
        console.log(message);
        
        try {
            console.log(data);
            
        } catch (error) {
             
        }
    }
    ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
    };
});
