import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { ADD_AUDIO_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaPauseCircle, FaPlay, FaStop, FaTrash } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";

// todo 
// wait until permission of microphone before start recording
// handle error when permission is discarded


function CaptureAudio({hide}) {
  const [{userInfo, currentChatUser, socket}, dispatch] = useStateProvider();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [waveForm, setWaveform] = useState(null);
  const [recordingDuration, setIsRecordingDuration] = useState(0);
  const [currentPlayBackTime, setCurrentPlayBackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [renderedAudio, setRenderedAudio] = useState(null);
  
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const waveFormRef = useRef(null);
  
  useEffect(()=>{
    let interval;
    if(isRecording){
      interval = setInterval(()=>{
        setIsRecordingDuration((prevDuration)=>{
          setTotalDuration(prevDuration+1);
          return prevDuration+1;
        });
      }, 1000);
    }
    return ()=>clearInterval(interval);
  },[isRecording]);
  
  useEffect(()=>{
    const waveSurfer = WaveSurfer.create({
      container:waveFormRef?.current,
      waveColor: "#ccc",
      progressColor: "#4a9eff",
      cursorColor : "#7ae3c3",
      barWidth:2,
      height:30,
      responsive:true
    });
    
    setWaveform(waveSurfer);
    waveSurfer.on("finish", ()=>{
      setIsPlaying(false);
    })
    return ()=> waveSurfer.destroy();

  },[]);

  useEffect(()=>{
    if (waveForm) handleStartRecording();
  },[waveForm]);
  
  useEffect(()=>{
    if(recordedAudio){
      const updatePlaybackTime = () =>{
        setCurrentPlayBackTime(recordedAudio.currentTime);
      }
      recordedAudio.addEventListener("timeupdate", updatePlaybackTime);
      return () =>{
        recordedAudio.removeEventListener("timeupdate", updatePlaybackTime);
      }
    }
  },[recordedAudio]);


  const handleStartRecording = () =>{
    setIsRecordingDuration(0);
    setCurrentPlayBackTime(0);
    setTotalDuration(0);
    setIsRecording(true);
    setRecordedAudio(null);
    navigator.mediaDevices.getUserMedia({audio:true}).then((stream)=> {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioRef.current.srcObject = stream;  

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = ()=>{
        const blob = new  Blob(chunks, {type:"audio/ogg; codecs=opus"});
        const audioURL = URL.createObjectURL(blob);
        const audio = new Audio(audioURL);
        setRecordedAudio(audio);
        waveForm.load(audioURL);
      }
      mediaRecorder.start();
    }).catch(error=>console.log("Error accessing microphone: ",error));
  };
  const handleStopRecording = () =>{
    if (mediaRecorderRef.current && isRecording){
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      waveForm.stop();
      
      const audioChunks = [];
      mediaRecorderRef.current.addEventListener("dataavailable", event=>{audioChunks.push(event.data)});
      mediaRecorderRef.current.addEventListener("stop", ()=>{
        const audioBlob = new Blob(audioChunks, {type:"audio/mp3"});
        const audioFile = new File([audioBlob], "recording.mp3");
        setRenderedAudio(audioFile);
      });
    }
  };


  const handlePlayRecording = () =>{
    if(recordedAudio){
      waveForm.stop();
      waveForm.play();
      recordedAudio.play();
      setIsPlaying(true);
    }
  };
  const handlePauseRecording = () =>{
    waveForm.stop();
    recordedAudio.pause();
    setIsPlaying(false);
  };

  const sendRecording = async () =>{
    try {
      const formData = new FormData();
      formData.append("audio",renderedAudio);
      const res = await axios.post(ADD_AUDIO_MESSAGE_ROUTE, formData, {
        headers:{
          "Content-Type":"multipart/form-data"
        },
        params:{
          from:userInfo.id,
          to:currentChatUser.id
        }
      });
      if(res.status===201){
        socket.current.emit("send-msg",{
          to:currentChatUser?.id,
          from:userInfo?.id,
          message:res.data.message
        });
        dispatch({
          type:reducerCases.ADD_MESSAGE,
          newMessage : {
            ...res.data.message
          },
          fromSelf:true
        });
      }

    } catch (error) {
     console.log(error); 
    }
  };

  const formatTime = (time)=>{
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor( time/60 );
    const seconds = Math.floor( time%60 );
    return `${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,0)}`;
  }


  return (
    <div className="flex text-xl w-full justify-end items-center">
      <div className="pt-1">
        <FaTrash className="text-panel-header-icon cursor-pointer" onClick={()=>hide()}/>
      </div>
      <div className="mx-4 py-2 px-4 text-white text-lg flex gap-3 justify-center items-center bg-search-input-container-background rounded-full drop-shadow-lg">
        {
          isRecording ? (
          <div className="text-red-500 animate-pulse w-60 text-center">
            Recording <span>{recordingDuration}s</span>
          </div>
          ) : (
          <div className="">
            {recordedAudio && 
              <>
                {
                  !isPlaying ? (<FaPlay onClick={handlePlayRecording}/>) : (<FaStop onClick={handlePauseRecording}/>)
                }
              </>
            }
          </div>
        )}
        <div className="w-60" ref={waveFormRef} hidden={isRecording} />
            {
              recordedAudio && isPlaying && <span>{formatTime(currentPlayBackTime)}</span>
            }
              
            {
              recordedAudio && !isPlaying && <span>{formatTime(totalDuration)}</span>
            }
            <audio ref={audioRef} hidden/>
        </div>
        <div className="mr-4">
          {!isRecording ? (<FaMicrophone onClick={handleStartRecording} className="text-red-500"/>) : (<FaPauseCircle onClick={handleStopRecording} className="text-red-500"/>)}
        </div>
        <div>
          <MdSend className="text-panel-header-icon cursor-pointer mr-4" title="Send" onClick={sendRecording}/>
        </div>
      </div>
  );
}

export default CaptureAudio;
