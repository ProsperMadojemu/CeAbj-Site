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
                            position = userChurchDetails.LeadershipPosition || 'Nill';
                            email = user.Email;

                            const welcomeGreeting = document.querySelector('.userGreeting');
                            const logoutButton = document.getElementById('Logout-Button');

                            welcomeGreeting.innerHTML = `${title}, ${user.FirstName} ${user.LastName}`;
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
                alert(result.message); // Show success message
                window.location.href = window.location.href; // Redirect back to the current page
            } else {
                alert(result.error); // Show error message
            }
        } catch (error) {
            alert('An error occurred: ' + error.message);
        }
    });
    
        

    
});
