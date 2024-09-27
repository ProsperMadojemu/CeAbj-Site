document.addEventListener('DOMContentLoaded', async () => {
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
                        const welcomeGreeting = document.querySelector('#usersdetails');
                        const logoutButton = document.getElementById('Logout-Button');
                        welcomeGreeting.innerHTML = `${user.Title} ${user.FirstName} ${user.LastName}`;
                        logoutButton.addEventListener('click', () => {
                            fetch('/logout', { method: 'POST' })
                                .then(() => {
                                    window.location.reload();
                                })
                                .catch(error => {
                                    console.error('Error during logout:', error);
                                });
                        });
                    }
                    else {
                        window.location.href = '/login';
                    }
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                });
        } else {
            window.location.href = '/login';
        }
    })
    .catch(error => {
        console.error('Error checking session:', error);
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
    function formatDate(dateString) {
        try {
            if (!dateString || dateString.toLowerCase() === 'nill') {
                return 'date error';
            }
    
            const date = new Date(dateString);  
    
            if (isNaN(date)) {  
                return 'date error';
            }
    
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }); 
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
    
            return `${dayOfWeek}, ${month} ${day}${ordinalSuffix(day)} ${year}`;
    
        } catch (error) {
            console.error(error);
            return 'date formatting error';
        }
    }
    
    function formatTime(dateString) {
        try {
            if (!dateString || dateString.toLowerCase() === 'nill') {
                return 'date error';
            }
            const date = new Date(dateString);
            if (isNaN(date)) {
                return 'date error';
            }
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            
            hours = hours % 12;
            hours = hours ? hours : 12;  
            const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
            return `${hours}:${formattedMinutes} ${ampm}`;
        } catch (error) {
            console.error(error);
            return 'date formatting error';
        }
    }

    const body = document.getElementById('mail-body');
    const messageBody = document.querySelector("#messageBody");
    const tableBody = document.querySelector('#tableBody tbody');

    async function getMessage(){
        let data = null;

        try {
            const response = await fetch('/api/messages/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            data = await response.json();
            populateData(data)
        } catch (error) {
            console.error("Error fetching sent messages:", error);
            return;
        }
    }

    let id = null;
    let unreadCount;
    const populateData = async(data) =>{
        if(!tableBody) {console.log('no table found');}
        tableBody.innerHTML = ``
        const messages = data.message
        const isVisibleBool = messages.every(message => !message.Recipients[0].isVisible);
        
        if (isVisibleBool || messages.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5">No Messages found.</td></tr>`
            console.log('no message');
            return
        }
        let recipients
        messages.forEach((message, index) => {
            recipients = message.Recipients;
            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td class="sender-cl ${!message.Recipients[0].isRead ? 'bl': ''}"><span class="sender">Admin</span></td>
            <td class="subj-cont-cl"><span class="subject ${!message.Recipients[0].isRead ? 'bl': ''}">${message.Subject}</span><span class="content"><span class="intersect">-</span>${message.Content}</span></td>
            <td class="gap-cl"><span class="gap"></span></td>
            <td class="time-cl ${!message.Recipients[0].isRead ? 'bl': ''}"><span class="time">${formatDateToDayMonthYear(message.time)}</span></td>
            <td class="actions"><button type="button" class="material-symbols-outlined delete delete-btn">delete</button></td>
            `
            tr.style.display = message.Recipients[0].isVisible ? `flex` : `none`;
            tr.addEventListener('click', (event) => {
                event.stopPropagation();
                id = messages[index];
                window.location.hash = `#view/${id._id}`
                readHandler(id);
            })
            tableBody.appendChild(tr);
        });
        unreadCount = recipients.filter(recipient => !recipient.isRead).length;
        document.querySelector(".count").innerHTML = `${unreadCount} Unread`
        const deleteButton = document.querySelectorAll('.delete')
        deleteButton.forEach((button, index) => {
            button.addEventListener('click', (event)=> {
                event.stopPropagation();
                id = messages[index];
                deleteMessage(id)
            })
        });
    }

    let isFullMessage = false;

    async function getFullMessage(id) {
        let data = null;
        try {
            const response = await fetch('/api/messages/getall', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id }),
            });
            if (!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            data = await response.json();
        } catch (error) {
            console.error("Error fetching messages:", error);
            return;
        }
        if (data) {
            await displayFullMail(data);
        } else {
            console.error("Invalid data format:", data);
        }
    }



    async function displayFullMail(data) {
        const response = await fetch(`/dashboard/templates/view.html`);
        const htmlTemplate = await response.text();
        
        const info = await data.message;
        console.log(info, htmlTemplate);
    
        if (!isFullMessage) {
            messageBody.style.display = 'none';
            isFullMessage = true;
        }
    
        let htmlContent = htmlTemplate
            .replace('{{Subject}}', info.Subject || 'No Subject')
            .replace('{{name}}', info.name || 'Unknown Sender')
            .replace('{{Content}}', info.Content || 'No Content')
            .replace('{{date}}', formatDate(info.time || new Date()))
            .replace('{{time}}', formatTime(info.time || new Date()))
            .replace('{{style}}', `${info.Image ? `style=display:block;` : `style=display:none;`}` || '')
            .replace('{{image}}', `/images/${info.Image}` || '');
    
        body.innerHTML += htmlContent;

    }

    async function deleteMessage(id) {
        if (!id.Recipients[0].isVisible) return;
        
        try {
            const messageId = id._id;
            const response = await fetch('/api/messages/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: messageId, isVisible: false }),
            });
        
            if (!response.ok) {
                throw new Error("Failed to delete message.");
            }
            location.reload();
        } catch (error) {
            console.error(error);
        }
    }
    async function readHandler(id) {
        if (id.Recipients[0]?.isRead) {
            return;
        }
        
        try {
            const messageId = id._id;
            const response = await fetch('/api/messages/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: messageId, isRead: true }),
            });
        
            if (!response.ok) {
                throw new Error("Failed to delete message.");
            }
        } catch (error) {
            console.error(error);
        }
    }
    async function checkURL() {
        if (!window.location.hash.startsWith('#view/')) {
            resetContent();
        }
        await getMessage();
    }
    checkURL();

    function resetContent() {
        if (messageBody.style.display === 'none') {
            messageBody.style.display = 'flex'; 
        }
        body.innerHTML = ``
        isFullMessage = false;
    }
    async function checkQueryParams() {
        const [, messageId] = window.location.hash.split('/');
    
        if (window.location.hash.startsWith('#view/')) {
            await getFullMessage(messageId);
        } else {
            resetContent();
        }
    }
    
    window.addEventListener('hashchange', checkQueryParams);
    checkQueryParams();
    
});
