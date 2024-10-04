document.addEventListener('DOMContentLoaded', () => {
    const navbarchange = document.querySelector('.landing-page-navbar');
    const buttonRemove = document.querySelector('.btn-71');

    if (window.location.pathname !== '/' && window.location.pathname !== '/') {
        if (navbarchange) {
            navbarchange.classList.add('navbar-bg-change');
        }
    }
    
    if (window.location.pathname !== '/register' && window.location.pathname !== '/') {
        if (buttonRemove) {
            buttonRemove.classList.add('btn-71-hide');
        }
    }

    let shouldShowPrompt = true;

    window.addEventListener('beforeunload', function (event) {
        if (shouldShowPrompt){
            const confirmationMessage = 'Changes you made may not be saved. Are you sure you want to leave?';
            event.returnValue = confirmationMessage;
            return confirmationMessage;
        }
    });
    
    function disablePrompt () {
        shouldShowPrompt = false;
    }

    const errorMessage = document.getElementById('error-message-first');
    const secondErrorMessage = document.getElementById('error-message-second');
    const passwordErrorMessage = document.getElementById('error-message-pass');

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

    function showSecondError(message2) {
        secondErrorMessage.classList.add('error-message-visible');
        secondErrorMessage.textContent = message2;
        if (secondErrorMessage.timeoutId) {
            clearTimeout(secondErrorMessage.timeoutId);
        }
        secondErrorMessage.timeoutId = setTimeout(() => {
            hideSecondError();
        }, 5000);
    }

    function showPasswordError(message3) {
        passwordErrorMessage.classList.add('error-message-visible');
        passwordErrorMessage.textContent = message3;
        if (passwordErrorMessage.timeoutId) {
            clearTimeout(passwordErrorMessage.timeoutId);
        }
        passwordErrorMessage.timeoutId = setTimeout(() => {
            hidePasswordError();
        }, 5000);
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


    function hideError() {
        errorMessage.classList.remove('error-message-visible');
        errorMessage.textContent = "";
    }

    function hideSecondError() {
        secondErrorMessage.classList.remove('error-message-visible');
        secondErrorMessage.textContent = "";
    }

    function hidePasswordError() {
        passwordErrorMessage.classList.remove('error-message-visible');
        passwordErrorMessage.textContent = "";
    }

    function resetFormFields(...fields) {
        fields.forEach(field => {
            if (field) {
                field.value = '';
            }
        });
    }

    function resetErrorMessages() {
        hideError();
        hideSecondError();
        hidePasswordError();
    }

    document.getElementById('nextform-button').addEventListener('click', function () {
        const formemail = document.getElementById('mail').value;
        const formfname = document.getElementById('fname').value;
        const formlname = document.getElementById('lname').value;
        const formphone = document.getElementById('phone').value;
        const formcountry = document.getElementById('country').value;
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        const allowedDomains = ['gmail.com', 'yahoo.com'];

        if (!formemail || !formfname || !formlname || !formphone || !formcountry) {
            showError("All fields are required");
        } else if (!emailPattern.test(formemail)) {
            showError("Please enter a valid email");
        } else {
            const emaildomain = formemail.split('@')[1];
            if (!allowedDomains.includes(emaildomain)) {
                showError("Please use either @yahoo or @gmail");
            } else {
                hideError();
                document.getElementById('first-form').classList.add('hidden');
                document.getElementById('nextform').classList.remove('next-register-hidden');
                document.getElementById('nextform').classList.add('visible');
            }
        }
    });

    document.getElementById('back_button').addEventListener('click', function () {
        resetErrorMessages();
        document.getElementById('first-form').classList.remove('hidden');
        document.getElementById('nextform').classList.remove('visible');
        document.getElementById('nextform').classList.add('next-register-hidden');
    });

    document.getElementById('churches').addEventListener('change', function(){
        handlechurchselection(this.value);
    });
    
    document.getElementById('zones').addEventListener('change', function(){
        handlezonesselection(this.value);
    });

    document.getElementById('others').addEventListener('change', function(){
        handleotherselection(this.value);
    });

    function handlechurchselection(churches) {
        const cellroles = document.querySelector('#roles-group');
        const othersrole = document.querySelector('#other-group');
        const zoneselector = document.querySelector('#zones-group');
        const departmentselector = document.querySelector('#dep-group');
        const churchinput = document.querySelector('#church-group');
        const cellname = document.querySelector('#cell-group');

        if (churches === 'other') {
            hideSecondError();
            if (cellroles) {
                resetFormFields(
                    document.getElementById('roles'),
                    document.getElementById('zones'),
                    document.getElementById('churchName'),
                    document.getElementById('departments'),
                    document.getElementById('cellName'),
                    document.getElementById('others')
                );
                othersrole.style.display = 'block';
                cellroles.style.display = 'none';
                zoneselector.style.display = 'none';
                churchinput.style.display = 'none';
                departmentselector.style.display = 'none';
                cellname.style.display = 'none';
                document.getElementById('others-label').innerHTML = 'Where are you visiting from';
            }
        } else {
            hideSecondError();
            if (cellroles) {
                resetFormFields(
                    document.getElementById('roles'),
                    document.getElementById('zones'),
                    document.getElementById('churchName'),
                    document.getElementById('departments'),
                    document.getElementById('cellName'),
                    document.getElementById('others')
                );
                othersrole.style.display = 'none';
                cellroles.style.display = 'block';
                churchinput.style.display = 'none';
                zoneselector.style.display = 'none';
                departmentselector.style.display = 'none';
                cellname.style.display = 'none';
                var zonesElement = document.getElementById('zones');
                var option = document.querySelector('option[value="ChristEmbassyLagosZone2"]');
                zonesElement.value = option.value;
                document.getElementById('roles').innerHTML = `
                <option value="" hidden>Kinship Title</option>
                <option value="Pastor">Pastor</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Deacon">Deacon</option>
                <option value="Deaconess">Deaconess</option>`;
            }
        }
    }

    function handleotherselection(other) {
        const zoneselector = document.querySelector('#zones-group');
        const churchinput = document.querySelector('#church-group');
        const departmentselector = document.querySelector('#dep-group');
        const cellname = document.querySelector('#cell-group');
        resetFormFields(
            document.getElementById('zones'),
            document.getElementById('churchName')
        );

        if (other === 'guest') {
            hideSecondError();
            zoneselector.style.display = 'none';
            churchinput.style.display = 'none';
            departmentselector.style.display = 'none';
            cellname.style.display = 'none';
        } else {
            hideSecondError();
            zoneselector.style.display = 'block';
            churchinput.style.display = 'block';
            departmentselector.style.display = 'none';
            cellname.style.display = 'none';
        }
    }

    function handlezonesselection(zones) {
        const churchinput = document.querySelector('#church-group');
        resetFormFields(
            document.getElementById('churchName')
        );

        if (zones) {
            hideSecondError();
            churchinput.style.display = 'block';
        }
    }

    let toastBox = document.getElementById('toastBox');
    let toastCount = 0
    function showToast(status, msg) {
        toastCount++
        let toast = document.createElement('div');
        toast.classList.add('toast');
        if (toastCount >= 5){
            toastCount = toastCount - toastCount + 1;
            toastBox.innerHTML = '';
        }
        toast.innerHTML = msg;
        toastBox.appendChild(toast);
        setTimeout(()=> {
            toast.remove();
        }, 5000)
    }
    document.getElementById('next_button').addEventListener('click', function () {
        const formchurches = document.getElementById('churches').value;
        const formroles = document.getElementById('roles').value;
        const formdepartments = document.getElementById('departments').value;
        const formchurchname = document.getElementById('churchName').value;
        const formcellname = document.getElementById('cellName').value;
        const formzones = document.getElementById('zones').value;
        const formothers = document.getElementById('others').value;

        if (!formchurches) {
            showSecondError("Please select your church");
        } 
        else if (formchurches === 'other' && !formothers) {
            showSecondError("Please fill out all fields");
        } 
        else if ((formchurches === 'CeAbaranjeGroup' || formchurches === 'CeAtan' || formchurches === 'CeNewigando' || formchurches === 'Cekingeternal' || formchurches === 'CeAbaranje2') && !formroles) {
            showSecondError("Please fill out all fields");
        } 
        else if (formothers === 'from-another-church' && !formzones) {
            showSecondError("Please select your zone");
        } 
        else if (formzones === 'zonalchurch' && !formchurchname) {
            showSecondError("Please enter the name of your church");
        } 
        else if (formroles === 'departmental-head' && !formdepartments) {
            showSecondError("Please enter the name of your department");
        }
        else {
            hideSecondError();
            document.getElementById('first-form').classList.add('hidden');
            document.getElementById('nextform').classList.add('hidden');
            document.getElementById('passwordform').classList.remove('password-form-hidden');
            document.getElementById('passwordform').classList.add('visible');
        }
    });

    document.getElementById('back2_button').addEventListener('click', function () {
        document.getElementById('first-form').classList.add('hidden');
        document.getElementById('passwordform').classList.add('password-form-hidden');
        document.getElementById('nextform').classList.remove('hidden');
        document.getElementById('nextform').classList.add('visible');
    });
    
    document.getElementById('submit_button').addEventListener('click', async function (event) {
        event.preventDefault();
    
        const submitButton = document.getElementById('submit_button');
        submitButton.disabled = true;
    
        const formpassword = document.getElementById('pass').value;
        const formconfirmpassword = document.getElementById('pass2').value;
    
        if (!formpassword || !formconfirmpassword) {
            showPasswordError("Please fill out all password fields");
            console.log("EMPTY INPUTS");
            submitButton.disabled = false;
        } else if (formpassword !== formconfirmpassword) {
            showPasswordError("Passwords do not match");
            console.log("not matching INPUTS");
            submitButton.disabled = false; 
        } else {
            try {
                hidePasswordError();
    
                // Getting data from all three forms 
                const formData1 = new FormData(document.getElementById('first-initial-form'));
                const formData2 = new FormData(document.getElementById('second-form'));
                const formData3 = new FormData(document.getElementById('third-form'));
    
                //Converting Form data to json object
                const formJSON = {};
                formData1.forEach((value, key) => { formJSON[key] = value });
                formData2.forEach((value, key) => { formJSON[key] = value });
                formData3.forEach((value, key) => { formJSON[key] = value });
    
                // Send the form data to the server using fetch
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formJSON)
                });
    
                if (!response.ok) {
                    throw new Error('Failed to register user');
                }
    
                const result = await response.json();
                console.log('User registered successfully:', result);
                disablePrompt();
                showPrompt("Registration Successful");

                setTimeout(() => {
                    window.location.href = '/login';
                }, 5000); 
            } catch (error) {
                console.error(error);
                showPasswordError('An error occurred');
            } finally {
                submitButton.disabled = false; 
            }
            
        }
    });

    document.getElementById('passwordbutton1').addEventListener('click', function() {
        togglePasswordVisibility('pass', 'pass-eye1');
    });
    document.getElementById('passwordbutton2').addEventListener('click', function() {
        togglePasswordVisibility('pass2', 'pass-eye2');
    });
        
    function togglePasswordVisibility(inputId, iconId) {
        var input = document.getElementById(inputId);
        var icon = document.getElementById(iconId);
    
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
});
