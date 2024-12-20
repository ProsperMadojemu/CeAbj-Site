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
            fetch('/api/user/getalldata')
                .then(response => response.json())  
                .then(data => {
                    const user = data.users.find(u => u.Email === sessionData.email);
                    if (user) {
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
                        position = userChurchDetails.Designation || 'Nill';
                        email = user.Email;

                        const welcomeGreeting = document.querySelector('#usersdetails');
                        const logoutButton = document.getElementById('Logout-Button');
                        welcomeGreeting.innerHTML = `${user.Title} ${user.FirstName} ${user.LastName}`;
                        logoutButton.addEventListener('click', () => {
                            fetch('/api/user/logout', { method: 'POST' })
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
    
    function handleDetailsShown() {
        document.getElementById('Title').value = title;
        document.getElementById('FirstName').value = name;
        document.getElementById('LastName').value = lname;
        document.getElementById('PhoneNumber').value = phone;
        document.getElementById('Email').value = email;
        document.getElementById('Country').value = country;
        document.querySelector('#Church option[value="churchoption"]').textContent = church;
        document.getElementById('Designation').innerHTML = `                    
            <option value="${position}" hidden>${position}</option>
            <option value="" hidden>Choose an option</option>
            <option value="PCF-leader">PCF Leader</option>
            <option value="Senior-Cell-leader">Senior Cell Leader</option>
            <option value="Cell-leader">Cell Leader</ option>
            <option value="Departmental-Head">Departmental Head</option>
            <option value="Minister-in-training">Minister in training</option>
            <option value="Haven-Governor">Haven Governor</option>
            <option value="Member">Member</option>
        `;
        document.querySelector('#zone option[value="zoneoption"]').textContent = zone;
        document.getElementById('Department').innerHTML = `
            <option value="${department}" hidden>${department}</option>
            <option value="TECHNICAL">TECHNICAL</option>
            <option value="CHOIR">CHOIR</option>
            <option value="USHER">USHER</option>
            <option value="SECURITY">SECURITY</option>
            <option value="FIRST-TIMERS-MINISTRY">FIRST TIMERS MIN</option>
        `;

    }

    function resetFormFields(...fields) {
        fields.forEach(field => {
            if (field) {
                field.value = '';
            }
        });
    }

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



    document.getElementById('Designation').addEventListener('change', function () {
        handleLeaderSelection(this.value);
        handleLeadersFetching(this.value);
    });

    function handleLeaderSelection(Designation) {
        const cellGroup = document.querySelector('#cellnamegroup'); 

        if (Designation === 'Member') {
            cellGroup.style.display = 'block';
            document.getElementById('NameOfCell').innerHTML = `                    
            <option value="" hidden>Choose an option</option>
            <option value="Not In A Cell">No</option>
            <option value="">Yes</option>`;
            document.getElementById('cellname-label').innerHTML = `Are you in a cell`;
        } else if ( Designation === 'PCF-leader' || Designation === 'Senior-Cell-leader' || Designation === 'Cell-leader') {
            cellGroup.style.display = 'block';
            document.getElementById('NameOfCell').innerHTML = ``;
            document.getElementById('cellname-label').innerHTML = ` `;
        } else {
            cellGroup.style.display = 'none';
            document.getElementById('NameOfCell').innerHTML = ``;
        }
    }


    
    async function handleLeadersFetching(Designation) {  
        if (Designation === 'PCF-leader') {
            document.getElementById('cellname-label').innerHTML = `Name of Pcf`;

            try {
                const response = await fetch('/pcfleaders');
                const data = await response.json();

                const select = document.getElementById('NameOfCell');
                const pcfInput = document.getElementById('NameOfPcf');

                // FIX AND REMOVE CELLNAME AS THE DEFAULT DISPLAY
                // Clear previous options
                select.innerHTML = `<option value= ${cellname} hidden>Select an option</option>`;

                data.cells.forEach(cell => {
                    const option = document.createElement('option');
                    option.value = cell.NameOfPcf;
                    option.textContent = cell.NameOfPcf;
                    select.appendChild(option);
                });
                select.addEventListener('change', () => {
                    const selectedCellName = select.value;
                    const selectedCell = data.cells.find(cell => cell.NameOfPcf === selectedCellName);
                    
                    if (selectedCell) {
                        pcfInput.value = selectedCell.NameOfPcf; // Update the PCF name
                    } else {
                        pcfInput.value = ''; // Clear if no matching cell is found
                    }
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }

        } 
        else if ( Designation === 'Senior-Cell-leader') { 
            document.getElementById('cellname-label').innerHTML = `Name of Senior Cell`;

            try {
                const response = await fetch('/seniorcell-leaders');
                const data = await response.json();

                const select = document.getElementById('NameOfCell');
                const pcfInput = document.getElementById('NameOfPcf');

                // Clear previous options
                select.innerHTML = `<option value= ${cellname} hidden>Select an option</option>`;

                data.cells.forEach(cell => {
                    const option = document.createElement('option');
                    option.value = cell.NameOfSeniorCell
                    option.textContent = cell.NameOfSeniorCell;
                    select.appendChild(option);
                });
                select.addEventListener('change', () => {
                    const selectedCellName = select.value;
                    const selectedCell = data.cells.find(cell => cell.NameOfSeniorCell === selectedCellName);
                    
                    if (selectedCell) {
                        pcfInput.value = selectedCell.NameOfPcf; // Update the PCF name
                    } else {
                        pcfInput.value = ''; // Clear if no matching cell is found
                    }
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } else if (Designation === 'Cell-leader') {
            document.getElementById('cellname-label').innerHTML = `Name of Cell`;
            try {
                const response = await fetch('/cell-leaders');
                const data = await response.json();
        
                const select = document.getElementById('NameOfCell');
                const pcfInput = document.getElementById('NameOfPcf');
        
                // Clear previous options
                select.innerHTML = `<option value=${cellname} hidden>${cellname}</option>`;
        
                data.cells.forEach(cell => {
                    const option = document.createElement('option');
                    option.value = cell.NameOfCell;
                    option.textContent = cell.NameOfCell;
                    select.appendChild(option);
                });
        
                select.addEventListener('change', () => {
                    const selectedCellName = select.value;
                    const selectedCell = data.cells.find(cell => cell.NameOfCell === selectedCellName);
                    
                    if (selectedCell) {
                        pcfInput.value = selectedCell.NameOfPcf; 
                    } else {
                        pcfInput.value = ''; 
                    }
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
            
            const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formJSON)
            });
    
            if (!response.ok) {
                throw new Error('Failed to update user');
            }
    
            if (response.ok) {
                // showSuccessPrompt("Profile Update Successful");
                showToast(response);
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            }
            else {
                showToast(response);
            }
        } catch (error) {
            alert('An error occurred: ' + error.message);
        }
    });
    
        

    
});
