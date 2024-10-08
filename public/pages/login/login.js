document.addEventListener('DOMContentLoaded', () => {
    const errorMessage = document.getElementById('errormessage');

    let data;
    let toastBox = document.getElementById('toastBox');
    let toastCount = 0
    const faSuccess = `<i class="fa-solid fa-circle-check" style= "color:green"></i>`;
    const faError = `<i class="fa-solid fa-circle-x" style= "color:red"></i>`;
    const faInvalid = `<i class="fa-solid fa-circle-exclamation" style= "color:orange"></i>`;
    async function showToast(response) {
        toastCount++
        let toast = document.createElement('div');
        toast.classList.add('toast');
        if (toastCount >= 3){
            toastCount = 1;
            toastBox.innerHTML = '';
        }
        if (response.status === 201){
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

    function showError(message) {
        if (!errorMessage) return;
        errorMessage.classList.add('error-message-visible');
        errorMessage.textContent = message;
        if (errorMessage.timeoutId) {
            clearTimeout(errorMessage.timeoutId);
        }
        errorMessage.timeoutId = setTimeout(() => {
            hideError();
        }, 5000);
    }

    function hideError() {
        if (!errorMessage) return;
        errorMessage.classList.remove('error-message-visible');
        errorMessage.textContent = "";
    }

    async function handleLogin(event) {
        event.preventDefault();
    
        const forminput = document.getElementById('usersinput').value;
        const formpass = document.getElementById('userspassword').value;
        const loginButton = document.getElementById('login-button');
    
        if (!loginButton) return;
    
        loginButton.disabled = true;
    
        if (!forminput ||!formpass) {
            loginButton.disabled = false;
            if (!forminput &&!formpass) {
                showError('INPUT FIELDS CANNOT BE EMPTY');
            } else if (!forminput) {
                showError('INPUT YOUR EMAIL OR NUMBER');
            } else if (!formpass) {
                showError('INPUT YOUR PASSWORD');
            }
        } else {
            hideError();
            try {
                const loginFormJSON = {
                    usersinput: forminput,
                    userspassword: formpass
                };
    
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginFormJSON)
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Login failed');
                }
    
                data = await response.json();
                showToast(response);
                setTimeout(async() => {
                    window.location.href = data.redirectUrl;
                }, 5000);    
            } catch (error) {
                console.error('An error occurred:', error);
                showToast(error);
            } finally {
                loginButton.disabled = false;
            }
        }
    }



    document.getElementById('login-button').addEventListener('click', handleLogin);
});
