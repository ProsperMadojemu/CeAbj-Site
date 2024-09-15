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

    document.getElementById('DrawerIcon').addEventListener('click', function () {
        const navbar = document.querySelector('.vertical-navbar');
        if (!navbar.classList.contains('active')) {
            navbar.classList.add('active');
        } else {
            navbar.classList.remove('active');
        }
    });

    document.getElementById('CloseDrawer').addEventListener('click', function () {
        const navbar = document.querySelector('.vertical-navbar');
        if (navbar.classList.contains('active')) {
            navbar.classList.remove('active');
        }
    });


    function formatDateToDayMonthYear(dateString) {
        try {
            // Check if the date string is valid
            if (!dateString || dateString.toLowerCase() === 'nill') {
                return 'date error';
            }
    
            const date = new Date(dateString);
    
            if (isNaN(date.getTime())) {
                return 'date parsing error';
            }
    
            const day = date.getDate();
            const monthNames = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
            ];
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
    
            const ordinalSuffix = (day) => {
                if (day > 3 && day < 21) return 'th';
                switch (day % 10) {
                    case 1:  return 'st';
                    case 2:  return 'nd';
                    case 3:  return 'rd';
                    default: return 'th';
                }
            };
    
            return `${day}${ordinalSuffix(day)}, ${month}`;
        } catch (error) {
            console.error(error);
            return 'date formatting error';
        }
    }
    
    const messageBody = document.querySelector("#messageBody");
    const toInboxBtn = document.querySelector('[title="Inbox"]');
    const toSentBtn = document.querySelector('[title="Sent-Messages"]');
    const toMembBtn = document.querySelector('[title="Membership-Forms"]');
    const toFeedBtn = document.querySelector('[title="Feed-back"]');
    const toScheduledBtn = document.querySelector('[title="Scheduled-messages"]');
    const buttons = document.querySelectorAll('.nav__btn');
        
    async function checkURL() {
        const hash = window.location.hash.substring(1);
        const url = hash.split('/')[0];
        if (!url) {
            console.log("No URL hash detected.");
            // await displayContent('inbox');
            window.location.hash=`inbox/`
            return;
        }
        await displayContent(url);
    }

    async function displayContent(url) {
        
        try {
            const response = await fetch(`/admin/templates/${url}.html`);
            const htmlTemplate = await response.text();

            switch (url) {
                case 'sent':
                    buttons.forEach(button => button.classList.remove('active'));
                    toSentBtn.classList.add('active');
                    await getMessages(url, htmlTemplate);
                    console.log('Processing "sent" case');
                    break;
                case 'membership':
                    buttons.forEach(button => button.classList.remove('active'));
                    toMembBtn.classList.add('active');
                    await getMessages(url, htmlTemplate);
                    console.log('Processing "membership" case');
                    break;
                case 'feedBacks':
                    buttons.forEach(button => button.classList.remove('active'));
                    toFeedBtn.classList.add('active');
                    await getMessages(url, htmlTemplate);
                    console.log('Processing "feedBacks" case');
                    break;
                case 'scheduled':
                    buttons.forEach(button => button.classList.remove('active'));
                    toScheduledBtn.classList.add('active');
                    await getMessages(url, htmlTemplate);
                    console.log('Processing "scheduled" case');
                    break;
                default:
                    buttons.forEach(button => button.classList.remove('active'));
                    toInboxBtn.classList.add('active');
                    await getMessages(url, htmlTemplate);
                    console.log('Default case: "inbox"');
                break;
            }
        } catch (error) {
            console.error("Error displaying content:", error);
        }
    }

    async function getMessages(url, htmlTemplate) {
        let data = null;

        if (url === 'inbox') {
            try {
                const response = await fetch('/api/messages/list');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                data = await response.json();
            } catch (error) {
                console.error("Error fetching messages:", error);
                return;
            }
        } else {
            try {
                const response = await fetch('/api/messages/view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: url }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                data = await response.json();
            } catch (error) {
                console.error("Error fetching messages:", error);
                return;
            }
        }

        if (data && data.message) {
            await populateData(data, htmlTemplate);
        } else {
            console.error("Invalid data format:", data);
        }
    }

    async function populateData(data, htmlTemplate) {
        const messages = Array.isArray(data.message) ? data.message : [];
    
        if (messages.length === 0) {
            messageBody.innerHTML = `
            <div>Oops, No Messages have been found, please try again later</div>
            `;
            return;
        }
    
        let htmlContent = ``;
    
        messages.forEach((info) => {
            let htmlData = htmlTemplate
                .replace('{{type}}', info.type)
                .replace('{{Subject}}', info.Subject)
                .replace('{{Recipients}}', info.Recipients)
                .replace('{{Content}}', info.Content)
                .replace('{{date}}', formatDateToDayMonthYear(info.time));
    
            htmlContent += htmlData;
        });
    
        messageBody.innerHTML = htmlContent;
    
        const deleteButtons = messageBody.querySelectorAll('.delete-btn');
    
        deleteButtons.forEach((deleteButton, index) => {
            deleteButton.addEventListener("click", async () => {
                selectedMessage = messages[index];
                await deleteMessage(selectedMessage);
            });
        });
    }



    let selectedMessage;    
    async function deleteMessage(selectedMessage) {
        try {
            const messageId = selectedMessage._id;
            const response = await fetch('/api/messages/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: messageId }),
            });
        
            if (!response.ok) {
            throw new Error("Failed to delete message.");
            }
            location.reload();
        } catch (error) {
            console.error(error);
        }
    }


    const imageInput = document.getElementById('Image');
    const imagePreview = document.getElementById('image-preview');
    const fileName = document.getElementById('filename');
    const uploadContainer = document.getElementById('upload');
    const removeButton = document.getElementById('remove-button');

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (uploadContainer.classList.contains('hidden')) {
            uploadContainer.classList.toggle('upload')
            fileName.textContent = file.name;
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
                throw new Error(result.error || 'Failed to send message');
            }
            closeModal();
            location.reload();
        } catch (error) {
            console.error(error);
        }
    });

    function closeModal() {
        const url = new URL(window.location.href);
        let hash = url.hash.slice(1); // Removes the leading "#"
        const [mainSection, currentQuery] = hash.split('?');
        const params = new URLSearchParams(currentQuery);
        params.delete('send');
        const newHash = params.toString() ? `${mainSection}?${params.toString()}` : mainSection;
        window.location.hash = newHash;
        const modal = document.getElementById("modal");
        if (modal) {
          modal.classList.remove('modal'); // Remove the modal class to hide the modal
        }
    }



    // checkURL();

    function checkQueryParams() {
        const currentHash = window.location.hash.slice(1);
      
        const [mainSection, queryString] = currentHash.split('?');
      
        const params = new URLSearchParams(queryString);
      
        if (params.get('send') === 'true') {
          toggleModalAction(); 
        } 
      }
      
      function toggleModalAction() {
        const modal = document.getElementById("modal");
        if (modal) {
          modal.classList.toggle('modal');
        }
    }


    
    window.addEventListener('hashchange', checkQueryParams);
    
    checkQueryParams();

    
    toInboxBtn.addEventListener('click', function(){window.location.hash=`inbox/`})
    toSentBtn.addEventListener('click', function(){window.location.hash=`sent/`})
    toMembBtn.addEventListener('click', function(){window.location.hash=`membership/`})
    toFeedBtn.addEventListener('click', function(){window.location.hash=`feedBacks/`})
    toScheduledBtn.addEventListener('click', function(){window.location.hash=`scheduled/`})
    window.onpopstate = checkURL;
    checkURL();
});
