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
                        const userChurchDetails = data.usersChurch.find(uc => uc.FirstName === user.FirstName && uc.LastName === user.LastName);

                        if (user.userType === 'admin') {
                            name = user.FirstName;
                            lname = user.LastName;
                            phone = user.PhoneNumber;
                            country = user.Country;
                            church = user.Church;
                            cellname = userChurchDetails.NameOfCell || 'Nill';
                            department = userChurchDetails.Department || 'Nill';
                            position = userChurchDetails.Position || 'Nill';
                            email = user.Email;

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
                            
                        } else if (user.userType !== 'admin' ) {
                            window.location.href = './404.html';
                        }
                        else {
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
});
