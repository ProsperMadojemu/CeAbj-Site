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

let isLive = false;
let isFinished = false;
let data;
let meetingId;
let startTime = 0;
let elapsedTime = 0;
let intervalId = null;
const ws = new WebSocket('ws://localhost:5000');
const hash = window.location.hash;
const queryString = hash.split("?")[1];
const meetingButton = document.querySelector('.status-changer')
const title = document.querySelector('.title');
const outline = document.querySelector('.outline');
const duration = document.querySelector('.duration');
const views = document.querySelector('.views');
const viewsCount = document.querySelector('#liveviews');
const avgViews = document.querySelector('#avgViews');
const peakViewsCount = document.querySelector('#peakviews');
const participantTable = document.querySelector('.viewers-list')
const commentSendButton = document.querySelector('#comment_send')
const commentsBody = document.querySelector('#commentsBody');
const statusBody = document.querySelector('.data_info');
const resolutionBody = document.querySelector('.resolution');
const fpsBody =  document.querySelector('.Fps');
const codecBody =  document.querySelector('.Codec');
const incomingDataBody =  document.querySelector('.Incoming-data');
const outgoingDataBody =  document.querySelector('.Outgoing-data');
const audioCodecBody = document.querySelector('.audiocodec');
const sampleRateBody = document.querySelector('.sample-rate');
const peakViews2 = document.querySelector('.peak_views2');
const commentsLength = document.querySelector('.commentslength');
const audioChannelsBody = document.querySelector('.channels')
if (queryString) {
    const urlParams = new URLSearchParams(queryString);
    meetingId = urlParams.get("id");
}

function bytesToKbps(bytes, timeInSeconds) {
    if (timeInSeconds <= 0) {
      throw new Error("Time must be greater than zero.");
    }
    const bits = bytes * 8; 
    const kilobits = bits / 1000; 
    const kbps = kilobits / timeInSeconds;
    return Math.round(kbps);
}

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
        title.innerHTML = meeting.title
        outline.innerHTML = meeting.outline

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

let concurrentViewers = []
let users;
let comments;
let avgViewDur= 0;
let viewCount = 0;

ws.onmessage = (message) => {
    const socketData = JSON.parse(message.data);
    const currentTime = new Date().toLocaleTimeString();
    if (socketData.type === 'update') {
        // console.log(message, socketData.type);
        views.innerHTML = `${socketData.participants || '--'}`;
        viewsCount.innerHTML = `${socketData.participants || '--'}`;
        avgViews.innerHTML = `${socketData.averageViewDuration || '--'}`;
        peakViews2.innerHTML= `${socketData.peakParticipants}`
        peakViewsCount.innerHTML = `${socketData.peakParticipants || '--'}`;
        concurrentViewers.push({ views: socketData.peakParticipants, timestamp: currentTime });
        populateTable(socketData.names)
        console.log();
        users = socketData.names;
        avgViewDur = socketData.averageViewDuration
        viewCount = socketData.peakParticipants
        updateViews(socketData);
    }
    if (socketData.type === 'new-comment') {
        const { comment } = socketData
        comments = socketData.comment;
        commentsLength.innerHTML = `${comment.length}`
        console.log(comment);
        populateComments(comment);
    }
    if (socketData.type === 'stat-update') {
        const { stats } = socketData
        const video = stats.rtmp.server[0].application[0].live[0].stream[0].meta[0].video[0];
        const audio = stats.rtmp.server[0].application[0].live[0].stream[0].meta[0].audio[0];
        const bytes_in = stats.rtmp.bytes_in[0];
        const bytes_out = stats.rtmp.bytes_out[0];
        const streamStatus = stats.rtmp.server[0].application[0].live[0].nclients[0];
        const time = stats.rtmp.uptime[0];
        const kbps_in = bytesToKbps(bytes_in, time);
        
        const streamInfo = {
          videoCodec: video.codec[0],
          resolution: `${video.width[0]}x${video.height[0]}`,
          frameRate: video.frame_rate[0],
          audioCodec: audio.codec[0],
          sampleRate: audio.sample_rate[0],
          channels: audio.channels[0],
        //   status: data.rtmp.server[0].application[0].live[0].stream[0].publishing ? 'Active' : 'Inactive'
        };
        // console.log('bytes_in:',bytes_in, "bytes_out:", bytes_out, "streamStatus:",streamStatus, "time",time);
        updateHealth(streamInfo, kbps_in);
        codecBody.innerHTML = `${streamInfo.videoCodec}`
        resolutionBody.innerHTML = `${streamInfo.resolution}`
        statusBody.innerHTML = `${streamStatus > 0 ? "Connected to stream" : "No data is being received"}`
        incomingDataBody.innerHTML = `${kbps_in} kbps`
        audioCodecBody.innerHTML= `${streamInfo.audioCodec}`
        sampleRateBody.innerHTML= `${streamInfo.sampleRate/1000}khz`
        audioChannelsBody.innerHTML= `${streamInfo.channels}`
        // outgoingDataBody.innerHTML = `${stats}`
        fpsBody.innerHTML = `${streamInfo.frameRate}`
    }
};

function formatTime(seconds) {
    const totalSeconds = Math.round(seconds);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function populateComments(data) {
    commentsBody.innerHTML = ''
    data.forEach(user => {
        const li = document.createElement('li');
        li.classList.add("comments__list");
        li.innerHTML = `
            <div class="comment-name-time">
                <span class="comment name">${user.name}</span>
                <span class="comment time">${user.time}</span>
            </div>
            <span class="comment __content">${user.content}</span>
        `
        commentsBody.appendChild(li);
    });
}



function populateTable(data) {
    participantTable.innerHTML = ''
    data.forEach(user => {
        let durationCount = user.duration;
        const li = document.createElement('li');
        li.classList.add(`viewer${user.isOnline ? '' : '-offline'}`);
        const span = document.createElement('span');
        span.classList.add('viewers_duration_count')
        span.textContent = formatTime(durationCount)
        if (user.isOnline) {
            const intervalId = setInterval(() => {
                durationCount += 1;
                span.textContent = formatTime(durationCount)
            }, 1000);
        }
        li.innerHTML = `
            <span class="viewers_name">${user.email === 'admin@ceabaranje.com' ? 'Admin' : user.name}</span> 
            <span class="status ${user.isOnline ? 'online' : 'offline'}">${user.isOnline ? 'Online' : 'Offline'}</span>
        `
        li.appendChild(span);
        participantTable.appendChild(li);
    });
}

ws.onclose = () => {
    ws.send(JSON.stringify({ type: 'disconnect', duration }));
    console.log('Disconnected from WebSocket server');
};

function populateData(meeting) {
    console.log(isLive, isFinished);
    meetingButton.classList.add(`${meeting.status}`);
    meetingButton.innerHTML = `${meeting.status === 'scheduled' ? 'Go Live' : meeting.status}`
    if (!isLive && !isFinished) {
        console.log('condition met: Scheduled');
        closeSocket();
        if (meetingButton.classList.contains('live')) {
            meetingButton.classList.remove('live');
        }
        if (meetingButton.classList.contains('finished')) {
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

async function handleMeetingEnd(){
    try {
        const response = await fetch(`/api/meeting/update/${meetingId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                fields: {
                    comment: comments,
                    views: viewCount,
                    viewers: users,
                    averageViewDuration: avgViewDur
                }
            })
        });
        if (!response.ok) {
            throw new Error("Failed to update meeting.");
        }
    } catch (error) {
        console.log(error);
    }
}

function getTimeFormat(date) {
    const hour = date.getHours();
    const minutes = date.getMinutes();
    return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

commentSendButton.addEventListener('click', (e) => {
    e.preventDefault();
    const commentText = document.querySelector('#comment_text').value;
    const date = new Date();
    try {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'comment',
                name: 'Admin',
                content: commentText,
                time: getTimeFormat(date)
            }))
        }
        document.querySelector('#comment_text').value = '';
    } catch (err) {
        console.log(err);
    }
});

meetingButton.addEventListener('click', async () => {
    if (!isLive && !isFinished) {
        console.log('meeting is not live');
        updateStatus('live');    
        location.reload();
    }
    if (isLive && !isFinished) {
        console.log('meeting is live');
        updateStatus('finished');
        handleMeetingEnd();
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
            body: JSON.stringify({ status: status })
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
                data: [0], 
                borderColor: "blue",
                fill: false,
            },
            {
                label: "Key Frames (fps)",
                data: [0],
                borderColor: "green",
                fill: false,
            }
        ],
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: false,
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
const MAX_POINTS = 20;

const viewsChart = new Chart(vtx, {
    type: "line",
    data: {
        labels: [], // x-axis: time stamps
        datasets: [
            {
                label: "Concurrent Views",
                data: [0],
                borderColor: "blue",
                borderWidth: 2,
                fill: true,
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                pointRadius: 0,
            },
            {
                label: "Peak Views",
                data: [0],
                borderColor: "red",
                borderWidth: 2,
                fill: true,
                backgroundColor: "rgba(255, 0, 0, 0.2)",
                pointRadius: 0,
            },
            {
                label: "Views",
                data: [0],
                padding: '10',
                borderColor: "green",
                borderWidth: 2,
                fill: true,
                backgroundColor: "rgba(0, 255, 0, 0.2)",
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
                grid: {
                    display: false, // Hide vertical grid lines
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Views",
                },
                beginAtZero: true,
                ticks: {
                    stepSize: 2, // Steps of 2: 0, 2, 4, 6, etc.
                    callback: function (value) {
                        return value; // Display the tick value as is
                    }
                },
                suggestedMax: 12, // Initial max value
                grid: {
                    drawOnChartArea: true, // Hide vertical lines
                },
            },
        },
        plugins: {
            // Custom plugin to dynamically adjust the y-axis max value based on data
            afterDatasetUpdate: function (chart) {
                const dataset0Max = Math.max(...chart.data.datasets[0].data);
                const dataset1Max = Math.max(...chart.data.datasets[1].data);
                const dataset2Max = Math.max(...chart.data.datasets[2].data);

                // Get the maximum value from all datasets
                const maxViews = Math.max(dataset0Max, dataset1Max, dataset2Max);

                // Adjust the y-axis max to the next multiple of 4
                const dynamicMax = Math.ceil(maxViews / 4) * 4 + 4;

                // Set the new max dynamically
                chart.options.scales.y.suggestedMax = dynamicMax;
                chart.update(); // Force the chart to re-render with new max
            }
        }
    }
});


function updateViews(socketData) {
    const currentTime = new Date().toLocaleTimeString(); // Use current time for x-axis labels

    if (viewsChart.data.labels.length >= MAX_POINTS) {
        viewsChart.data.labels.shift();
        viewsChart.data.datasets[0].data.shift();
        viewsChart.data.datasets[1].data.shift();
        viewsChart.data.datasets[2].data.shift();
    }
    // Update chart data
    viewsChart.data.labels.push(currentTime);
    viewsChart.data.datasets[1].data.push(socketData.peakParticipants); // Peak Views
    viewsChart.data.datasets[2].data.push(socketData.participants); // Total Views
    viewsChart.update();
}

function updateHealth(streamInfo, kbps_in) {
    const currentTime = new Date().toLocaleTimeString(); // Use current time for x-axis labels

    if (healthChart.data.labels.length >= MAX_POINTS) {
        healthChart.data.labels.shift();
        healthChart.data.datasets[0].data.shift();
        healthChart.data.datasets[1].data.shift();
    }
    // Update chart data
    healthChart.data.labels.push(currentTime);
    healthChart.data.datasets[0].data.push(kbps_in); // Peak Views
    healthChart.data.datasets[1].data.push(streamInfo.frameRate); // Total Views
    healthChart.update();
}

function concurrentChart() {
    let arrLength = concurrentViewers.length - 1

    if (concurrentViewers.length > 0) {
        viewsChart.data.labels.push(concurrentViewers[arrLength].timestamp);
        viewsChart.data.datasets[0].data.push(concurrentViewers[arrLength].views);
        viewsChart.update();
    }
}

setInterval(() => {
    concurrentChart();
}, 60000);
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
