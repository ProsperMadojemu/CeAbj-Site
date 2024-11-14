document.addEventListener('DOMContentLoaded', async () => {
    // Fetch session data
    // fetch('/check-session')
    // .then(response => response.json())
    // .then(sessionData => {
    //     if (sessionData.email && sessionData.isAdmin) {
    //         // Fetch admin data from getalldata route
    //         fetch('/api/user/getalldata')
    //             .then(response => response.json())
    //             .then(data => {
    //                 // Check if the logged-in user is an admin
    //                 const admin = data.admin.find(a => a.email === sessionData.email);
    //                 if (!admin) {
    //                     window.location.href = '/404';
    //                 }
    //             })
    //             .catch(error => {
    //                 console.error('Error fetching data:', error);
    //                 window.location.href = '/404';
    //             });
    //     } else {
    //         window.location.href = '/login';
    //     }

    //     const logoutButton = document.getElementById('Logout-Button');
    //     logoutButton.addEventListener('click', () => {
    //         fetch('/api/user/logout', { method: 'POST' })
    //             .then(() => {
    //                 window.location.reload();
    //             })
    //             .catch(error => {
    //                 console.error('Error during logout:', error);
    //             });
    //     });
    // })
    // .catch(error => {
    //     console.error('Error checking session:', error);
    //     window.location.href = '/login';
    // });
    
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


    let rangeValue = 0;
    const rangeInput = document.getElementById('limit');
    const rangeValueInput = document.getElementById('range');
    rangeInput.addEventListener("change", function(){
        rangeValue = rangeInput.value
        rangeValueInput.value = rangeValue
    })
    rangeValueInput.addEventListener("input", function(){
        rangeValue = rangeValueInput.value
        rangeInput.value = rangeValue
    });

    const showSchedulerBtn = document.getElementById('show_meeting_sch');
    const schedulerBody = document.querySelector('.meeting-form-container');
    showSchedulerBtn.addEventListener('click', function() {
        showSchedulerBtn.classList.toggle('no-action')
        if (schedulerBody.style.display === "none"){
            schedulerBody.style.display = "block"
        } else {
            schedulerBody.style.display = "none"
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
    const meetingForm = document.getElementById('meetingForm');
    const newMeetingBtn = document.getElementById('newMeetingBtn'); 
    newMeetingBtn.addEventListener('click', async function(e) {
        const startDate = document.querySelector('#startTime').value;
        const endDate = document.querySelector('#EndTime').value;
        let isValid = true;
        const formInputFields = meetingForm.querySelectorAll('input[required]');
        formInputFields.forEach(input => {
            if (!input.value) {
                isValid = false;
                input.classList.add('error'); 
            } else {
                input.classList.remove('error');
            }
        });

        if (!isValid) {
            toastErr('Please fill in all required fields.');
            return;
        }
        e.preventDefault();
        
        try {
            const formData = new FormData(meetingForm);
            
            formData.append('startDate', new Date(startDate).toISOString());
            formData.append('endDate', new Date(endDate).toISOString());
            const response = await fetch('/api/meeting/create', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                showErr('Failed to create meeting');
                throw new Error('Failed to Create Meeting');
            }

            showToast(response);
            setInterval(() => {location.reload()}, 5000);
        } catch (error) {
            console.error(error);
        }
    });

    const upcomingTableBody = document.querySelector('#upcoming-meetings-table tbody');
    const liveTableBody = document.querySelector('#live-meetings-table tbody');
    const mainTableBody = document.querySelector('#main-meetings-table tbody');

    async function getMeetings() {
        try {
            const response = await fetch('/api/meeting/list');
            if (!response.ok) {
                const data = response.json();
                throw new Error(data.error || "Failed to get meetings");
            }
            const newResponse = await response.json();
            localStorage.setItem('meetings', JSON.stringify(newResponse));
            populateTables(newResponse);   
        } catch (error) {
            console.error(error);
        }

    }
    getMeetings();

    const deleteMeeting = async (id) => {
        try {
            const response = await fetch('/api/meeting/delete',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id }),
            });
            if (!response.ok) {
                throw new Error("Failed to delete message.");
            }
            showToast(response);
            setInterval(() => {
                location.reload()
            }, 5000);
        } catch (error) {
            console.error(error);
        }
    }
    
    const populateTables = (newResponse) => {
        const data = newResponse.meetingsList
        const upcomingMeeting = data.filter(u => u.status === 'scheduled');
        const liveMeeting = data.filter(u => u.status === 'live');
        upcomingTableBody.innerHTML= ''
        liveTableBody.innerHTML= ''
        mainTableBody.innerHTML= ''

        // main table
        data.forEach(meeting => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="view">${meeting.title}</td>
                <td>${formatDate(meeting.startDate)}, ${formatTime(meeting.startDate)}</td>
                <td>${meeting.participantLimit <= 0 ? 'Nill' : meeting.participantLimit}</td>
                <td>${meeting.allowedParticipants}</td>
                <td class="${meeting.status === 'live' ? 'live' : ''}">${meeting.status}</td>
                <td>${meeting.views || '--'}</td>
                <td class="delete__Button">
                    <button type="Button" title="delete" class="mtndeletebtn" id="mainmeetingdelete">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </td>
            `
            mainTableBody.appendChild(tr);
        });
        

        // upcoming meeting table
        upcomingMeeting.forEach(meeting => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="view">${meeting.title}</td>
                <td>${formatDate(meeting.startDate)}, ${formatTime(meeting.startDate)}</td>
                <td>${meeting.participantLimit <= 0 ? 'Nill' : meeting.participantLimit}</td>
                <td>${meeting.allowedParticipants}</td>
                <td class="">${meeting.status}</td>
                <td>${meeting.views || '--'}</td>
                <td class="delete__Button">
                    <button type="Button" title="delete" class="mtndeletebtn" id="upcmeetingdelete">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </td>
            `
            upcomingTableBody.appendChild(tr);
        });

        // Live meeting table
        liveMeeting.forEach(meeting => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="view">${meeting.title}</td>
                <td>${formatDate(meeting.startDate)}, ${formatTime(meeting.startDate)}</td>
                <td>${meeting.participantLimit <= 0 ? 'Nill' : meeting.participantLimit}</td>
                <td>${meeting.allowedParticipants}</td>
                <td class="live">${meeting.status}</td>
                <td>${meeting.views || '--'}</td>
                <td class="delete__Button">
                    <button type="Button" title="delete" class="mtndeletebtn" id="livemeetingdelete">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </td>
            `
            liveTableBody.appendChild(tr);
        });

        const tables = document.querySelectorAll('.__table');
        tables.forEach(table => {
            const deleteBtn = table.querySelectorAll('.mtndeletebtn');
            const titleLink = table.querySelectorAll('.view');
            deleteBtn.forEach((btn, index) =>{
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteMeeting(data[index]._id);
                })
            });
            titleLink.forEach((title,index )=> {
                title.addEventListener("click",()=> {
                    window.location.href = `/admin/watch#${data[index].title}?id=${data[index]._id}`
                });
            });
        })
    };
});
