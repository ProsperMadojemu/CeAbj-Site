document.addEventListener('DOMContentLoaded', () => {
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
                            cellname = userChurchDetails ? userChurchDetails.NameOfCell : 'Nill';
                            department = userChurchDetails.Department || 'Nill';
                            position = userChurchDetails ? userChurchDetails.Position : 'Nill';
                            email = user.Email;

                            const welcomeGreeting = document.querySelector('.userGreeting');
                            const logoutButton = document.getElementById('Logout-Button');

                            welcomeGreeting.innerHTML = `Hi, ${user.FirstName} ${user.LastName}`;
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
        document.getElementById('updatename').value = name;
        document.getElementById('updatelname').value = lname;
        document.getElementById('updatephone').value = phone;
        document.getElementById('updateemail').value = email;
        document.getElementById('updatecountry').value = country;
        document.querySelector('#churches option[value="churchoption"]').textContent = church;
        document.querySelector('#position option[value="noselect"]').textContent = position;
        document.querySelector('#departments option[value="depart"]').textContent = department;
    }

});
