document.addEventListener('DOMContentLoaded', async () => {
    let registrationDt = ''; // Date string from the server
    // Fetch session data
    fetch('/check-session')
    .then(response => response.json())
    .then(sessionData => {
        if (sessionData.email && sessionData.isAdmin) {
            // Fetch admin data from getalldata route
            fetch('/api/user/getalldata')
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
            fetch('/api/user/logout', { method: 'POST' })
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


    function getDateRange(option) {
        const today = new Date();
        let startDate;
        let endDate = new Date(today);

        switch (option) {
            case 'lastSunday':
                const dayOfWeek = today.getDay();
                const daysSinceSunday = (dayOfWeek + 7 - 0) % 7;
                endDate.setDate(today.getDate() - daysSinceSunday);
                startDate = new Date(endDate);
                startDate.setDate(endDate.getDate() - 6);
                break;
            case 'pastMonth':
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            break;
            default:
            startDate = new Date(0);
        }

        return { $gte: startDate, $lt: endDate };
    }

    const tableBody = document.querySelector('#usersTableData tbody');
    const loaderBody = document.querySelector('.loader');
    const searchBtn = document.getElementById('searchButton');
    const searchBody = document.querySelector('.search-parent');
    const navbar = document.querySelector('.vertical-navbar');
    const optionsBody = document.querySelector('#optionsBody');
    const filterButton = document.querySelector('.filter-button');
    const dateCheckBoxes = document.querySelectorAll('.Dates');
    const statusCheckBoxes = document.querySelectorAll('.Status_');
    const filtersBody = document.querySelector('#filters-check')
    let limit = 10;
    let isLoading = true;
    let isRendered = false;
    let page = 1;
    let searchQuery = "";
    let sort= "SubmissionDate,desc";
    let pcfFilter = [];
    let statusFilter = [];
    let dateFilter = [];
    let currentPagee = 1
    function loader (){
        if (isLoading) {
            loaderBody.style.display = "flex"
        } else {
            loaderBody.style.display = "none"
        }
    }

    searchBtn.addEventListener('click', () => {
        if (!searchBody.classList.contains('active')){
            searchBody.classList.add('active')
        }
    });
    
    async function fetchReports() {
        try {
            const url = `/api/reports/search?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&sort=${sort}&pcf=${pcfFilter}&date=${dateFilter}&status=${statusFilter}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.error) {
                console.error("Error fetching reports data:", data.message);
                return;
            }
            if (response.ok) {
                window.location.hash = url
                isLoading = false
                loader();
            }
            currentPagee = data.page
            renderReportsTable(data.reports);
            renderCellsCheckBoxes(data.pcfs);
            updatePagination(data.page, data.totalPages);
            document.querySelector('.entries').innerHTML = 
                `Showing ${data.reports.length} entries of ${data.totalDocuments}`
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    
    function renderCellsCheckBoxes (cells) {
        if (isRendered) {return}
        isRendered = true
        cells.forEach(cell => {
            const div = document.createElement('div');
            div.classList.add('filter-group');
            div.innerHTML = `
                <label for="${cell}">${cell}</label>
                <input type="checkbox" class="CellsBox" id="${cell}" value="${cell}">
            `
            filtersBody.appendChild(div);
        })
        renderedBoxes();
    }

    function renderReportsTable(reports) {
        tableBody.innerHTML = "";   
        let count = (currentPagee - 1) * limit + 1;
        if (reports.length <= 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td colspan= "8" style= "border: none;">No result found</td>
            `;
            tableBody.appendChild(row);
        }
        reports.forEach(report => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${count++}</td>
                <td>${report.FirstName} ${report.LastName || "N/A"}</td>
                <td>${report.PhoneNumber || "N/A"}</td>
                <td>${report.NameOfPcf || "N/A"}</td>
                <td>${report.CellName}</td>
                <td>${report.ServiceAttendance}</td>
                <td>${report.SundayFirstTimers}</td>
                <td>${report.CellMeetingAttendance}</td>
                <td>${report.CellFirstTimers}</td>
                <td>₦${report.offering}</td>
                <td>${new Date(report.SubmissionDate).toDateString()}, ${new Date(report.SubmissionDate).toLocaleTimeString()}</td>
                <td class="status ${report.status}">${report.status}</td>
                <td>
                    <div class="verification-container">
                        <button type="button" title="verification" ${report.status === 'Approved' ? 'disabled' : ''} id="approve-button">
                            <i class="fa-solid fa-circle-check"></i>
                        </button>
                        <button type="button" title="verification" ${report.status === 'Denied' ? 'disabled' : ''} id="deny-button">
                            <i class="fa-solid fa-circle-xmark"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        statusButtonsFunction(reports);
    }

    function statusButtonsFunction (reports){
        const approveButton = document.querySelectorAll('#approve-button');
        const denyButton = document.querySelectorAll('#deny-button');

        approveButton.forEach((button, index) => {
            button.addEventListener("click",() => {
                const report = reports[index]
                updateStatus('Approved', report._id)
            })
        })
        denyButton.forEach((button, index) => {
            button.addEventListener("click",() => {
                const report = reports[index]
                updateStatus('Denied', report._id)
            })
        })
    }

    async function updateStatus(status, id) {
        try {
            const response = await fetch(`/api/reports/status/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: status })
            });
            if (!response.ok) {
                throw new Error("Failed to find report.");
            }
            fetchReports();
        } catch (error) {
            console.log(error);
        }
    }

    function updatePagination(currentPage, totalPages) {
        document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById("prevPage").disabled = currentPage <= 1;
        document.getElementById("nextPage").disabled = currentPage >= totalPages;
    }

    function updateFilters() {
        page = 1;
        loader();
        fetchReports();
    }
    let debounceTimer;
    document.getElementById("searchInput").addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchQuery = e.target.value;
            page = 1;
            fetchReports();
        }, 300);
    });

    document.getElementById('clearFiltersBtn').addEventListener("click", (e)=> {
        const checkBoxes = document.querySelectorAll('input[type="checkbox"]');
        checkBoxes.forEach((box) => {
            box.checked = false;
        });
        pcfFilter=[]
        dateFilter=[]
        updateFilters();
    })

    function renderedBoxes() {
        const cellsCheckBoxes = document.querySelectorAll('.CellsBox');
        cellsCheckBoxes.forEach(boxes => {
            boxes.addEventListener("change", (e) => {
                if (e.target.checked) {
                    pcfFilter.push(e.target.value);
                } else {
                    pcfFilter = pcfFilter.filter(item => item !== e.target.value);
                }
                updateFilters();
            });
        });
    }
    statusCheckBoxes.forEach(boxes => {
        boxes.addEventListener("change", (e) => {
            if (e.target.checked) {
                statusFilter.push(e.target.value);
            } else {
                statusFilter = statusFilter.filter(item => item !== e.target.value);
            }
            updateFilters();
        });
    });
    dateCheckBoxes.forEach(box => {
        box.addEventListener("change", (e) => {
            if (e.target.checked) {
                dateCheckBoxes.forEach(otherBox => {
                    if (otherBox !== e.target) {
                        otherBox.checked = false;
                    }
                });
                dateFilter = [e.target.value];
            } else {
                dateFilter = [];
            }
            
            updateFilters();
        });
    });

    document.getElementById("sortOptions").addEventListener("change", (e) => {
        const sortValue = e.target.value;
        sort = sortValue
        page = 1;
        fetchReports();
    });
    document.getElementById("prevPage").addEventListener("click", () => {
        if (page > 1) {
            page--;
            fetchReports();
        }
    });
    document.getElementById("nextPage").addEventListener("click", () => {
        page++;
        fetchReports();
    });
    filterButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (optionsBody.style.display === 'none' || optionsBody.style.display === '') {
            optionsBody.style.display = 'flex';
        } else {
            optionsBody.style.display = 'none';
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!optionsBody.contains(e.target) && e.target !== filterButton) {
            optionsBody.style.display = 'none';
        }
    });
    document.addEventListener('click', (e) => {
        if (!searchBody.contains(e.target) && e.target !== searchBtn) {
            searchBody.classList.remove('active');
        }
    });
    fetchReports();
    

    const downloadButton = document.getElementById("clickmetodownload");
    downloadButton.addEventListener("click", async function () {
        const originalLimit = limit;
        const originalPage = page;
    
        limit = 0;
        page = 1;
        await fetchReports();
    
        const table2excel = new Table2Excel();
        table2excel.export(document.querySelectorAll("#usersTableData"));
    
        limit = originalLimit;
        page = originalPage;
    
        fetchReports();
    });
    
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
    let toastBox = document.getElementById('toastBox');
    let toastCount = 0
    const faSuccess = `<i class="fa-solid fa-bell wobble-hor-top" style= "color:blue"></i>`;
    async function showToast(response) {
        toastCount++
        let toast = document.createElement('div');
        toast.classList.add('toast');
        if (toastCount >= 3){
            toastCount = 1;
            toastBox.innerHTML = '';
        }
        toast.innerHTML = `${faSuccess} ${response}`;
        toastBox.appendChild(toast);
        setTimeout(()=> {
            toast.remove();
        }, 5000)
    }
    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
        console.log('connected to socket');
    }

    ws.onmessage = (event) => {
        const socketData = JSON.parse(event.data);
        const {message} = socketData
        if (message.type === 'report-in') {
            showToast(message.content);
        }
    }

    ws.onclose = () => {
        console.log('Disconnected from webSocket server');
    }

});