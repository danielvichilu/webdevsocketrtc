// global variables
let DEVICES=[]
const peerConnections = {};
let canvas = document.getElementById('canvas_mix');
let remoteContainer = document.getElementById('video_container');
let mixVideo = document.getElementById('mix_video');
  // --- prefix -----
  navigator.getUserMedia  = navigator.getUserMedia    || navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia || navigator.msGetUserMedia;
  RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
  RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;


//browserMCU
let mcu = new BrowserMCU();
function initMcu() {
  // --- init at once ---
  mcu.init(canvas, remoteContainer);
  // --- set frame rate --
  mcu.setFrameRate(7);

}

let localStreams = [];
function addVideo() {
  startMix();
  let mediaConstraints={video:{ 
    width: { min: 320, max: 320}, 
  height: { min: 240, max: 240 },
   frameRate:{min: 6, max: 7},
  }
}
getDeviceStream(mediaConstraints)
.then(function (stream) { // success
  localStreams.push(stream);
  mcu.addRemoteVideo(stream);
  
}).catch(function (error) { // error
  console.error('getUserMedia error:', error);
  return;
});
}

// function getMediaOptions() {
//   let sizeString = cameraSizeSelect.options[cameraSizeSelect.selectedIndex].value;

//   let options = { video: true, audio: true};
//   if (sizeString === 'VGA') {
//     options.video = { width: { min: 640, max: 640}, height: { min: 480, max: 480 } };
//   }
//   else if (sizeString === 'HD') {
//     options.video = { width: { min: 1280, max: 1280}, height: { min: 720, max: 720 } };
function getDeviceStream(option) {
if ('getUserMedia' in navigator.mediaDevices) {
  console.log('navigator.mediaDevices.getUserMadia');
  return navigator.mediaDevices.getUserMedia(option);
}
else {
  console.log('wrap navigator.getUserMadia with Promise');
  return new Promise(function(resolve, reject){    
    navigator.getUserMedia(option,
      resolve,
      reject
    );
  });      
}
}

// mix video from all cameras into one stream
function startMix(stream) {
  if (!mcu.isMixStarted()) {
    mcu.startMix();
    mixVideo.srcObject = mcu.getMixStream();
    mixVideo.play();  
    mixVideo.volume = 0;
    socket.emit('broadcaster');
  
  }
}

//stream local mixed video from all webcameras on local network
socket.on('answer', function(id, description) {
	peerConnections[id].setRemoteDescription(description);
});

socket.on('watcher', function(id) {
	const peerConnection = new RTCPeerConnection(config);
	peerConnections[id] = peerConnection;
	let stream = mcu.getMixStream();
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
	peerConnection.createOffer()
	.then(sdp => peerConnection.setLocalDescription(sdp))
	.then(function () {
		socket.emit('offer', id, peerConnection.localDescription);
	});
	
	peerConnection.onicecandidate = function(event) {
		if (event.candidate) {
			socket.emit('candidate', id, event.candidate);
		}
	};
});

socket.on('candidate', function(id, candidate) {
	peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on('bye', function(id) {
	peerConnections[id] && peerConnections[id].close();
	delete peerConnections[id];
});

initMcu();
  console.log('=== ready ===');
