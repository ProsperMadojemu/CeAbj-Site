document.addEventListener('DOMContentLoaded', () => {
    const errorMessage = document.getElementById('errormessage');
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
    
                const result = await response.json();
                console.log('User logged in Successfully:', result);
                
                showPrompt("Login Successful");
                setTimeout(() => {
                    window.location.href = result.redirectUrl;
                }, 5000);    
            } catch (error) {
                console.error('An error occurred:', error);
                showError(error.message);
            } finally {
                loginButton.disabled = false;
            }
        }
    }



    document.getElementById('login-button').addEventListener('click', handleLogin);
});
