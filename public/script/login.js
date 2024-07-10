document.addEventListener('DOMContentLoaded', () => {
    const errorMessage = document.getElementById('errormessage');

    function showError(message) {
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
        errorMessage.classList.remove('error-message-visible');
        errorMessage.textContent = "";
    }

    async function handleLogin(event) {
        event.preventDefault();

        const forminput = document.getElementById('usersinput').value;
        const formpass = document.getElementById('userspassword').value;
        const loginButton = document.getElementById('login-button');

        loginButton.disabled = true;

        if (!forminput && !formpass) {
            loginButton.disabled = false;
            showError('INPUT FIELDS CANNOT BE EMPTY');
        } else if (!forminput) {
            loginButton.disabled = false;
            showError('INPUT YOUR EMAIL OR NUMBER');
        } else if (!formpass) {
            loginButton.disabled = false;
            showError('INPUT YOUR PASSWORD');
        } else {
            hideError();
            try {
                const loginFormJSON = {
                    usersinput: forminput,
                    userspassword: formpass
                };

                const response = await fetch('http://localhost:5000/login', {
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
                showSuccessPromptAndNavigate('promptId', './dashboard.html');
            } catch (error) {
                console.error('An error occurred:', error);
                showError(error.message);
            } finally {
                loginButton.disabled = false;
            }
        }
    }

    function showSuccessPromptAndNavigate(promptId, nextPage) {
        const successPrompt = document.getElementById(promptId);

        if (successPrompt) {
            successPrompt.classList.remove('hidden-registration-prompt');
            successPrompt.classList.add('prompt-visible');

            setTimeout(() => {
                window.location.href = nextPage;
            }, 5000);
        }
    }

    document.getElementById('login-button').addEventListener('click', handleLogin);
});
