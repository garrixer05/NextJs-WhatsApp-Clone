import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { GET_CALL_TOKEN } from "@/utils/ApiRoutes";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { MdOutlineCallEnd } from "react-icons/md";

function Container({data}) {
  const [{socket,userInfo},dispatch]=useStateProvider();
  const [callAccepted,setCallAccepted]=useState(false)
  const [token, setToken] = useState(undefined);
  const [zgVar, setZgVar] = useState(undefined);
  const [localStream, setLocalStream] = useState(undefined);
  const [publishStrean, setPublishStream] = useState(undefined);
  useEffect(()=>{
    if(data.type === 'outgoing'){
      socket.current.on("accept-call", ()=>{
        setCallAccepted(true);
      })
    }else{
      setTimeout(()=>{setCallAccepted(true)},1000)
    }
  },[data])

  useEffect(()=>{
    const getToken = async ()=>{
      try {
        const {
          data:{token : returnedToken }
        } = await axios.get(`${GET_CALL_TOKEN}/${userInfo.id}`);
        setToken(returnedToken);
      } catch (error) {
        
      }
    }
    getToken();
  },[callAccepted])
  useEffect(()=>{
    const startCall = async ()=>{
      import ("zego-express-engine-webrtc").then(async ({ZegoExpressEngine})=>{
        const zg = new ZegoExpressEngine(process.env.NEXT_PUBLIC_ZEGO_APP_ID, process.env.NEXT_PUBLIC_ZEGO_SERVER_ID);
        setZgVar(zg);
        zg.on("roomStreamUpdate", async (roomId, updateType, streamList, extendedData)=>{
          if(updateType==="ADD"){
            const rmVideo = document.getElementById("remote-video");
            const vd = document.createElement(
              data.callType === "video" ? "video" : "audio"
            );
            vd.id=streamList[0].streamID;
            vd.autoplay = true;
            vd.playsInline = true;
            vd.muted = false;
            if(rmVideo){
              rmVideo.appendChild(vd);   
            }
            zg.startPlayingStream(streamList[0].streamID, {
              audio:true,
              video:true
            }).then((stream)=>vd.srcObject=stream)
          }else if(updateType==="DELETE" && zg && localStream && streamList[0].streamID){
            zg.destroyStream(localStream);
            zg.stopPublishingStream(streamList[0].streamID);
            zg.logoutRoom(data.roomId.toString());
            dispatch({
              type:reducerCases.END_CALL
            })
          }
        })
        await zg.loginRoom(data.roomId.toString(), token, {userID:userInfo.id.toString(), userName:userInfo.name},{userUpdate:true});
        const localStream = await zg.createStream({
          camera:{
            audio:true,
            video:data.callType === "video" ? true : false
          }
        })
        const localVideo = document.getElementById("local-video");
        const videoElement = document.createElement(
          data.callType === "video" ? "video" : "audio"
        );
        videoElement.id="video-local-zego";
        videoElement.className = "h-28 w-32";
        videoElement.autoplay=true;
        videoElement.muted = false;
        videoElement.playsInline = true;
        localVideo.appendChild(videoElement);
        const td = document.getElementById("video-local-zego");
        td.srcObject=localStream;
        const streamID = "177" + Date.not();
        setPublishStream(streamID);
        setLocalStream(localStream);
        zg.startPublishingStream(streamID, localStream);
      });
    };
    if(token){
      startCall();
    }
  }, [token]);


  const endCall = ()=>{
    const id = data.id;
    let callType = data.callType
    let event = `reject-${callType}-call`
    if(zgVar && localStream && publishStrean){
      zgVar.destroyStream(localStream);
      zgVar.stopPublishingStream(publishStrean);
      zgVar.logoutRoom(data.roomId.toString());
    }
    socket.current.emit(event, {
      from:id
    });
    dispatch({
      type:reducerCases.END_CALL
    });
  }
  return (
    <div className="border-converstation-border border-1 w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white">
      <div className="flex flex-col gap-3 items-center">
        <span className="text-5xl">{data.name}</span>
        <span className="text-lg " >
          {
            callAccepted && data.callType !== "video"
            ? "On going call"
            : "Calling"
          }
        </span>
      </div>
      {
        (!callAccepted || data.callType === "audio") && <div className="my-24">
          <Image src={data.profilePicture} alt="avatar" height={300} width={300} className="rounded-full"/>
        </div>
      }
      <div className="my-5 relative" id="remoteVideo">
        <div className="absolute bottom-5 right-5" id="local-video"></div>
      </div>
      <div className="h-16 w-16 bg-red-600 flex items-center justify-center rounded-full">
        <MdOutlineCallEnd onClick={endCall} className="text-3xl cursor-pointer"/>
      </div>
    </div>
  )
}

export default Container;
