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
                            const logoutButton = document.getElementById('Logout-Button');
                            welcomeGreeting.innerHTML = `${user.Title} ${user.FirstName} ${user.LastName}`;
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
                            window.location.href = '/login';
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching user data:', error);
                    });
            } else {
                window.location.href = '/login';
            }
        })
        .catch(error => {
            console.error('Error checking session:', error);
        });

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
                console.log(toast);
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
            toastErr('All Fields Are Required');
        } else if (!formFname) {
            toastErr('Enter Your First Name');
        } else if (!formLname) {
            toastErr('Enter Your Last Name');
        } else if (!formNameOfCell) {
            toastErr('Enter Name of Your Cell');
        } else if (!formCellMeetingAttendance) {
            toastErr('Enter Cell Meeting Attendance or Type Nill');
        } else if (!formCellFirstTimers) {
            toastErr('Enter Cell First Timers or Type Nill');
        } else if (!formCellOffering) {
            toastErr('Enter Cell Offering Amount');
        } else {
            try {
                const reportForm = document.getElementById('cellReportForm');
                const formData = new FormData(reportForm);
                const formJSON = Object.fromEntries(formData.entries());
    
                console.log('JSON data to be sent:', JSON.stringify(formJSON));
                const response = await fetch('/submitcellreport', {
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
    
                showToast(response);
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            } catch (error) {
                showToast(response);
            }
        }
        
    })

});
