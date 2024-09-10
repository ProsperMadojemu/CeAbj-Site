document.addEventListener('DOMContentLoaded', async () => {
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
                        window.location.href = '../404.html';
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    window.location.href = '../404.html';
                });
        } else {
            window.location.href = '/pages/login.html';
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
        window.location.href = '/pages/login.html';
    });

    document.getElementById('DrawerIcon').addEventListener('click', function() {
        const navbar = document.querySelector('.vertical-navbar');
        if (!navbar.classList.contains('active')) {
            navbar.classList.add('active');
        }else {
            navbar.classList.remove('active');
        }
    });
    
    document.getElementById('CloseDrawer').addEventListener('click', function() {
        const navbar = document.querySelector('.vertical-navbar');
        if (navbar.classList.contains('active')) {
            navbar.classList.remove('active');
        }
    });

    const messageOverlay = document.getElementById('message-prompt');
    const messageOverlayText = document.getElementById('message-text');
    const messageOverlaySign = document.getElementById('message-sign');

    function showPrompt(message) {
        messageOverlay.classList.remove('hidden');
        messageOverlayText.textContent = message;
        if (messageOverlay.timeoutId) {
            clearTimeout(messageOverlay.timeoutId);
        }
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

    async function getMessages() {
        try {
            const response = await fetch('/api/messages/view');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            populateMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }
    getMessages();
    
    function populateMessages(data) {
        const messageContainer = document.querySelector("#messageBody");
        
        const messages = data.message;
        messageContainer.innerHTML= ``
        console.log(messages)    
        messages.forEach(info => {
            const container = document.createElement('div');
            container.classList.add('message-prev');
            container.innerHTML= `
                <div class="left">
                    <span class="sender">To: ${info.Recipients}</span>
                </div>
                <div class="right">
                    <div class="wrapper">
                    <span class="subject">${info.Subject} -</span>
                    <span class="content">${info.Content} </span>
                    <span class="time">Aug 12</span>
                    </div>
                </div>
                <div class="actions">
                    <button type="button" class="material-symbols-outlined delete">delete</button>
                </div>
            `
            messageContainer.appendChild(container)
        });
    }
    
    const imageInput = document.getElementById('Image');
    const imagePreview = document.getElementById('image-preview');
    const fileName = document.getElementById('filename');
    const uploadContainer = document.getElementById('upload');
    const removeButton = document.getElementById('remove-button');
    
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (uploadContainer.classList.contains('hidden')){
        uploadContainer.classList.toggle('upload')
        fileName.textContent= file.name;
        const reader = new FileReader();
        reader.onload = () => {
          imagePreview.src = reader.result;
        };
        reader.readAsDataURL(file);
      }
      
    });

    removeButton.addEventListener('click', () => {
        imagePreview.src = '';
        fileName.textContent = '';
        
        uploadContainer.classList.toggle('upload');
        uploadContainer.classList.add('hidden');
        imageInput.value = '';
    });
    
    const sendButton = document.getElementById('send-button');
    const fileInput = document.getElementById('Image');
    const contentInput = document.getElementById('content');
    
    sendButton.addEventListener('click', async function (e) {
        e.preventDefault();
        const messagesForm = document.getElementById('messagesForm');
        try {
            const formData = new FormData(messagesForm);
            formData.append('image', fileInput.files[0]);
            formData.append('Content', contentInput.textContent);

            const response = await fetch('/api/messages/send', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to Register Cell');
            }
            location.reload();
        } catch (error) {
            console.error(error);
        }
    });

});
