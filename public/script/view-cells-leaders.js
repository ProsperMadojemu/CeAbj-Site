document.addEventListener('DOMContentLoaded', async () => {
    
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
                        window.location.href = '../404.html';
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    window.location.href = '../404.html';
                });
        } else {
            window.location.href = '/pages/login.html';
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
        window.location.href = '/pages/login.html';
    });


    // Fetch all data and populate the table
    try {
        const response = await fetch('/getleadersdata');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        populateTable(data);
        handleCellName(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    function handleCellName(data) {
        const cellsAndLeaders = data.cellsAndLeaders;
        
    }

    function populateTable(data) {
        const tbody = document.querySelector('#usersTableData tbody');
        tbody.innerHTML = ''; // Clear existing rows
        const cellsAndLeaders = data.cellsAndLeaders;
        
        cellsAndLeaders.forEach((cellsAndLeaders, index) => {
            const row = document.createElement('tr');    
    
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${cellsAndLeaders.NameOfLeader}</td>
                <td>${cellsAndLeaders.PhoneNumber || 'Nill'}</td>
                <td>${cellsAndLeaders.LeaderPosition || 'Nill'}</td>
                <td>${cellsAndLeaders.NameOfCell || 'Nill'}</td>

            `;
            tbody.appendChild(row);
        });
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
    
    document.getElementById('view-filters-button').addEventListener('click', function(event) {
        event.stopPropagation();
        const viewFiltersButton = document.getElementById('view-filters');
        viewFiltersButton.classList.toggle('hidden');
    });
    
    document.addEventListener('click', function(event) {
        const viewFiltersButton = document.getElementById('view-filters');
        if (!viewFiltersButton.contains(event.target)) {
            viewFiltersButton.classList.add('hidden');
        }
    });
    
    
});