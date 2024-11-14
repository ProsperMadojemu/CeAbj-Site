document.addEventListener("DOMContentLoaded", async () => {
    // Fetch session data
    fetch("/check-session")
    .then((response) => response.json())
    .then((sessionData) => {
        if (sessionData.email && sessionData.isAdmin) {
            // Fetch admin data from getalldata route
            fetch("/api/user/getalldata")
                .then((response) => response.json())
                .then((data) => {
                    // Check if the logged-in user is an admin
                    const admin = data.admin.find((a) => a.email === sessionData.email);
                    if (!admin) {
                        window.location.href = "/404";
                    }
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                    window.location.href = "/404";
                });
        } else {
            window.location.href = "/login";
        }

        const logoutButton = document.getElementById("Logout-Button");
        logoutButton.addEventListener("click", () => {
            fetch("/api/user/logout", { method: "POST" })
                .then(() => {
                    window.location.reload();
                })
                .catch((error) => {
                    console.error("Error during logout:", error);
                });
        });
    })
    .catch((error) => {
        console.error("Error checking session:", error);
        window.location.href = "/login";
    });

    function formatDateToYYMMDD(dateString) {
        if (!dateString || dateString === "Nill") {
            return "N/A"; // Return 'N/A' if the date is invalid or not available
        }
        const date = new Date(dateString); // Parse the date string to a Date object
        const year = date.getFullYear().toString(); // Get the last two digits of the year
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Add 1 to month (0-based index) and pad with zero
        const day = String(date.getDate()).padStart(2, "0"); // Pad day with zero

        return `${year}/${month}/${day}`; // Return formatted date
    }

    const tableBody = document.querySelector("#usersTableData tbody");
    const totalCells = document.querySelector(".total-container");
    const loaderBody = document.querySelector('.loader');
    const searchBtn = document.getElementById('searchButton');
    const searchBody = document.querySelector('.search-parent');
    const filtersBody = document.querySelector('#filters-check')
    const optionsBody = document.querySelector('#optionsBody');
    const filterButton = document.querySelector('.filter-button');
    const leadersCheckBoxes = document.querySelectorAll('.Leaders');
    let limit = 10;
    let isLoading = true;
    let isRendered = false;
    let page = 1;
    let searchQuery = "";
    let sort;
    let leadershipPositionFilter = [];
    let cellsFilter = [];
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


    async function fetchLeaders() {
        try {
            const url = `/api/leaders/search?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&sort=${sort}&leadersPosition=${leadershipPositionFilter}&cell=${cellsFilter}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.error) {
                console.error("Error fetching Leader data:", data.message);
                return;
            }
            if (response.ok) {
                isLoading = false
                loader();
            }
            currentPagee = data.page
            renderLeadersTable(data.leaders, data.leadersPipeline);
            renderCellsCheckBoxes(data.pcfs);
            updatePagination(data.page, data.totalPages);
            document.querySelector('.entries').innerHTML = 
                `Showing ${data.leaders.length} entries of ${data.totalDocuments}`
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

    function renderLeadersTable(leaders, leadersPipeline) {
        tableBody.innerHTML = "";  
        totalCells.innerHTML = "";
        let count = (currentPagee - 1) * limit + 1;
        if (leaders.length <= 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td colspan= "8" style= "border: none;">No result found</td>
            `;
            tableBody.appendChild(row);
        }
        leaders.forEach(leader => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${count++}</td>
                <td>${leader.NameOfLeader}</td>
                <td>${leader.PhoneNumber || "N/A"}</td>
                <td>${leader.LeaderPosition || "--"}</td>
                <td>${leader.NameOfPcf || "--"}</td>
                <td>${leader.NameOfSeniorCell || "--"}</td>
                <td>${leader.NameOfCell || "--"}</td>
                <td>${new Date(leader.SubmissionDate).toLocaleDateString()}</td>
                <td>
                    <div class="actions">
                        <button class="edit-leader">Edit</button>
                        <button class="delete-leader">Delete</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        attachDropdownEvents(leaders);
        leadersPipeline.forEach(leader=> {
            const span = document.createElement('span');
            span.innerHTML= `${leader._id}: ${leader.count}`
            totalCells.appendChild(span);
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
        fetchLeaders();
    }
    leadersCheckBoxes.forEach(boxes => {
        boxes.addEventListener("change", (e) => {
            if (e.target.checked) {
                leadershipPositionFilter.push(e.target.value);
            } else {
                leadershipPositionFilter = leadershipPositionFilter.filter(item => item !== e.target.value);
            }
            updateFilters();
        });
    });
    function renderedBoxes() {
        const cellsCheckBoxes = document.querySelectorAll('.CellsBox');
        cellsCheckBoxes.forEach(boxes => {
            boxes.addEventListener("change", (e) => {
                if (e.target.checked) {
                    cellsFilter.push(e.target.value);
                } else {
                    cellsFilter = cellsFilter.filter(item => item !== e.target.value);
                }
                updateFilters();
            });
        });
    }
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
        }, 500);
    });

    document.getElementById('clearFiltersBtn').addEventListener("click", (e)=> {
        const checkBoxes = document.querySelectorAll('input[type="checkbox"]');
        checkBoxes.forEach((box) => {
            box.checked = false;
        });
        departmentFilter = []
        leadershipPositionFilter=[]
        updateFilters();
    })
    document.getElementById("sortOptions").addEventListener("change", (e) => {
        const sortValue = e.target.value;
        sort = sortValue
        page = 1;
        fetchLeaders();
    });
    document.getElementById("prevPage").addEventListener("click", () => {
        if (page > 1) {
            page--;
            fetchLeaders();
        }
    });
    document.getElementById("nextPage").addEventListener("click", () => {
        page++;
        fetchLeaders();
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
    fetchLeaders();
    
    let toastBox = document.getElementById('toastBox');
    let toastCount = 0
    const faSuccess = `<i class="fa-solid fa-circle-check" style= "color:green"></i>`;
    const faError = `<i class="fa-solid fa-circle-x" style= "color:red"></i>`;
    const faInvalid = `<i class="fa-solid fa-circle-exclamation" style= "color:orange"></i>`;
    async function showToast(response) {
        let data;
        toastCount++
        if (response) {
            data = await response.json();
        }
        
        let toast = document.createElement('div');
        toast.classList.add('toast');
        if (toastCount >= 3){
            toastCount = 1;
            toastBox.innerHTML = '';
        }
        if (response.status === 201 || response.status === 200){
            toast.innerHTML = `${faSuccess} ${data.message}`;
        } else if(response.status === 400 || response.status === 401 || response.status === 500 || "error" in response){
            toast.classList.add('error');
            toast.innerHTML = `${faError} ${data.message || response.error}`;
        } else if(response.status === 404){
            toast.classList.add('invalid');
            toast.innerHTML = `${faInvalid} ${data.message}`;
        }  else {
            toast.classList.add('error');
            toast.innerHTML = `${faError} ${response.message || "Error, please try again."}`;
        }
        toastBox.appendChild(toast);
        setTimeout(()=> {
            toast.remove();
        }, 5000)
    }

    async function toastErr(response) {
        toastCount++
        let toast = document.createElement('div');
        toast.classList.add('toast');
        if (toastCount >= 3){
            toastCount = 1;
            toastBox.innerHTML = '';
        }
        toast.classList.add('invalid');
        toast.innerHTML = `${faInvalid} ${response}`;
        toastBox.appendChild(toast);
        setTimeout(()=> {
            toast.remove();
        }, 5000)
    
    }
    
    function attachDropdownEvents(users) {
        const editButtons = document.querySelectorAll(".edit-leader");
        const deleteButtons = document.querySelectorAll(".delete-leader");
        let currentUserData;

        editButtons.forEach((button, index) => {
            button.addEventListener("click", async () => {
                currentUserData = users[index];
                handleLeadersUpdates(currentUserData);
                const popUp = document.getElementById("updatePromptParent");
                popUp.classList.remove("hidden");
            });
        });

        document
        .getElementById("updateLeaderButton")
        .addEventListener("click", async function () {
            try {
                if (!currentUserData) {
                    toastErr("No user data available for update.");
                    throw new Error("No user data available for update.");
                }
                await updateLeader(currentUserData._id);
            } catch (error) {
                console.error("Error updating leader:", error);
            }
        });

        deleteButtons.forEach((button, index) => {
            button.addEventListener("click", async () => {
                const userData = users[index];
                try {
                    await deleteLeader(userData._id);
                    fetchLeaders();
                } catch (error) {
                    toastErr("Error deleting leader")
                }
            });
        });
    }
    // Function to delete a leader
    async function deleteLeader(leaderId) {
        const response = await fetch(`/leadersSearch/${leaderId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Failed to delete leader.");
        }
        showToast(response);
    }
    
    async function handleLeadersUpdates(userData) {
        document.getElementById("NameOfLeader").value = userData.NameOfLeader;
        document.getElementById("PhoneNumber").value = userData.PhoneNumber;
        document.getElementById("LeaderPosition").innerHTML = `
            <option value="${userData.LeaderPosition}" hidden>${userData.LeaderPosition}</option>
            <option value="CO-ORDINATOR">CO-ORDINATOR</option>
            <option value="PCF">PCF LEADER</option>
            <option value="SENIOR-CELL">SENIOR-CELL LEADER</option>
            <option value="CELL">CELL LEADER</option>
        `;
        document.getElementById("CellType").innerHTML = `
            <option value="${userData.CellType}" hidden>${userData.CellType}</option>
            <option value="PCF">PCF</option>
            <option value="SENIOR-CELL">SENIOR-CELL</option>
            <option value="CELL">CELL</option>
        `;
        document.getElementById("NameOfPcf").value = userData.NameOfPcf;
        document.getElementById("NameOfSeniorCell").value =
            userData.NameOfSeniorCell;
        document.getElementById("NameOfCell").value = userData.NameOfCell;
        const seniorCellInput = document.getElementById("senior-cell-name");

        if (userData.CellType === "PCF") {
            seniorCellInput.classList.add("hidden");
        } else {
            seniorCellInput.classList.remove("hidden");
        }

        document
            .getElementById("CellType")
            .addEventListener("change", async function () {
                const cellTypeInput = document.getElementById("CellType").value;
                const seniorCellInput = document.getElementById("senior-cell-name");

                if (cellTypeInput === "PCF") {
                    seniorCellInput.classList.add("hidden");
                } else {
                    seniorCellInput.classList.remove("hidden");
                }
            });
    }

    async function updateLeader(leaderId) {
        try {
            const updateData = new FormData(
                document.getElementById("updateLeaderForm")
            );
            const formJSON = {};
            updateData.forEach((value, key) => {
                formJSON[key] = value;
            });
            const response = await fetch(`/leadersSearch/${leaderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formJSON),
            });

            if (!response.ok) {
                throw new Error("Failed to update leader");
            }

            // const result = await response.json();
            // closePopup();
            showToast(response);
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        } catch (error) {
            console.error("Error updating leader:", error);
        }
    }

    const downloadButton = document.getElementById("clickmetodownload");
    downloadButton.addEventListener("click", async function () {
        const originalLimit = limit;
        const originalPage = page;
    
        limit = 0;
        page = 1;
        await fetchLeaders();
    
        const table2excel = new Table2Excel();
        table2excel.export(document.querySelectorAll("#usersTableData"));
    
        limit = originalLimit;
        page = originalPage;
    
        fetchLeaders();
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
});
