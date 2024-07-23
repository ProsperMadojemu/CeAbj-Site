document.addEventListener('DOMContentLoaded', async() => {
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

                    if (user) {
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

    document.getElementById('CellType').addEventListener('change', function() {
        handleSelection(this.value);
    });
    
    function handleSelection (formCellType) { 
        const formPcfGroup = document.querySelector('#pcf-name');
        const formSeniorCellGroup = document.querySelector('#senior-cell-name');
        const formCellGroup = document.querySelector('#cell-name');
        
        if (formCellType === 'SENIOR-CELL') {
            formPcfGroup.classList.remove('hidden');
            formSeniorCellGroup.classList.remove('hidden');
            formCellGroup.classList.remove('hidden');
        } else if (formCellType === 'CELL') {
            formPcfGroup.classList.remove('hidden');
            formSeniorCellGroup.classList.remove('hidden');
            formCellGroup.classList.remove('hidden');
        } 
        else {
            formPcfGroup.classList.remove('hidden');
            formSeniorCellGroup.classList.add('hidden');
            formCellGroup.classList.remove('hidden');
        }
    }
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

    document.getElementById('submitnewcellbutton').addEventListener('click', async function(event) {
        event.preventDefault();
        const formLeadersName = document.getElementById('NameOfLeader').value;
        const formLeadersPosition = document.getElementById('LeaderPosition').value;
        const formCellType = document.getElementById('CellType');
        if (!formLeadersName || !formLeadersPosition || !formCellType) {
            showErrorPrompt('Please fill out all necessary fields');
        } else {
            try {
                const newCellForm = document.getElementById('addacellform');
                const formData = new FormData(newCellForm);
                const formJSON = Object.fromEntries(formData.entries());

                const response = await fetch('http://localhost:5000/submitnewcell', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formJSON)
                });

                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.error || 'Failed to Register Cell');
                }

                showPrompt("Cell Registration Successfull");
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
                
            } catch (error) {
                showErrorPrompt('An error occurred: ' + error.message);
            }
        }
    });
})