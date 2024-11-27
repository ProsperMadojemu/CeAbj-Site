document.addEventListener("DOMContentLoaded", async () => {
    // Global variables
    let userData = {
        title: "",
        name: "",
        lname: "",
        phone: "",
        country: "",
        church: "",
        cellname: "",
        department: "",
        position: "",
        email: "",
    };

    const toastConfig = {
        count: 0,
        box: document.getElementById("toastBox"),
        icons: {
            success: `<i class="fa-solid fa-circle-check" style="color:green"></i>`,
            error: `<i class="fa-solid fa-circle-x" style="color:red"></i>`,
            invalid: `<i class="fa-solid fa-circle-exclamation" style="color:orange"></i>`,
        },
    };

    // Helper functions
    const formatTime = (seconds) => {
        const totalSeconds = Math.round(seconds);
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    };

    const formatDateToDayMonthYear = (dateString) => {
        try {
            if (!dateString || dateString.toLowerCase() === "nill") return "Invalid date";
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Date parsing error";

            const day = date.getDate();
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();

            const ordinalSuffix = (day) => {
                if (day > 3 && day < 21) return "th";
                switch (day % 10) {
                    case 1: return "st";
                    case 2: return "nd";
                    case 3: return "rd";
                    default: return "th";
                }
            };

            return `${day}${ordinalSuffix(day)}, ${month} ${year}`;
        } catch {
            return "Date formatting error";
        }
    };

    const showToast = async (response) => {
        const { count, box, icons } = toastConfig;
        let data;
        toastConfig.count++;

        if (response) {
            data = await response.json();
        }

        const toast = document.createElement("div");
        toast.classList.add("toast");
        if (toastConfig.count >= 3) {
            toastConfig.count = 1;
            box.innerHTML = "";
        }

        if (response.status >= 200 && response.status < 300) {
            toast.innerHTML = `${icons.success} ${data.message || "Success"}`;
        } else if (response.status >= 400 && response.status < 500) {
            toast.classList.add("error");
            toast.innerHTML = `${icons.error} ${data.message || "Client error"}`;
        } else {
            toast.classList.add("invalid");
            toast.innerHTML = `${icons.invalid} ${data.message || "Unexpected error"}`;
        }

        box.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    };

    const handleSessionCheck = async () => {
        try {
            const sessionResponse = await fetch("/check-session");
            const sessionData = await sessionResponse.json();

            if (!sessionData.email) {
                window.location.href = "/login";
                return;
            }

            const userResponse = await fetch("/api/user/getalldata");
            const userData = await userResponse.json();

            const currentUser = userData.users.find((u) => u.Email === sessionData.email);

            if (!currentUser) {
                window.location.href = "/login";
                return;
            }

            const userChurchDetails = userData.usersChurch.find(
                (uc) => uc.FirstName === currentUser.FirstName && uc.LastName === currentUser.LastName
            );

            Object.assign(userData, {
                title: currentUser.Title,
                name: currentUser.FirstName,
                lname: currentUser.LastName,
                phone: currentUser.PhoneNumber,
                country: currentUser.Country,
                church: currentUser.Church,
                cellname: userChurchDetails?.NameOfCell || "Nill",
                department: userChurchDetails?.Department || "Nill",
                position: userChurchDetails?.Designation || "Nill",
                email: currentUser.Email,
            });
            document.querySelector("#usersdetails").textContent = `${userData.title} ${userData.name} ${userData.lname}`;
            displayUserInfo(userData);
            
        } catch (error) {
            console.error("Error fetching session or user data:", error);
        }
    };

    document.getElementById("Logout-Button").addEventListener("click", async () => {
        try {
            await fetch("/api/user/logout", { method: "POST" });
            window.location.reload();
        } catch (error) {
            console.error("Error during logout:", error);
            showToast("Error during logout. Please try again.", "error");
        }
    });

    
    const setupNavbar = () => {
        const navbar = document.querySelector(".vertical-navbar");
        const toggleNavbar = () => navbar.classList.toggle("active");

        document.getElementById("DrawerIcon").addEventListener("click", toggleNavbar);
        document.getElementById("CloseDrawer").addEventListener("click", toggleNavbar);
        window.addEventListener("resize", () => navbar.classList.remove("active"));
    };

    const fetchDataAndDisplay = async () => {
        try {
            const response = await fetch("/api/user/overview");
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            const data = await response.json();

            displayUserDetails(data);
            populateMessages(data);
            populateReportsTable(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const displayUserInfo = (userData) => {
        document.querySelector(".user-name").innerHTML = `${userData.title} ${userData.name} ${userData.lname}`;
        document.querySelector(".user-designation").textContent = userData.position || "--";
    }
    
    const displayUserDetails = (data) => {
        const { meeting, userCell, isVerified, leadersCount, averageAttendance } = data;
        const totalDuration = meeting.reduce((total, session) =>
            total + session.viewers.reduce((sum, viewer) => sum + viewer.duration, 0), 0);

        const user = handleSessionCheck;
        console.log(user);
        
        // userName.innerHTML = `${title} ${name} ${lname}`;
        // userDesignation.innerHTML = `${position}`;
        // userCellDesignation.innerHTML = `${userCell.Designation || userCell.LeaderPosition || "--"}`;
        // userLeadersCount.innerHTML = `${leadersCount || "--"}`;

        document.querySelector(".user-designation_cell").innerHTML = `${ isVerified ? userCell.LeaderPosition || userCell.Designation || "--" : "--"}`;
        document.querySelector(".user-leader-count").innerHTML = isVerified ? leadersCount || "--" : "--"
        document.querySelector(".user-attendance-count").innerHTML = isVerified ? averageAttendance || "--" : "--";
        document.querySelector(".service-attendance-count").innerHTML = meeting.length || "--";
        document.querySelector(".average-service-duration").innerHTML = formatTime(totalDuration);

        const verificationContainer = document.querySelector(".users-verification");
        verificationContainer.innerHTML = `
            <span>${isVerified ? "Verified" : "Not Verified"}</span>
            <i class="fa-solid ${isVerified ? "fa-circle-check" : "fa-circle-xmark"}"></i>
        `;
    };

    const populateMessages = (data) => {
        const messageBody = document.querySelector(".messages-wrapper");
        data.message.forEach((msg) => {
            const div = document.createElement("div");
            div.classList.add("message-container");
            div.innerHTML = `
                <span class="sender">Admin</span>
                <span class="subject">${msg.Subject}</span>
                <span class="content">- ${msg.Content}</span>
                <span class="date">${formatDateToDayMonthYear(msg.time)}</span>
            `;
            messageBody.appendChild(div);
        });
    };

    const populateReportsTable = (data) => {
        const tableBody = document.querySelector(".reports-table tbody");
        tableBody.innerHTML = "";
        data.reports.forEach((report, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${report.FirstName} ${report.LastName}</td>
                <td>${report.CellName}</td>
                <td>${report.ServiceAttendance}</td>
                <td>${report.CellMeetingAttendance}</td>
                <td>${report.CellFirstTimers}</td>
                <td>${report.SundayFirstTimers}</td>
                <td>${report.offering}</td>
                <td>${report.status}</td>
                <td>${formatDateToDayMonthYear(report.SubmissionDate)}</td>
            `;
            tableBody.appendChild(row);
        });
    };

    // Initialize functions
    setupNavbar();
    await handleSessionCheck();
    await fetchDataAndDisplay();
});
