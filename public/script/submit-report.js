document.addEventListener('DOMContentLoaded', async () => {
    let name = '';
    let lname = '';
    let phone = '';
    let country = '';
    let church = '';
    let cellname = '';
    let department = '';
    let position = '';
    let email = '';

    // Fetch session data
    fetch('/check-session')
        .then(response => response.json())
        .then(sessionData => {
            if (sessionData.email) {
                // Fetch user data from getalldata route
                fetch('/getalldata')
                    .then(response => response.json())
                    .then(data => {
                        const user = data.users.find(u => u.Email === sessionData.email);

                        if (user) {
                            const userChurchDetails = data.usersChurch.find(uc => uc.FirstName === user.FirstName && uc.LastName === user.LastName);
                            
                            name = user.FirstName;
                            lname = user.LastName;
                            phone = user.PhoneNumber;
                            country = user.Country;
                            church = user.Church;
                            cellname = userChurchDetails.NameOfCell || 'Nill';
                            department = userChurchDetails.Department || 'Nill';
                            position = userChurchDetails.Position || 'Nill';
                            email = user.Email;

                            document.getElementById('FirstName').value = `${user.FirstName}`;
                            document.getElementById('LastName').value = `${user.LastName}`;
                            document.getElementById('CellName').value = `${userChurchDetails.cellname || 'NULL'}`;
                            const welcomeGreeting = document.querySelector('#usersdetails');
                            const userTitle = document.querySelector('#usersTitle');
                            const logoutButton = document.getElementById('Logout-Button');
                            welcomeGreeting.innerHTML = ` ${user.FirstName} ${user.LastName}`;
                            userTitle.innerHTML= `${user.Title}, `
                            logoutButton.addEventListener('click', () => {
                                fetch('/logout', { method: 'POST' })
                                    .then(() => {
                                        window.location.reload();
                                    })
                                    .catch(error => {
                                        console.error('Error during logout:', error);
                                    });
                            });

                            // handleDetailsShown();
                        } else {
                            window.location.href = '/pages/login.html';
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching user data:', error);
                    });
            } else {
                window.location.href = '/pages/login.html';
            }
        })
        .catch(error => {
            console.error('Error checking session:', error);
        });

    // function handleDetailsShown() {
    //     document.getElementById('updatename').value = name;
    //     document.getElementById('updatelname').value = lname;
    //     document.getElementById('updatephone').value = phone;
    //     document.getElementById('updateemail').value = email;
    //     document.getElementById('updatecountry').value = country;
    //     document.querySelector('#churches option[value="churchoption"]').textContent = church;
    //     document.querySelector('#position option[value="noselect"]').textContent = position;
    //     document.querySelector('#departments option[value="depart"]').textContent = department;
    // }

    // try {
    //     const response = await fetch('/fetch-data');
    //     if (!response.ok) {
    //         throw new Error('Network response was not ok');
    //     }
    //     const data = await response.json();
    //     populateTable(data);
    // } catch (error) {
    //     console.error('Error fetching data:', error);
    // }

    
    // function populateTable(data) {
    //     const tbody = document.querySelector('#dataTable tbody');
    //     tbody.innerHTML = ''; // Clear existing rows
    
    //     const users = data.users;
    //     const usersChurch = data.usersChurch;
    
    //     users.forEach(user => {
    //         const userChurch = usersChurch.find(uc => uc.Email === user.Email) || {};
    //         const row = document.createElement('tr');
    
    //         row.innerHTML = `
    //             <td>${user.Email}</td>
    //             <td>${user.FirstName}</td>
    //             <td>${user.LastName}</td>
    //             <td>${user.PhoneNumber || ''}</td>
    //             <td>${user.Country || ''}</td>
    //             <td>${user.Church || userChurch.Church || ''}</td>
    //             <td>${user.LeadershipPosition || userChurch.LeadershipPosition || ''}</td>
    //             <td>${userChurch.NameOfCell || ''}</td>
    //             <td>${userChurch.Department || ''}</td>
    //             <td>${userChurch.Zone || ''}</td>
    //         `;
    
    //         tbody.appendChild(row);
    //     });
    // }
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

    const reportButton = document.getElementById('submitcellreportbutton');
    reportButton.addEventListener('click', async function (event) {
        event.preventDefault();
        const formFname = document.getElementById('FirstName').value;
        const formLname = document.getElementById('LastName').value;
        const formNameOfCell = document.getElementById('CellName').value;
        const formServiceAttendannce = document.getElementById('ServiceAttendance').value;
        const formSundayFirstTimers = document.getElementById('SundayFirstTimers').value;
        const formCellMeetingAttendance = document.getElementById('CellMeetingAttendance').value;
        const formCellFirstTimers = document.getElementById('CellFirstTimers').value;
        const formCellOffering = document.getElementById('offering').value;
        
        if (!formFname || !formLname || !formNameOfCell || !formServiceAttendannce || !formSundayFirstTimers || !formCellMeetingAttendance || !formCellFirstTimers || !formCellOffering) {
            showErrorPrompt('All Fields Are Required');
        } else if (!formFname) {
            showErrorPrompt('Enter Your First Name');
        } else if (!formLname) {
            showErrorPrompt('Enter Your Last Name');
        } else if (!formNameOfCell) {
            showErrorPrompt('Enter Name of Your Cell');
        } else if (!formCellMeetingAttendance) {
            showErrorPrompt('Enter Cell Meeting Attendance or Type Nill');
        } else if (!formCellFirstTimers) {
            showErrorPrompt('Enter Cell First Timers or Type Nill');
        } else if (!formCellOffering) {
            showErrorPrompt('Enter Cell Offering Amount');
        } else {
            try {
                const reportForm = document.getElementById('cellReportForm');
                const formData = new FormData(reportForm);
                const formJSON = Object.fromEntries(formData.entries());
    
                const response = await fetch('http://localhost:5000/submitcellreport', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formJSON)
                });
    
                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.error || 'Failed to Submit Report');
                }
    
                showPrompt("Report Submission Successful");
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            } catch (error) {
                showErrorPrompt('An error occurred: ' + error.message);
            }
        }
        
    })

});
