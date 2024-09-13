document.addEventListener('DOMContentLoaded', async () => {

    const loader = document.querySelector('.loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('notvisible');
            
            loader.addEventListener('transitionend', () => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            });
            
        }, 1500);
    });
    

    fetch('/check-session')
    .then(response => response.json())
    .then(sessionData => {
        if (sessionData.email && sessionData.isAdmin) {
            // Fetch admin data from getalldata route
            // console.log(sessionData.isAdmin);
            
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

    function formatDateToDayMonthYear(dateString) {
        try {
            // Check if the date string is valid
            if (!dateString || dateString.toLowerCase() === 'nill') {
                return 'date error';
            }
    
            // Create a new Date object from the ISO 8601 date string
            const date = new Date(dateString);
    
            // Check if the date is valid
            if (isNaN(date.getTime())) {
                return 'date parsing error';
            }
    
            // Get the day, month, and year
            const day = date.getDate();
            const monthNames = [
                "January", "February", "March", "April", "May", "June", 
                "July", "August", "September", "October", "November", "December"
            ];
            const month = monthNames[date.getMonth()]; // Get the month name
            const year = date.getFullYear();
    
            // Determine the correct ordinal suffix for the day
            const ordinalSuffix = (day) => {
                if (day > 3 && day < 21) return 'th'; // Covers 11th to 20th
                switch (day % 10) {
                    case 1:  return 'st';
                    case 2:  return 'nd';
                    case 3:  return 'rd';
                    default: return 'th';
                }
            };
    
            // Return the formatted date string
            return `${day}${ordinalSuffix(day)}, ${month} ${year}`;
        } catch (error) {
            console.error(error);
            return 'date formatting error';
        }
    }
    
    async function chartData(){
        try {
            const response = await fetch('/charts-data');
            if(!response.ok) {
                throw new Error('error fetching data')
            }
            const data = await response.json();
            const numberOfLeaders = document.getElementById('numberOfLeaders');
            const numberOfUsers = document.getElementById('numberOfUsers');
            const pcfs = document.querySelector('#numberOfPcfs');
            const pcfsCaoruselBottom = document.querySelector('.numberOfPcfs');
            const seniorCells = document.querySelector('#numberOfSeniorCells');
            const cells = document.querySelector('#numberofcells');
            const cellsCarouselTop = document.querySelector('.numberofcells');
            numberOfUsers.innerHTML = `${data.usersNumber}`
            numberOfLeaders.innerHTML= `${data.totalNumberOfLeaders}`
            pcfs.innerHTML= `${data.pcfLeaders}`
            pcfsCaoruselBottom.innerHTML= `${data.pcfLeaders}`
            seniorCells.innerHTML= `${data.seniorCellLeaders}`
            cells.innerHTML= `${data.cellLeaders}`
            cellsCarouselTop.innerHTML= `${data.cellLeaders}`
            
            populateReportTable(data.leadersReport);
            populateLeaderTable(data.leadersData);
        } catch (error) {
            console.error('error fetching chart data:', error);
        }
    }

    chartData();

    function populateReportTable(data) {
        let count = 1;
        const reportTableBody = document.querySelector('#reports-Table tbody')
        reportTableBody.innerHTML = ``;
        data.forEach(report => {
            const reportRow = document.createElement('tr');
            reportRow.innerHTML = `
                <td>${count++}. ${report.FirstName} ${report.LastName}</td>
                <td>${report.CellName}</td>
                <td>${report.ServiceAttendance}</td>
                <td>${report.CellMeetingAttendance}</td>
                <td>${report.CellFirstTimers}</td>
                <td>${report.SundayFirstTimers}</td>
                <td>${report.offering}</td>
            `
            reportTableBody.appendChild(reportRow);
        });
    }
    
    function populateLeaderTable(data) {
        let count = 1;
        const leadersTable = document.querySelector('#leaders-table tbody')
        leadersTable.innerHTML = ``;
        data.forEach(leader => {
            const date = formatDateToDayMonthYear(leader.SubmissionDate);
            const leadersRow = document.createElement('tr');
            leadersRow.innerHTML = `
                <td>${count++}. ${leader.NameOfLeader}</td>
                <td>${leader.NameOfCell}</td>
                <td>${leader.LeaderPosition} Leader</td>
                <td>${date}</td>
            `
            leadersTable.appendChild(leadersRow);
        });
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

    const carouselRow = document.querySelector('.slides-row');
    const carouselSlides = document.getElementsByClassName('slide');
    const dots = document.getElementsByClassName('dot');
    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');

    let index = 1;
    var width;


    function slideWidth() {
        width = carouselSlides[0].clientWidth;
    }
    slideWidth();
    window.addEventListener('resize', slideWidth);
    carouselRow.style.transform = 'translateX('+(- width * index) + 'px)';

    nextBtn.addEventListener('click', nextSlide)
    function nextSlide() {
        if(index >= carouselSlides.length - 1){return}
        carouselRow.style.transition = 'transform 0.4s ease-out'
        index++;
        carouselRow.style.transform = 'translateX('+(- width * index) + 'px)';
        dotsLabel();
    }

    prevBtn.addEventListener('click', prevSlide)
    function prevSlide() {
        if(index <= 0){return}
        carouselRow.style.transition = 'transform 0.4s ease-out'
        index--;
        carouselRow.style.transform = 'translateX('+(- width * index) + 'px)';
        dotsLabel();
    }

    carouselRow.addEventListener('transitionend', function(){
        if(carouselSlides[index].id === 'firstIframeDuplicate') {
            carouselRow.style.transition = 'none';
            index = carouselSlides.length - index;
            carouselRow.style.transform = 'translateX('+(- width * index) + 'px)';
            dotsLabel();
        }       

        if(carouselSlides[index].id === 'lastIframeDuplicate') {
            carouselRow.style.transition = 'none';
            index = carouselSlides.length - 2;
            carouselRow.style.transform = 'translateX('+(- width * index) + 'px)';
            dotsLabel();
        }
    })

    function autoSlide() {
        deleteInterval = setInterval(timer, 5000);
        function timer() {
            nextSlide();
        }
    }
    autoSlide();

    const mainContainer = document.querySelector('.container');
    mainContainer.addEventListener('mouseover', function(){
        clearInterval(deleteInterval);
    })

    mainContainer.addEventListener('mouseout', autoSlide)

    function dotsLabel() {
        let dotIndex = index;
    
        if (carouselSlides[index].id === 'lastIframeDuplicate') {
            dotIndex = dots.length;
        } else if (carouselSlides[index].id === 'firstIframeDuplicate') {
            dotIndex = 1;
        }
    
        for (let i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(' active', '');
        }
    
        dots[dotIndex - 1].className += ' active';
    }
    
    carouselRow.addEventListener('transitionend', function() {
        if (carouselSlides[index].id === 'firstIframeDuplicate') {
            carouselRow.style.transition = 'none';
            index = 1;
            carouselRow.style.transform = 'translateX(' + (-width * index) + 'px)';
            dotsLabel();
        } else if (carouselSlides[index].id === 'lastIframeDuplicate') {
            carouselRow.style.transition = 'none';
            index = carouselSlides.length - 2;
            carouselRow.style.transform = 'translateX(' + (-width * index) + 'px)';
            dotsLabel();
        }
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
    
});