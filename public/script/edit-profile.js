document.addEventListener('DOMContentLoaded', () => {
    let title = '';
    let name = '';
    let lname = '';
    let phone = '';
    let country = '';
    let church = '';
    let zone = '';
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

                        if (user.userType === 'admin') {
                            window.location.href = '../admin/overview.html'
                        }

                        else if (user) {
                            const userChurchDetails = data.usersChurch.find(uc => uc.FirstName === user.FirstName && uc.LastName === user.LastName);
                            title = user.Title;
                            name = user.FirstName;
                            lname = user.LastName;
                            phone = user.PhoneNumber;
                            country = user.Country;
                            church = user.Church;
                            zone = userChurchDetails.Zone;
                            cellname = userChurchDetails.NameOfCell || 'Nill';
                            department = userChurchDetails.Department || 'Nill';
                            position = userChurchDetails.LeadershipPosition || 'Nill';
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

                            handleDetailsShown();
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

    function handleDetailsShown() {
        document.getElementById('Title').value = title;
        document.getElementById('FirstName').value = name;
        document.getElementById('LastName').value = lname;
        document.getElementById('PhoneNumber').value = phone;
        document.getElementById('Email').value = email;
        document.getElementById('Country').value = country;
        document.querySelector('#Church option[value="churchoption"]').textContent = church;
        document.querySelector('#LeadershipPosition option[value="noselect"]').textContent = position;
        document.querySelector('#zone option[value="zoneoption"]').textContent = zone;
        document.querySelector('#Department option[value=""]').textContent = department;
        // if (NameOfCell) {
        //     const cellGroup = document.querySelector('#cellnamegroup'); 
        //     console.log ("{'VALUE FOUND'}");
        //     cellGroup.style.display = 'block';
        // }
    }

    function resetFormFields(...fields) {
        fields.forEach(field => {
            if (field) {
                field.value = '';
            }
        });
    }

    const messageOverlay = document.getElementById('message-prompt');
    const messageOverlayText = document.getElementById('message-text');

        function showSuccessPrompt(message) {
        messageOverlay.classList.remove('hidden');
        messageOverlayText.textContent = message;
        if (messageOverlay.timeoutId) {
            clearTimeout(messageOverlay.timeoutId);
        }
        // messageOverlay.timeoutId = setTimeout(() => {
        //     hidePrompt();
        // }, 5000);
    }

    function hidePrompt() {
        messageOverlay.classList.add('hidden');
    }

    document.getElementById('LeadershipPosition').addEventListener('change', function () {
        handleLeaderSelection(this.value);
        handleLeadersFetching(this.value);
    });

    function handleLeaderSelection(LeadershipPosition) {
        const cellGroup = document.querySelector('#cellnamegroup'); 

        if (LeadershipPosition === 'Member') {
            cellGroup.style.display = 'block';
            document.getElementById('NameOfCell').innerHTML = `                    
            <option value="" hidden>Choose an option</option>
            <option value="Not In A Cell">No</option>
            <option value="">Yes</option>`;
            document.getElementById('cellname-label').innerHTML = `Are you in a cell`;
        } else if ( LeadershipPosition === 'PCF-leader' || LeadershipPosition === 'Senior-Cell-leader' || LeadershipPosition === 'Cell-leader') {
            cellGroup.style.display = 'block';
            document.getElementById('NameOfCell').innerHTML = ``;
            document.getElementById('cellname-label').innerHTML = ` `;
        } else {
            cellGroup.style.display = 'none';
            document.getElementById('NameOfCell').innerHTML = ``;
        }
    }

    async function handleLeadersFetching(LeaderPosition) {     
        if (LeaderPosition === 'PCF-leader') {
            document.getElementById('cellname-label').innerHTML = `Name of Pcf`;

            try {
                const response = await fetch('/pcfleaders');
                const data = await response.json();

                const select = document.getElementById('NameOfCell');

                // Clear previous options
                select.innerHTML = `<option value=${cellname} hidden>${cellname}</option>`;

                data.cells.forEach(cell => {
                    const option = document.createElement('option');
                    option.value = cell.NameOfPcf;
                    option.textContent = cell.NameOfPcf;
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } 
        else if ( LeaderPosition === 'Senior-Cell-leader') { 
            document.getElementById('cellname-label').innerHTML = `Name of Senior Cell`;

            try {
                const response = await fetch('/seniorcell-leaders');
                const data = await response.json();

                const select = document.getElementById('NameOfCell');

                // Clear previous options
                select.innerHTML = `<option value= ${cellname} hidden>${cellname}</option>`;

                data.cells.forEach(cell => {
                    const option = document.createElement('option');
                    option.value = cell.NameOfSeniorCell
                    option.textContent = cell.NameOfSeniorCell;
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } else if (LeaderPosition === 'Cell-leader') {
            document.getElementById('cellname-label').innerHTML = `Name of Cell`;
            try {
                const response = await fetch('/cell-leaders');
                const data = await response.json();

                const select = document.getElementById('cellname');

                // Clear previous options
                select.innerHTML = `<option value= ${cellname} hidden>${cellname}</option>`;

                data.cells.forEach(cell => {
                    const option = document.createElement('option');
                    option.value = cell.NameOfCell
                    option.textContent = cell.NameOfCell;
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    }

    document.getElementById('updateuserbutton').addEventListener('click', async function (event) {
        event.preventDefault();

        try {
            const updateData = new FormData(document.getElementById('updateform'));
            const formJSON = {};
    
            updateData.forEach((value, key) => {
                formJSON[key] = value;
            });
            
            console.log('JSON data to be sent:', JSON.stringify(formJSON));
            const response = await fetch('http://localhost:5000/updateuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formJSON)
            });
    
            if (!response.ok) {
                throw new Error('Failed to update user');
            }
    
            const result = await response.json();
            if (response.ok) {
                showSuccessPrompt("Profile Update Successful");
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            }
             else {
                alert(result.error); // Show error message
            }
        } catch (error) {
            alert('An error occurred: ' + error.message);
        }
    });
    
        

    
});
