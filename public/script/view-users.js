document.addEventListener('DOMContentLoaded', async () => {
    let registrationDt = ''; // Date string from the server
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

    const tableBody = document.querySelector('#usersTableData tbody');
    showSkeletonRows(tableBody);

    const threeDots = document.getElementById('three-dots-download');

    function threeDotsToggleHandler(e) {
        e.preventDefaule();

        threeDots.classList.toggle('hidden')
        
    }

    function showSkeletonRows(tableBody) {
        for (let i = 0; i < 4; i++) {
            const row = document.createElement('tr');
            row.classList.add('skeleton');
            for (let j = 0; j < 3; j++) {
                const cell = document.createElement('td')
                cell.colSpan = 8;
                row.appendChild(cell);
            }
            tableBody.appendChild(row);
        }
    };

    function hideSkeletonRows(tableBody) {
        const skeleton = tableBody.querySelectorAll('.skeleton')
        skeleton.forEach(row => row.remove());
    }
        
    // Function to format a date in the format YY/MM/DD
    function formatDateToYYMMDD(dateString) {
        if (!dateString || dateString === 'Nill') {
            return 'N/A'; // Return 'N/A' if the date is invalid or not available
        }
        const date = new Date(dateString); // Parse the date string to a Date object
        const year = date.getFullYear().toString(); // Get the last two digits of the year
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Add 1 to month (0-based index) and pad with zero
        const day = String(date.getDate()).padStart(2, '0'); // Pad day with zero

        return `${year}/${month}/${day}`; // Return formatted date
    }

    let currentPage = 1;
    const limit = 10; // Number of results per page

    async function fetchSearchResults(page = 1) {
        const searchTerm = document.getElementById('searchInput').value.trim();

        try {
            // Construct the URL with searchTerm if present
            const url = searchTerm 
                ? `/search?q=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`
                : `/search?page=${page}&limit=${limit}`;

            const response = await fetch(url);
            const searchResults = await response.json();
            hideSkeletonRows(tableBody);
            displayUsers(searchResults.users);
            updatePaginationControls(searchResults.currentPage, searchResults.totalPages);

        } catch (error) {
            console.error('Error during search:', error);
        }
    }

    function displayUsers(users) {
        const tableBody = document.querySelector('#usersTableData tbody');
        tableBody.innerHTML = ''; // Clear previous data
    
        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8">No users found.</td></tr>';
            return;
        }
    
        let count = (currentPage - 1) * limit + 1; // Adjust count based on the current page
    
        users.forEach(user => {
            // Handle the case where user._doc is present
            const userData = user._doc || user;
    
            const row = document.createElement('tr');
            const registrationDate = userData.registrationDate ? formatDateToYYMMDD(userData.registrationDate) : 'N/A';
    
            row.innerHTML = `
                <td>${count++}</td>
                <td>${userData.FirstName || 'N/A'} ${userData.LastName || 'N/A'}</td>
                <td>${userData.PhoneNumber || 'N/A'}</td>
                <td>${userData.Church || 'N/A'}</td>
                <td>${userData.LeadershipPosition || 'N/A'}</td>
                <td>${user.NameOfCell || 'N/A'}</td>
                <td>${user.Department || 'N/A'}</td>
                <td>${registrationDate}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    

    function updatePaginationControls(currentPage, totalPages) {
        document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === totalPages;
    }
    // document.addEventListener('keydown')

    document.getElementById('searchButton').addEventListener('click', () => {
        currentPage = 1;
        fetchSearchResults(currentPage);
    });

    document.getElementById('searchInput').addEventListener('input', (e) => { //changed to input
        // Perform your action here
        setTimeout(() => {
            currentPage = 1;
            fetchSearchResults(currentPage);
        }, 100);
    });

    // create a refresh animation


    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchSearchResults(currentPage);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        currentPage++;
        fetchSearchResults(currentPage);
    });

    // Fetch initial data
    fetchSearchResults(currentPage);

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
});
