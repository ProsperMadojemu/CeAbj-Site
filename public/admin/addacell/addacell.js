document.addEventListener('DOMContentLoaded', async() => {
    // Fetch session data
    fetch('/check-session')
    .then(response => response.json())
    .then(sessionData => {
        if (sessionData.email && sessionData.isAdmin) {
            // Fetch admin data from getalldata route
            fetch('/getalldata')
                .then(response => response.json())
                .then(data => {
                    // Check if the logged-in user is an admin
                    const admin = data.admin.find(a => a.email === sessionData.email);
                    if (!admin) {
                            window.location.href = '/404';
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    window.location.href = '/404';
                });
        } else {
            window.location.href = '/login';
        }

        const logoutButton = document.getElementById('Logout-Button');
        logoutButton.addEventListener('click', () => {
            fetch('/logout', { method: 'POST' })
                .then(() => {
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error during logout:', error);
                });
        });
    })
    .catch(error => {
        console.error('Error checking session:', error);
        window.location.href = '/login';
    });

    const navbar = document.querySelector('.vertical-navbar');
    document.getElementById('DrawerIcon').addEventListener('click', function() {
        if (!navbar.classList.contains('active')) {
            navbar.classList.add('active');
        }else {
            navbar.classList.remove('active');
        }
    });
    
    document.getElementById('CloseDrawer').addEventListener('click', function() {
        if (navbar.classList.contains('active')) {
            navbar.classList.remove('active');
        }
    });

    window.addEventListener('resize', ()=> {
        if (navbar.classList.contains('active')) {
            navbar.classList.remove('active');
        }
    })

    document.getElementById('CellType').addEventListener('change', function() {
        handleSelection(this.value);
    });

    function handleSelection (formCellType) { 
        const formPcfGroup = document.querySelector('#pcf-name');
        const formSeniorCellGroup = document.querySelector('#senior-cell-name');
        const formCellGroup = document.querySelector('#cell-name');
        
        if (formCellType === 'SENIOR-CELL') {
            formPcfGroup.classList.remove('hidden');
            formSeniorCellGroup.classList.remove('hidden');
            formCellGroup.classList.remove('hidden');
        } else if (formCellType === 'CELL') {
            formPcfGroup.classList.remove('hidden');
            formSeniorCellGroup.classList.remove('hidden');
            formCellGroup.classList.remove('hidden');
        } 
        else {
            formPcfGroup.classList.remove('hidden');
            formSeniorCellGroup.classList.add('hidden');
            formCellGroup.classList.remove('hidden');
        }
    }
    const messageOverlay = document.getElementById('message-prompt');
    const messageOverlayText = document.getElementById('message-text');
    const messageOverlaySign = document.getElementById('message-sign');

    function showPrompt(message) {
        messageOverlay.classList.remove('hidden');
        messageOverlayText.textContent = message;
        if (messageOverlay.timeoutId) {
            clearTimeout(messageOverlay.timeoutId);
        }
        // messageOverlay.timeoutId = setTimeout(() => {
        //     hidePrompt();
        // }, 5000);
    }

    function showErrorPrompt(message) {
        messageOverlay.classList.remove('hidden');
        messageOverlaySign.classList.remove('fa-spinner-third', 'fa-2xl');
        messageOverlaySign.classList.add('fa-solid', 'fa-xmark', 'fa-2xl');
        messageOverlayText.textContent = message;
        if (messageOverlay.timeoutId) {
            clearTimeout(messageOverlay.timeoutId);
        }   
        messageOverlay.timeoutId = setTimeout(() => {
            hidePrompt();
        }, 3000);
    }

    function hidePrompt() {
        messageOverlay.classList.add('hidden');
        messageOverlaySign.classList.remove('fa-solid', 'fa-xmark', 'fa-2xl');
        messageOverlaySign.classList.add('fa-spinner-third', 'fa-2xl');
    }

    document.getElementById('submitnewcellbutton').addEventListener('click', async function(event) {
        event.preventDefault();
        const formLeadersName = document.getElementById('NameOfLeader').value;
        const formLeadersPosition = document.getElementById('LeaderPosition').value;
        const formCellType = document.getElementById('CellType');
        if (!formLeadersName || !formLeadersPosition || !formCellType) {
            showErrorPrompt('Please fill out all necessary fields');
        } else {
            try {
                const newCellForm = document.getElementById('addacellform');
                const formData = new FormData(newCellForm);
                const formJSON = Object.fromEntries(formData.entries());

                const response = await fetch('/submitnewcell', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formJSON)
                });

                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.error || 'Failed to Register Cell');
                }

                showPrompt("Cell Registration Successfull");
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
                
            } catch (error) {
                showErrorPrompt('An error occurred: ' + error.message);
            }
        }
    });
})