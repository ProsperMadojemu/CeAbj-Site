document.addEventListener('DOMContentLoaded', async () => {
    // Fetch session data
    // fetch('/check-session')
    // .then(response => response.json())
    // .then(sessionData => {
    //     if (sessionData.email && sessionData.isAdmin) {
    //         // Fetch admin data from getalldata route
    //         fetch('/getalldata')
    //             .then(response => response.json())
    //             .then(data => {
    //                 // Check if the logged-in user is an admin
    //                 const admin = data.admin.find(a => a.email === sessionData.email);
    //                 if (!admin) {
    //                     window.location.href = '/404';
    //                 }
    //             })
    //             .catch(error => {
    //                 console.error('Error fetching data:', error);
    //                 window.location.href = '/404';
    //             });
    //     } else {
    //         window.location.href = '/login';
    //     }

    //     const logoutButton = document.getElementById('Logout-Button');
    //     logoutButton.addEventListener('click', () => {
    //         fetch('/logout', { method: 'POST' })
    //             .then(() => {
    //                 window.location.reload();
    //             })
    //             .catch(error => {
    //                 console.error('Error during logout:', error);
    //             });
    //     });
    // })
    // .catch(error => {
    //     console.error('Error checking session:', error);
    //     window.location.href = '/login';
    // });
    
    document.getElementById('DrawerIcon').addEventListener('click', function() {
        const navbar = document.querySelector('.vertical-navbar');
        if (!navbar.classList.contains('active')) {
            navbar.classList.add('active');
        }else {
            navbar.classList.remove('active');
        }
    });
    
    document.getElementById('CloseDrawer').addEventListener('click', function() {
        const navbar = document.querySelector('.vertical-navbar');
        if (navbar.classList.contains('active')) {
            navbar.classList.remove('active');
        }
    });

    let rangeValue = 0;
    const rangeInput = document.getElementById('limit');
    const rangeValueInput = document.getElementById('range');
    rangeInput.addEventListener("change", function(){
        rangeValue = rangeInput.value
        rangeValueInput.value = rangeValue
    })
    rangeValueInput.addEventListener("input", function(){
        rangeValue = rangeValueInput.value
        rangeInput.value = rangeValue
    });

    const showSchedulerBtn = document.getElementById('show_meeting_sch');
    const schedulerBody = document.querySelector('.meeting-form-container');
    showSchedulerBtn.addEventListener('click', function() {
        showSchedulerBtn.classList.toggle('no-action')
        if (schedulerBody.style.display === "none"){
            schedulerBody.style.display = "block"
        } else {
            schedulerBody.style.display = "none"
        }
    })

});
