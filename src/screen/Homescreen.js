import React, {useEffect, useRef, useState} from 'react'
import io from 'socket.io-client'
import Button from '../components/Button'
import Input from '../components/Input'
import uuid from 'react-uuid'

const HomeScreen = props => {
    const socket = useRef(null)
    const userVideo = useRef()
    const optref = useRef()
    const [audioDeviceId, setaudioDeviceId] = useState('')
    const [videoDeviceId, setvideoDeviceId] = useState('')
    const [videoDevices, setVideoDevices] = useState([]) 
    const [audioDevices, setaudioDevices] = useState([]) 
    const [roomId, setRoomId] = useState()

    
    //Получем видео и аудио выходы
    const getDivices = () =>  {
        return navigator.mediaDevices.enumerateDevices()
    }
    //Создаем видеопоток 
    const videoStream = () => {
        const gotStream = (stream) => {
            window.stream = stream //создаем локальный стрим
            userVideo.current.srcObject=stream
        }
        const constraints = {
            audio: { deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined },
            video: { deviceId: videoDeviceId? { exact: videoDeviceId } : undefined }
          };
       
        return navigator.mediaDevices
            .getUserMedia(constraints)
            .then(stream => gotStream(stream))
            .catch(err => console.log(err))
    }

    useEffect(() => {
        socket.current = io('http://localhost:4000', {transports: ['websocket']}) // подключаем хостера
        getDivices().then((data) => {
           data.some((deviceInfo) => {
               ///console.log(deviceInfo)
               window.deviceInfos = deviceInfo
               if (deviceInfo.kind === 'videoinput') {
                   let mass = [...videoDevices]
                   videoDevices.push({name: deviceInfo.label, devId: deviceInfo.deviceId})
                   mass.push({name: deviceInfo.label, devId: deviceInfo.deviceId})
                   setvideoDeviceId(deviceInfo.deviceId)  
                   setVideoDevices(mass)
               }  if (deviceInfo.kind ==='audioinput') {
                   let mass = [...audioDevices]
                   mass.push({name: deviceInfo.label, devId: deviceInfo.deviceId})
                   audioDevices.push({name: deviceInfo.label, devId: deviceInfo.deviceId})
                   setaudioDeviceId(deviceInfo.deviceId) 
                   setaudioDevices(mass)
               }
           })

       })
    },[])
    const ShareVideo = () => {
        navigator.mediaDevices.getDisplayMedia({
            video: {
              cursor: "always"
            }, 
            audio: {
              echoCancellation: true,
              noiseSuppression: true
            }
          }).then((stream) => {
            userVideo.current.srcObject = stream;
            socket.current.emit("broadcaster");
          })
    }
    const OpenCamera = () => {
        videoStream()
        let v4 = uuid()
        setRoomId(v4)
        //стан сервер от гугла типа NAT(передача webrtc данных с помощью неГо)
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
        socket.current.emit('joinroom', {roomId: v4}) // отправляем id комнаты на сервер
        const peerConnections = {};
        socket.current.on("answer", (id, description) => {
            peerConnections[id].setRemoteDescription(description); // устанавлием хостера 
          });
        socket.current.on("watcher", (id) => {
            const peerConnection = new RTCPeerConnection(config)
            let stream = userVideo.current.srcObject
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream)) //добалвяем дорожку для соединения
            
            peerConnections[id] = peerConnection; // получаем список всех пеер соединений
            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socket.current.emit("candidate", id, event.candidate)
                }
            }
            peerConnection
                .createOffer()
                .then(sdp => peerConnection.setLocalDescription(sdp))
                .then(() => {
                    socket.current.emit("offer", id, peerConnection.localDescription) // создаем оффер и отправляем данные хостера
                })
        })
        socket.current.on("candidate", (id, candidate) => {
            peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate)); // связываем браузеры
          });
    }
    
    const MapVideo = () => videoDevices.map((i) => <option onChange={(e) => setvideoDeviceId(e.target.value)} value={videoDeviceId}>{i.name}</option>)
    const MapAudio = () => audioDevices.map((i) => <option onChange={(e) => setaudioDeviceId(e.target.value)} value={audioDeviceId}>{i.name}</option>)
    return (
    <React.Fragment>
        
        <Button onClick={() => OpenCamera()} color={'white'} padding={'5px 10px'} name={'Создать комнату'}/>
        <Input value={roomId!==undefined?window.location.href+roomId:''} type={'text'} margin={'0px 10px'} padding={'5px 5px'}/>
        <section>
         <label htmlFor="audioSource" >Audio source: </label>
         <br></br>
         <select  id="audioSource">

             {MapAudio()}
         </select>
        </section>
        <section >
            <label htmlFor="videoSource">Video source: </label>
            <br></br>
            <select  id="videoSource">

                {MapVideo()}
            </select>
        </section>
        <video style={{width: 250, height: 200}} ref={userVideo} playsInline autoPlay muted></video>
        <button onClick={() => ShareVideo()}>ShareVideo</button>
    </React.Fragment>
    )
}

export default HomeScreen