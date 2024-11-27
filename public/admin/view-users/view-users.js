document.addEventListener('DOMContentLoaded', async () => {
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
                        window.location.href = '/404';
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

    const tableBody = document.querySelector('#usersTableData tbody');
    const loaderBody = document.querySelector('.loader');
    const searchBtn = document.getElementById('searchButton');
    const searchBody = document.querySelector('.search-parent');
    const departmentCheckBoxes = document.querySelectorAll('.Departments');
    const navbar = document.querySelector('.vertical-navbar');
    const optionsBody = document.querySelector('#optionsBody');
    const filterButton = document.querySelector('.filter-button');
    const leadersCheckBoxes = document.querySelectorAll('.Leaders');
    let limit = 10;
    let isLoading = true;
    let page = 1;
    let searchQuery = "";
    let sort;
    let DesignationFilter = [];
    let departmentFilter = [];
    let currentPagee = 1
    function loader() {
        if (isLoading) {
            loaderBody.style.display = "flex"
        } else {
            loaderBody.style.display = "none"
        }
    }

    searchBtn.addEventListener('click', () => {
        if (!searchBody.classList.contains('active')) {
            searchBody.classList.add('active');
        }
    });


    async function fetchUsers() {
        try {
            const url = `/api/users/search?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&sort=${sort}&Designation=${DesignationFilter}&department=${departmentFilter}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                console.error("Error fetching user data:", data.message);
                return;
            }
            if (response.ok) {
                isLoading = false
                loader();
            }
            currentPagee = data.page
            renderUserTable(data.users);
            updatePagination(data.page, data.totalPages);
            document.querySelector('.entries').innerHTML =
                `Showing ${data.users.length} entries of ${data.totalDocuments}`
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function renderUserTable(users) {
        tableBody.innerHTML = "";
        let count = (currentPagee - 1) * limit + 1;
        if (users.length <= 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td colspan= "8" style= "border: none;">No result found</td>
            `;
            tableBody.appendChild(row);
        }
        users.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${count++}</td>
                <td>${user._doc.FirstName} ${user._doc.LastName || "N/A"}</td>
                <td>${user._doc.Email || "N/A"}</td>
                <td>${user._doc.PhoneNumber || "N/A"}</td>
                <td>${user._doc.Church || "N/A"}</td>
                <td>${user._doc.Designation || "N/A"}</td>
                <td>${user.NameOfCell}</td>
                <td>${user.Department}</td>
                <td>${new Date(user._doc.registrationDate).toLocaleDateString()}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function updatePagination(currentPage, totalPages) {
        document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById("prevPage").disabled = currentPage <= 1;
        document.getElementById("nextPage").disabled = currentPage >= totalPages;
    }

    function updateFilters() {
        page = 1;
        loader();
        fetchUsers();
    }
    leadersCheckBoxes.forEach(boxes => {
        boxes.addEventListener("change", (e) => {
            if (e.target.checked) {
                DesignationFilter.push(e.target.value);
            } else {
                DesignationFilter = DesignationFilter.filter(item => item !== e.target.value);
            }
            updateFilters();
        });
    });
    departmentCheckBoxes.forEach(boxes => {
        boxes.addEventListener("change", (e) => {
            if (e.target.checked) {
                departmentFilter.push(e.target.value);
            } else {
                departmentFilter = departmentFilter.filter(item => item !== e.target.value);
            }
            updateFilters();
        });
    });
    let debounceTimer;
    document.getElementById("searchInput").addEventListener("input", (e) => {
        // if (e.target.value.length >= 3) {
        //     searchQuery = e.target.value;
        //     page = 1;
        //     fetchUsers();
        // }
        // if (e.target.value.length < 1) {
        //     page = 1;
        //     fetchUsers();
        // }
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchQuery = e.target.value;
            page = 1;
            fetchUsers();
        }, 300);
    });

    document.getElementById('clearFiltersBtn').addEventListener("click", (e) => {
        const checkBoxes = document.querySelectorAll('input[type="checkbox"]');
        checkBoxes.forEach((box) => {
            box.checked = false;
        });
        departmentFilter = []
        DesignationFilter = []
        updateFilters();
    })
    document.getElementById("sortOptions").addEventListener("change", (e) => {
        const sortValue = e.target.value;
        sort = sortValue
        page = 1;
        fetchUsers();
    });
    document.getElementById("prevPage").addEventListener("click", () => {
        if (page > 1) {
            page--;
            fetchUsers();
        }
    });
    document.getElementById("nextPage").addEventListener("click", () => {
        page++;
        fetchUsers();
    });
    filterButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (optionsBody.style.display === 'none' || optionsBody.style.display === '') {
            optionsBody.style.display = 'flex';
        } else {
            optionsBody.style.display = 'none';
        }
    });
    const downloadButton = document.getElementById("clickmetodownload");
    downloadButton.addEventListener("click", async function () {
        const originalLimit = limit;
        const originalPage = page;

        limit = 0;
        page = 1;
        await fetchUsers();

        const table2excel = new Table2Excel();
        table2excel.export(document.querySelectorAll("#usersTableData"));

        limit = originalLimit;
        page = originalPage;

        fetchUsers();
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
    fetchUsers();
    document.getElementById('DrawerIcon').addEventListener('click', function () {
        if (!navbar.classList.contains('active')) {
            navbar.classList.add('active');
        } else {
            navbar.classList.remove('active');
        }
    });
    document.getElementById('CloseDrawer').addEventListener('click', function () {
        if (navbar.classList.contains('active')) {
            navbar.classList.remove('active');
        }
    });
    window.addEventListener('resize', () => {
        if (navbar.classList.contains('active')) {
            navbar.classList.remove('active');
        }
    })

});
