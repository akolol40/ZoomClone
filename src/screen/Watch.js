import React, {useRef, useEffect, useState} from 'react'
import io from 'socket.io-client'
import Peer from 'simple-peer'
const Watch = props => {
    const userVideo = useRef()
    const socket = useRef()
    const id = props.match.params.id
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

    useEffect(() => {
      socket.current = io('http://localhost:4000', {transports: ['websocket']})
      socket.current.emit('joinroom', {roomId: id})

      let peerConnection


      socket.current.on('offer', (id, description) => {
        // получем данные от хостера и связываем браузеры
        peerConnection = new RTCPeerConnection(config)
        peerConnection
        .setRemoteDescription(description)
        .then(() => peerConnection.createAnswer())
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => {
          socket.current.emit("answer", id, peerConnection.localDescription);
        });
        // получаем хостера
        peerConnection.ontrack = event => {
          userVideo.current.srcObject = event.streams[0]
          
        }
      })

      //связываем браузеры
      socket.current.on("candidate", (id, candidate) => {
        peerConnection
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch(e => console.error(e));
      });
   
      socket.current.emit("watcher"); // инциализируем подключение
      
      socket.current.on("broadcaster", () => {
        socket.current.emit("watcher");
      });
    }, [])
    return (
        <div>
          <video style={{width: 800}} ref={userVideo} playsInline autoPlay muted></video>
          <button onClick={() => userVideo.current.muted = false}>Включить звук</button>
        </div>
    )
}

export default Watch