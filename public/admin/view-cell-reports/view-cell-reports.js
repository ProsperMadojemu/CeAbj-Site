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
                        window.location.href = '/404';
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
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
    const reportTable = document.querySelector('#reports-table tbody');
    const reportTableHeader = document.getElementById('report-id');

    showReportSkeletonRows(reportTable);
    async function showReportSkeletonRows(reportTable) {
        reportTableHeader.classList.add('skeleton-text');
        for (let i = 0; i < 8; i++) {
            const row = document.createElement('tr');
            row.classList.add('reports-skeleton');
            reportTable.appendChild(row);
        }

    }    
    
    function hideReportSkeletonRows(reportTable) {
        const skeleton = reportTable.querySelectorAll('.reports-skeleton');
        reportTableHeader.classList.remove('skeleton-text');
        skeleton.forEach(row => row.remove());
    }
    
    // Hide skeleton rows after fetching data
    function hideSkeletonRows(tableBody) {
        const skeleton = tableBody.querySelectorAll('.skeleton');
        skeleton.forEach(row => row.remove());
    }

    // Helper function to get date range for filtering
    function getDateRange(option) {
        const today = new Date();
        let startDate;
        let endDate = new Date(today);

        switch (option) {
            case 'lastSunday':
                // Calculate the date for the last Sunday
                const dayOfWeek = today.getDay();
                const daysSinceSunday = (dayOfWeek + 7 - 0) % 7; // 0 is Sunday
                endDate.setDate(today.getDate() - daysSinceSunday);
                startDate = new Date(endDate);
                startDate.setDate(endDate.getDate() - 6);
                break;
            case 'pastMonth':
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                break;
            default:
                startDate = new Date(0); // Default to all time
        }

        return { $gte: startDate, $lt: endDate };
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
            displayPcfLeaders(leadersData.cells, cellReportsData.cellReports)
            // displayCombinedData(cellReportsData.cellReports, leadersData.cells); // Combine and display data
            updatePaginationControls(leadersData.currentPage, leadersData.totalPages);
        } catch (error) {
            console.error('Error during search:', error);
        }
    }
    
    const cancelPopup = document.getElementById('cancel-popup');

    cancelPopup.addEventListener('click', function() {
        closePopup();
    })
    
    // Function to close popup (if any)
    function closePopup() {
        const reportPopup = document.querySelector('.reports-parent');
        reportPopup.classList.add('hidden');
    }

    
    function displayPcfLeaders(leaders, reports) {
        let count = 1;
        tableBody.innerHTML = '';
        const pcfLeaders = leaders.filter(leader => leader.CellType === 'PCF');
        console.log(pcfLeaders);

        if (pcfLeaders.length === 0) {
            tableBody.innerHTML = `<tr><td colspan= "3">No PCF Leader found<td/><tr/>`;
            return;
        }

        pcfLeaders.forEach(pcfLeader => {
            const leadersRow = document.createElement('tr');

            leadersRow.innerHTML = `
            <td>${count++}</td>
            <td>${pcfLeader.NameOfLeader}</td>
            <td>${pcfLeader.NameOfPcf}</td>
            <td>
                <div class= "report-button">
                    <button id = "view-report-on-table">View Report</button>
                </div>
            </td>
            `;
            tableBody.appendChild(leadersRow)
        })
        displayLeadersReport(leaders);
    }
    
    function displayLeadersReport(leaders) {
        const viewReportButton = document.querySelectorAll('.report-button');
        viewReportButton.forEach((button, index) => {
            const leadersCellName = leaders[index];
            button.addEventListener('click', async () => {
                const reportPopup = document.querySelector('.reports-parent');
                reportPopup.classList.toggle('hidden');
                try {
                    if (!leadersCellName) {
                        throw new Error("No user data available for update.");
                    }
                    await getLeadersReport(leadersCellName._id);
                    reportTableHeader.innerHTML= `${leadersCellName.NameOfPcf}`
                } catch (error) {
                    console.error('Error updating leader:', error);
                }
                // document.body.removeChild(loader);
                console.log('click', leadersCellName , index);
            });
        });
    }


    async function getLeadersReport(leadersCellName) {
        console.log(leadersCellName);
        try {
            const response = await fetch(`/cellReportSearch/${leadersCellName}`);
            const data = await response.json()
            displayReports(data);
            hideReportSkeletonRows(reportTable);
        } catch (error) {
            console.error('Error fetching leader report:', error);
        }
    }

    function displayReports(data) {
        let count = 1;
        let leadersData = data.leadersUnderPcf;
        let cellReportsData = data.cellReports;
        let combinedCellName = [];
      
        combinedCellName = leadersData.filter(leader => {
          return cellReportsData.some(cellReport => {
            return cellReport.CellName === leader.NameOfCell || cellReport.PhoneNumber === leader.PhoneNumber;
          });
        }).map(leader => {
          const matchingReport = cellReportsData.find(cellReport => {
            return cellReport.CellName === leader.NameOfCell || cellReport.PhoneNumber === leader.PhoneNumber;
          });
          if (matchingReport) {
            return { ...leader, ...matchingReport };
          }
          return leader;
        });
      
        const currentDateRange = getDateRange('lastSunday');
        const startDate = currentDateRange.$gte;
        const endDate = currentDateRange.$lt;
      
        const reportTable = document.querySelector('#reports-table tbody');
        reportTable.innerHTML = ''
        combinedCellName.forEach(report => {
            const reportRow = document.createElement('tr');
            const reportDetails = document.createElement('tr');
            let status = 'Not Submitted';
            if (report.SubmissionDate) {
              const submissionDate = new Date(report.SubmissionDate);
              if (submissionDate >= startDate && submissionDate < endDate) {
                status = 'Submitted';
              }
            }
          
            reportRow.innerHTML = `
              <td title= "view Reports">${count++}</td>
              <td title= "view Reports">${report.NameOfLeader}</td>
              <td title= "view Reports">${report.NameOfCell}</td>
              <td title= "view Reports" class="statusColumn">${status} <i class="fa-solid fa-caret-down" id="arrow-down"></i></td>
            `;
            reportDetails.classList.add('hidden');          
            reportRow.addEventListener('click', () => {
                reportDetails.classList.toggle('hidden');
            });

            if (status === 'Not Submitted') {
                reportDetails.innerHTML = ` <tr class="report-table-subtable-row hidden">
                    <td colspan="4">
                        Report Has Not Been Submitted
                    </td>
                </tr> `
            }

            reportDetails.innerHTML = `
                <tr class="report-table-subtable-row hidden">
                    <td colspan="4">
                        <div class="report-table-subtable-wrapper">
                            <table class="report-table-subtable">
                                <thead>
                                    <tr class="grid-layout">
                                    <th>Name:</th>
                                    <th>Cell:</th>
                                    <th>PhoneNumber:</th>
                                    <th>Service Attendance:</th>
                                    <th>Sunday First Timers:</th>
                                    <th>Cell Meeting Attendance:</th>
                                    <th>Cell First Timers:</th>
                                    <th>offering: </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="grid-layout" >
                                    <td>${report.NameOfLeader}</td>
                                    <td>${report.NameOfCell}</td>
                                    <td>${report.PhoneNumber}</td>
                                    <td>${report.ServiceAttendance}</td>
                                    <td>${report.SundayFirstTimers}</td>
                                    <td>${report.CellMeetingAttendance}</td>
                                    <td>${report.CellFirstTimers}</td>
                                    <td>₦${report.offering}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            `;

            reportTable.appendChild(reportRow);
            reportTable.appendChild(reportDetails);
        });
    }
    
        
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