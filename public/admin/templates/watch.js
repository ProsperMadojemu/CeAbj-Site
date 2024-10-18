const navbar = document.querySelector(".vertical-navbar");
document.getElementById("DrawerIcon").addEventListener("click", function () {
    if (!navbar.classList.contains("active")) {
        navbar.classList.add("active");
    } else {
        navbar.classList.remove("active");
    }
});

document.getElementById("CloseDrawer").addEventListener("click", function () {
    if (navbar.classList.contains("active")) {
        navbar.classList.remove("active");
    }
});

navbar.addEventListener("click", () => {
    if (navbar.classList.contains("active")) {
        navbar.classList.remove("active");
    }
});

window.addEventListener("resize", () => {
    if (navbar.classList.contains("active")) {
        navbar.classList.remove("active");
    }
});


const hash = window.location.hash;
const queryString = hash.split("?")[1];
const meetingButton = document.querySelector('.status-changer')
const title = document.querySelector('.title');
const outline = document.querySelector('.outline');
const duration = document.querySelector('.duration');
const views = document.querySelector('.views');
const viewsCount = document.querySelector('#liveviews');
const concViews = document.querySelector('#conViews');
const peakViewsCount = document.querySelector('#peakviews');
let meetingId;
if (queryString) {
    const urlParams = new URLSearchParams(queryString);
    meetingId = urlParams.get("id");
}

const ws = new WebSocket('ws://localhost:5000');
let isLive = false;
let isFinished = false;
let data;

(async () => {
    try {
        const response = await fetch('/api/meeting/listone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: meetingId }),
        });
        if (!response.ok) {
            throw new Error("Failed to find meeting.");
        }
        data = await response.json();
        const meeting = data.meeting;
        
        if (meeting.status.trim() === 'live') {
            isLive = true;
        }
        if (meeting.status === 'finished') {
            isFinished = true; 
        }
        populateData(meeting);
    } catch (error) { 
        console.error(error);
    }
})();

function closeSocket() {
    if (ws.readyState === WebSocket.OPEN) {
        console.log('Closing WebSocket connection...');
        ws.close(); 
    } else {
        console.log('WebSocket is already closed');
    }
}

ws.onopen = () => {
    console.log('Connected to the WebSocket server');
};

ws.onmessage = (message) => {
    const socketData = JSON.parse(message.data);
    if (socketData.type === 'update') {
        console.log(message, socketData.type);
        views.innerHTML = `${socketData.participants || '--'}`;
        viewsCount.innerHTML = `${socketData.participants || '--'}`;
        // concViews.innerHTML = `${socketData.names.length || '--'}`;
        peakViewsCount.innerHTML = `${socketData.names.length || '--'}`;
    }
};

ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
};

function populateData(meeting) {
    console.log(isLive, isFinished);
    meetingButton.classList.add(`${meeting.status}`);
    meetingButton.innerHTML = `${meeting.status === 'scheduled' ? 'Go Live' : meeting.status}`
    if (!isLive && !isFinished) {
        console.log('condition met: Scheduled');
        closeSocket();
        if (meetingButton.classList.contains('live') ) {
            meetingButton.classList.remove('live');
        }
        if (meetingButton.classList.contains('finished') ) {
            meetingButton.classList.remove('finished');
        }
    }
    if (!isLive && isFinished) {
        console.log('condition met: Finished');
        closeSocket();
        if (!meetingButton.classList.contains('finished')) {
            meetingButton.classList.add('finished');
        }
    }
}

meetingButton.addEventListener('click', async () => {
    if (!isLive && !isFinished) {
        console.log('meeting is not live');
        updateStatus('live');
        location.reload();
    }
    if (isLive && !isFinished) {
        console.log('meeting is live');
        updateStatus('finished');
        meetingButton.classList.remove('live');
    }
    if (!isLive && isFinished) {
        console.log('meeting has ended');
    }
});

async function updateStatus(status) {
    try {
        const response = await fetch(`/api/meeting/status/${meetingId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({status: status})
        });
        if (!response.ok) {
            throw new Error("Failed to find meeting.");
        }
        const newData = await response.json();

        if (newData.message && newData.success) {
            meetingButton.innerHTML = `${newData.message === 'scheduled' ? 'Go Live' : newData.message}`
            meetingButton.classList.add(`${newData.message}`);
        }
        
    } catch (error) {
        console.log(error);
    }
}



// health chart
const ctx = document.getElementById("healthChart").getContext("2d");
const healthChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [], // x-axis labels, e.g., timestamps
        datasets: [
            {
                label: "Bitrate (kbps)",
                data: [], // y-axis values for bitrate
                borderColor: "blue",
                fill: false,
            },
            {
                label: "Key Frames (fps)",
                data: [], // y-axis values for key frames
                borderColor: "green",
                fill: false,
            },
            {
                label: "Peak Viewers",
                data: [], // y-axis values for peak viewers
                borderColor: "red",
                fill: false,
            },
        ],
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time (s)",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Health",
                },
            },
        },
    },
});

// views chart
const vtx = document.getElementById("viewsChart").getContext("2d");
let concurrentViews = 0;
let peakViews = 0;
let totalViews = 0;

const MAX_POINTS = 20;

const viewsChart = new Chart(vtx, {
    type: "line",
    data: {
        labels: [], // x-axis: time stamps
        datasets: [
            {
                label: "Concurrent Views",
                data: [], // Real-time updates for concurrent views
                borderColor: "blue",
                fill: false,
                pointRadius: 0,
            },
            {
                label: "Peak Views",
                data: [], // Peak view updates
                borderColor: "red",
                fill: false,
                pointRadius: 0,
            },
            {
                label: "Total Views",
                data: [], // Total view count over time
                borderColor: "green",
                fill: false,
                pointRadius: 0,
            },
        ],
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time",
                },
                ticks: {
                    maxRotation: 0,
                    minRotation: 0,
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Views",
                },
            },
        },
        animation: {
            duration: 0,
        },
    },
});
function updateViews() {
    const currentTime = new Date().toLocaleTimeString(); // Use current time for x-axis labels

    // Simulate new concurrent viewers (you'd replace this with real-time data)
    concurrentViews = Math.floor(Math.random() * 100);
    totalViews += concurrentViews > 0 ? 1 : 0; // Increment total views if any viewers present

    // Check for peak views
    if (concurrentViews > peakViews) {
        peakViews = concurrentViews;
    }

    if (viewsChart.data.labels.length >= MAX_POINTS) {
        // Remove oldest data to keep chart clean
        viewsChart.data.labels.shift();
        viewsChart.data.datasets[0].data.shift();
        viewsChart.data.datasets[1].data.shift();
        viewsChart.data.datasets[2].data.shift();
    }

    // Update chart data
    viewsChart.data.labels.push(currentTime);
    viewsChart.data.datasets[0].data.push(concurrentViews); // Concurrent Views
    viewsChart.data.datasets[1].data.push(peakViews); // Peak Views
    viewsChart.data.datasets[2].data.push(totalViews); // Total Views
    viewsChart.update();
}

//metrics chart
const mtx = document.getElementById("metricsChart").getContext("2d");
const metricsChart = new Chart(mtx, {
    type: "line",
    data: {
        labels: [], // x-axis labels, e.g., timestamps
        datasets: [
            {
                label: "Comments",
                data: [], // y-axis values for bitrate
                borderColor: "blue",
                fill: false,
            },
            {
                label: "Likes",
                data: [], // y-axis values for key frames
                borderColor: "green",
                fill: false,
            },
            {
                label: "Peak Viewers",
                data: [], // y-axis values for peak viewers
                borderColor: "red",
                fill: false,
            },
        ],
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time (s)",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Metrics",
                },
            },
        },
    },
});
