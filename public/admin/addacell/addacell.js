document.addEventListener('DOMContentLoaded', async() => {
    // Fetch session data
    fetch('/check-session')
    .then(response => response.json())
    .then(sessionData => {
        if (sessionData.email && sessionData.isAdmin) {
            // Fetch admin data from getalldata route
            fetch('/getalldata')
                .then(response => response.json())
                .then(data => {
                    // Check if the logged-in user is an admin
                    const admin = data.admin.find(a => a.email === sessionData.email);
                    if (!admin) {
                            window.location.href = '/404';
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    window.location.href = '/404';
                });
        } else {
            window.location.href = '/login';
        }

        const logoutButton = document.getElementById('Logout-Button');
        logoutButton.addEventListener('click', () => {
            fetch('/logout', { method: 'POST' })
                .then(() => {
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error during logout:', error);
                });
        });
    })
    .catch(error => {
        console.error('Error checking session:', error);
        window.location.href = '/login';
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


    document.getElementById('submitnewcellbutton').addEventListener('click', async function(event) {
        event.preventDefault();
        const formLeadersName = document.getElementById('NameOfLeader').value;
        const formLeadersPosition = document.getElementById('LeaderPosition').value;
        const formCellType = document.getElementById('CellType');
        if (!formLeadersName || !formLeadersPosition || !formCellType) {
            toastErr('Please fill out all necessary fields')
        } else {
            try {
                const newCellForm = document.getElementById('addacellform');
                const formData = new FormData(newCellForm);
                const formJSON = Object.fromEntries(formData.entries());

                const response = await fetch('/submitnewcell', {
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


                showToast(response)
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
                
            } catch (error) {
                toastErr(`Error: ${error.message}`)
            }
        }
    });
})