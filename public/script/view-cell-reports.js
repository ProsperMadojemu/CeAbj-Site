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
    
    // Show skeleton rows while fetching data
    async function showSkeletonRows(tableBody) {
        for (let i = 0; i < 3; i++) {
            const row = document.createElement('tr');
            row.classList.add('skeleton');
            for (let j = 0; j < 5; j++) {
                const cell = document.createElement('td');
                cell.colSpan = 10; // Adjust colspan for skeleton rows
                row.appendChild(cell);
            }
            tableBody.appendChild(row);
        }
    }
    
    // Hide skeleton rows after fetching data
    function hideSkeletonRows(tableBody) {
        const skeleton = tableBody.querySelectorAll('.skeleton');
        skeleton.forEach(row => row.remove());
    }
    
    // Function to format a date in the format YY/MM/DD
    function formatDateToYYMMDD(dateString) {
        if (!dateString || dateString === 'Nill') {
            return 'N/A'; // Return 'N/A' if the date is invalid or not available
        }
        const date = new Date(dateString); // Parse the date string to a Date object
        const year = date.getFullYear().toString(); // Get the full year
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Add 1 to month (0-based index) and pad with zero
        const day = String(date.getDate()).padStart(2, '0'); // Pad day with zero
    
        return `${year}/${month}/${day}`; // Return formatted date
    }
    
    let currentPage = 1;
    const limit = 10; // Number of results per page
    
    // Fetch data from both endpoints
    async function fetchData(page = 1) {
        const searchTerm = document.getElementById('searchInput').value.trim();
        try {
            // Construct URLs for both cell reports and leaders
            const cellReportsUrl = searchTerm
                ? `/cellReportSearch?q=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`
                : `/cellReportSearch?page=${page}&limit=${limit}`;
            const leadersUrl = searchTerm
                ? `/leadersSearch?q=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`
                : `/leadersSearch?page=${page}&limit=${limit}`;
    
            // Fetch data concurrently
            const [cellReportsResponse, leadersResponse] = await Promise.all([
                fetch(cellReportsUrl),
                fetch(leadersUrl)
            ]);
    
            const cellReportsData = await cellReportsResponse.json();
            const leadersData = await leadersResponse.json();
    
            hideSkeletonRows(tableBody);
            displayCombinedData(cellReportsData.cellReports, leadersData.cells); // Combine and display data
            updatePaginationControls(cellReportsData.currentPage, cellReportsData.totalPages);
        } catch (error) {
            console.error('Error during search:', error);
        }
    }
    
    // Function to close popup (if any)
    function closePopup() {
        const popUp = document.getElementById('updatePromptParent');
        popUp.classList.add('hidden');
    }
    
    // Function to display combined data in the table
    function displayCombinedData(cellReports, leaders) {
        tableBody.innerHTML = ''; // Clear previous data

        if (cellReports.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="10">No reports found.</td></tr>';
            return;
        }

        // Organize leaders by PCF
        const pcfLeaders = leaders.filter(leader => leader.CellType === 'PCF');
        console.log('PCF Leaders:', pcfLeaders);

        // Organize reports by NameOfCell and PhoneNumber
        const reportsByCell = {};
        cellReports.forEach(report => {
            const cellKey = `${report.CellName}_${report.PhoneNumber}`;
            if (!reportsByCell[cellKey]) {
                reportsByCell[cellKey] = [];
            }
            reportsByCell[cellKey].push(report);
        });

        console.log('Reports by Cell:', reportsByCell);


        // Display each PCF leader and their corresponding reports
        pcfLeaders.forEach(pcfLeader => {
            const leaderName = pcfLeader.NameOfLeader || 'N/A';
            const leaderPhone = pcfLeader.PhoneNumber || 'N/A';
            const pcfName = pcfLeader.NameOfPcf || 'N/A';
        
            // Create a row for the PCF leader
            const leaderRow = document.createElement('tr');
            leaderRow.innerHTML = `
            <td colspan="10" class="Pcf-Rows">
                ${pcfName} PCF ${leaderName} (${leaderPhone})
            </td>
            `;
            let count = 1;
            tableBody.appendChild(leaderRow);
        
            // Find reports under this PCF
            const leaderReports = cellReports.filter(report => report.NameOfPcf === pcfName);
        
            if (leaderReports.length === 0) {
                // Show a message if no reports match the current PCF leader
                const noReportsRow = document.createElement('tr');
                noReportsRow.innerHTML = `
                    <td colspan="10" class="no-reports">
                    No Reports Found for this PCF Leader
                    </td>
                `;
                tableBody.appendChild(noReportsRow);
        
            } else {
            // Display each report under the current leader
            leaderReports.forEach(report => {
                const submissionDate = report.SubmissionDate ? formatDateToYYMMDD(report.SubmissionDate) : 'N/A';

                const reportRow = document.createElement('tr');
                reportRow.innerHTML = `
                    <td>${count++}</td>
                    <td>${report.FirstName} ${report.LastName || 'N/A'}</td>
                    <td>${report.PhoneNumber || 'N/A'}</td>
                    <td>${report.CellName || 'N/A'}</td>
                    <td>${report.ServiceAttendance || 'N/A'}</td>
                    <td>${report.SundayFirstTimers || 'N/A'}</td>
                    <td>${report.CellMeetingAttendance || 'N/A'}</td>
                    <td>${report.CellFirstTimers || 'N/A'}</td>
                    <td>${report.offering || 'N/A'}</td>
                    <td>${submissionDate}</td>
                `;
                tableBody.appendChild(reportRow);
            });
        }
    });}


        
    // Update pagination controls
    function updatePaginationControls(currentPage, totalPages) {
        document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === totalPages;
    }
    
    document.getElementById('searchButton').addEventListener('click', () => {
        currentPage = 1;
        fetchData(currentPage);
    });
    
    // Debounce function for input
    let debounceTimer;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentPage = 1;
            fetchData(currentPage);
        }, 300); // 300 ms debounce
    });
    
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchData(currentPage);
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        currentPage++;
        fetchData(currentPage);
    });
    
    // Fetch initial data
    fetchData(currentPage);
    

    const messageOverlay = document.getElementById('message-prompt');
    const messageOverlayText = document.getElementById('message-text');
    const messageOverlaySign = document.getElementById('message-sign');

    // Function to show prompt
    function showPrompt(message) {
        messageOverlay.classList.remove('hidden');
        messageOverlayText.textContent = message;
        if (messageOverlay.timeoutId) {
            clearTimeout(messageOverlay.timeoutId);
        }
        messageOverlay.timeoutId = setTimeout(() => {
            hidePrompt();
        }, 5000);
    }

    // Function to show error prompt
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

    // Function to hide prompt
    function hidePrompt() {
        messageOverlay.classList.add('hidden');
        messageOverlaySign.classList.remove('fa-solid', 'fa-xmark', 'fa-2xl');
        messageOverlaySign.classList.add('fa-spinner-third', 'fa-2xl');
    }
});