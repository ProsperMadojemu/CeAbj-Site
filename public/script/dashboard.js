document.addEventListener('DOMContentLoaded', ()=>{
    fetch('../check-session')
    .then(response => response.json())
    .then(user => {
        if (user.email) {
            const loginIcon = document.getElementById('loginIcon'); // Declare loginIcon here
            loginIcon.classList.remove('login_icon');
            loginIcon.classList.add('login_icon-visible');

            const welcomeGreeting = document.querySelector('.userGreeting');
            const cancelDropdown = document.getElementById('cancel-click');
            const userIcon = document.querySelector('#loginIcon');
            const userDropMenu = document.querySelector('#user-dropdown');
            const logoutButton = document.getElementById('Logout-Button');
                
            welcomeGreeting.innerHTML = `Hi, ${user.firstName} ${user.lastName}`;
            logoutButton.addEventListener('click', () => {
                fetch('../logout', { method: 'POST' })
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

})



