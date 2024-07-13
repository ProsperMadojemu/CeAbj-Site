document.addEventListener('DOMContentLoaded', () => {
    // const logOut = document.querySelector('.logout_button');
    fetch('/check-session')
    .then(response => response.json())
    .then(user => {
        if (user.email) {
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
            window.location.href = '../pages/login.html';
        }
    })
    .catch(error => {
        console.error('Error checking session:', error);
    });
});
