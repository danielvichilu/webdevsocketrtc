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


//get video for each camera
    navigator.mediaDevices.enumerateDevices()
    .then(function (devices) {
      let arrayLength = devices.length;
      for (let i = 0; i < arrayLength; i++) {
        let tempDevice = devices[i];
        if (tempDevice.kind === 'videoinput' && !DEVICES.includes(tempDevice.deviceId)) {
          DEVICES.push(tempDevice.deviceId);
          let constraints = {video:{ 
            width: { min: 320, max: 320}, 
          height: { min: 240, max: 240 },
           frameRate:{min: 6, max: 7}
      
        }
          // {video: {deviceId: {exact: tempDevice.deviceId}}};
            navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
              startMix();
              mcu.addRemoteVideo(stream);
            })
        }
      }
    })

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
