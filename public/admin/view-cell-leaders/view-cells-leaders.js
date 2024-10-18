document.addEventListener("DOMContentLoaded", async () => {
    // Fetch session data
    fetch("/check-session")
    .then((response) => response.json())
    .then((sessionData) => {
        if (sessionData.email && sessionData.isAdmin) {
            // Fetch admin data from getalldata route
            fetch("/getalldata")
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
            fetch("/logout", { method: "POST" })
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

    const tableBody = document.querySelector("#usersTableData tbody");
    showSkeletonRows(tableBody);

    // Show skeleton rows while fetching data
    async function showSkeletonRows(tableBody) {
        for (let i = 0; i < 3; i++) {
            const row = document.createElement("tr");
            row.classList.add("skeleton");
            for (let j = 0; j < 5; j++) {
                const cell = document.createElement("td");
                cell.colSpan = 6;
                row.appendChild(cell);
            }
            tableBody.appendChild(row);
        }
    }

    // Hide skeleton rows after fetching data
    function hideSkeletonRows(tableBody) {
        const skeleton = tableBody.querySelectorAll(".skeleton");
        skeleton.forEach((row) => row.remove());
    }

    // Function to format a date in the format YY/MM/DD
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

    let currentPage = 1;
    const limit = 10; // Number of results per page
    let totalUsersVariable = "";

    // Fetch search results
    async function fetchSearchResults(page = 1) {
        const searchTerm = document.getElementById("searchInput").value.trim();
        try {
            // Corrected URL construction
            const url = searchTerm
                ? `/leadersSearch?q=${encodeURIComponent(
                    searchTerm
                )}&page=${page}&limit=${limit}`
                : `/leadersSearch?page=${page}&limit=${limit}`;

            const response = await fetch(url);
            const searchResults = await response.json();

            hideSkeletonRows(tableBody);
            displayUsers(searchResults.cells); // Assuming cells is the correct response field
            updatePaginationControls(
                searchResults.currentPage,
                searchResults.totalPages
            );
        } catch (error) {
            console.error("Error during search:", error);
        }
    }

    function closePopup() {
        const popUp = document.getElementById("updatePromptParent");
        popUp.classList.add("hidden");
    }
    function displayUsers(users) {
        tableBody.innerHTML = "";
        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">No leader found.</td></tr>';
            return;
        }
        let count = (currentPage - 1) * limit + 1;
        users.forEach((user) => {
            const userData = user._doc || user;
            const row = document.createElement("tr");
            const registrationDate = userData.registrationDate
                ? formatDateToYYMMDD(userData.registrationDate)
                : "N/A";

            row.innerHTML = `
                <td>${count++}</td>
                <td>${userData.NameOfLeader || "N/A"}</td>
                <td>${userData.PhoneNumber || "N/A"}</td>
                <td>${userData.LeaderPosition || "N/A"}</td>
                <td>${userData.NameOfCell || "N/A"}</td>
                <td>
                    <div class="ellipsis-container">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                        <div class="dropdown-menu hidden">
                            <button class="edit-leader">Edit</button>
                            <button class="delete-leader">Delete</button>
                        </div>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        attachDropdownEvents(users); // Pass users to attachDropdownEvents
    }

    function attachDropdownEvents(users) {
        const ellipsisIcons = document.querySelectorAll(".ellipsis-container");

        ellipsisIcons.forEach((icon) => {
            icon.addEventListener("click", (event) => {
                const dropdownMenu = icon.querySelector(".dropdown-menu");
                dropdownMenu.classList.toggle("hidden");

                // Hide the dropdown when clicking outside
                document.addEventListener("click", (e) => {
                    if (!icon.contains(e.target)) {
                        dropdownMenu.classList.add("hidden");
                    }
                });
            });
        });

        // Handle edit and delete actions
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
                showPrompt(`Deleting leader: ${userData.NameOfLeader}`);
                try {
                    await deleteLeader(userData._id);
                    showPrompt("Leader deleted successfully.");
                    fetchSearchResults(currentPage);
                } catch (error) {
                    showErrorPrompt("Error deleting leader.");
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

    // Update leader function
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

            const result = await response.json();
            closePopup();
            showPrompt("Update successful:", result.message);
            fetchSearchResults(currentPage);
        } catch (error) {
            console.error("Error updating leader:", error);
        }
    }

    // Update pagination controls
    function updatePaginationControls(currentPage, totalPages) {
        document.getElementById(
            "pageInfo"
        ).textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById("prevPage").disabled = currentPage === 1;
        document.getElementById("nextPage").disabled = currentPage === totalPages;
    }

    document.getElementById("searchButton").addEventListener("click", () => {
        currentPage = 1;
        fetchSearchResults(currentPage);
    });

    // Debounce function for input
    let debounceTimer;
    document.getElementById("searchInput").addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentPage = 1;
            fetchSearchResults(currentPage);
        }, 300); // 300 ms debounce
    });

    document.getElementById("prevPage").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchSearchResults(currentPage);
        }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
        currentPage++;
        fetchSearchResults(currentPage);
    });

    // Fetch initial data
    fetchSearchResults(currentPage);

    const messageOverlay = document.getElementById("message-prompt");
    const messageOverlayText = document.getElementById("message-text");
    const messageOverlaySign = document.getElementById("message-sign");

    // Function to show prompt
    function showPrompt(message) {
        messageOverlay.classList.remove("hidden");
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
        messageOverlay.classList.remove("hidden");
        messageOverlaySign.classList.remove("fa-spinner-third", "fa-2xl");
        messageOverlaySign.classList.add("fa-solid", "fa-xmark", "fa-2xl");
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
        messageOverlay.classList.add("hidden");
        messageOverlaySign.classList.remove("fa-solid", "fa-xmark", "fa-2xl");
        messageOverlaySign.classList.add("fa-spinner-third", "fa-2xl");
    }

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
