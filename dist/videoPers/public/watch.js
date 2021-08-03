let peerConnection;
const config = {
  iceServers: [
      { 
        "urls": "stun:stun.l.google.com:19302",
      },
      // { 
      //   "urls": "turn:TURN_IP?transport=tcp",
      //   "username": "TURN_USERNAME",
      //   "credential": "TURN_CREDENTIALS"
      // }
  ]
};


document.getElementById("btn").onclick = (e) => {
  const socket = io.connect(window.location.origin);
  const video = document.querySelector("video");
  const enableAudioButton = document.querySelector("#enable-audio");
  document.getElementById("show").style["display"] = "block"
  const roomID = (document.getElementById("roomID").value)
  if (roomID!=='') {
    enableAudioButton.addEventListener("click", enableAudio)
    socket.on(roomID, (id, description) => {
      peerConnection = new RTCPeerConnection(config);
      peerConnection
        .setRemoteDescription(description)
        .then(() => peerConnection.createAnswer())
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => {
          socket.emit("answer", id, peerConnection.localDescription);
        });
      peerConnection.ontrack = event => {
        video.srcObject = event.streams[0];
      };
      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          socket.emit("candidate", id, event.candidate);
        }
      };
    });
    
    socket.on("candidate", (id, candidate) => {
      peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.error(e));
    });
    
    socket.on("connect", () => {
      socket.emit("watcher");
    });
    
    socket.on("broadcaster", () => {
      socket.emit("watcher");
    });
    
    window.onunload = window.onbeforeunload = () => {
      socket.close();
      peerConnection.close();
    };
    
    function enableAudio() {
      console.log("Enabling audio")
      video.muted = false;
    }
  }
}

