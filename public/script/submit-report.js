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
                            document.getElementById('CellName').value = `${cellname}`;
                            document.getElementById('NameOfPcf').value = `${userChurchDetails.NameOfPcf}`;
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
    
                console.log('JSON data to be sent:', JSON.stringify(formJSON));
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
