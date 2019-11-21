/*global io*/
/** @type {RTCConfiguration} */
const config = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': 'beaver','username': 'webrtc.websitebeaver@gmail.com'}]};

const socket = io.connect(window.location.origin);

const video = document.querySelector('video');
window.onunload = window.onbeforeunload = function() {
  socket.close();

};


