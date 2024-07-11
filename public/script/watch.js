document.addEventListener('DOMContentLoaded', () => {
    // fetch('/stream-key')
    // .then(response => {
    //     if (!response.ok) {
    //         throw new Error('Network response was not ok');
    //     }
    //     return response.json();
    // })
    // .then(data => {
    //     if (data.videoId) {
    //         const iframe = document.createElement('iframe');
    //         iframe.width = '640';
    //         iframe.height = '390';
    //         iframe.src = `https://www.youtube.com/embed/${data.videoId}?autoplay=1`;
    //         iframe.frameBorder = '0';
    //         iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    //         iframe.allowFullscreen = true;
    //         document.getElementById('player').appendChild(iframe);
    //     } else {
    //         console.log('No live broadcasts available');
    //     }
    // })
    // .catch(error => {
    //     console.error('Error fetching stream key:', error);
    // });

    const logOut = document.querySelector('.logout_button');
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

function onYouTubeIframeAPIReady() {
    var player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: 'YOUR_LIVE_BROADCAST_ID',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        // Do something when the video starts playing
    }
}
