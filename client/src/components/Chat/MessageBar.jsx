import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { ADD_IMAGE_ROUTE, ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import {BsEmojiSmile} from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa";
import {ImAttachment} from "react-icons/im";
import {MdSend} from "react-icons/md";
import { useFileSystemPublicRoutes } from "../../../next.config";
import PhotoPicker from "../common/PhotoPicker";



function MessageBar() {
  const [message, setMessage] = useState("")
  const [{userInfo,currentChatUser, socket}, dispatch] = useStateProvider();
  const [showEmojiPicker,setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [grabPhoto, setGrabPhoto] = useState(false);

  const photoPickerChange = async (e)=>{
    
    try {
      const file =  e.target.files[0];
      const formData = new FormData();
      formData.append("image",file);
      const res = await axios.post(ADD_IMAGE_ROUTE, formData, {
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
  useEffect(()=>{
    if(grabPhoto){
      const data = document.getElementById("photo-picker");
      data.click();
      document.body.onfocus = (e)=>{
        setTimeout(()=>{
          setGrabPhoto(false);
        },1000)
      }
    }
  },[grabPhoto])



  useEffect(()=>{
    const handleOutsideClick = (event)=>{
      if(event.target.id !== 'emoji-open'){
        if(emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)){
          setShowEmojiPicker(false);
        }
      }
    }
    document.addEventListener('click',handleOutsideClick);
    return ()=>{
      document.removeEventListener('click', handleOutsideClick);
    }
  },[])
  const handleEmojiModal = ()=>{
    setShowEmojiPicker(!showEmojiPicker);
  }
  const handleEmojiClick = (emoji)=>{
    setMessage((prevMessage)=>prevMessage+=emoji.emoji)
  }

  const sendMessage = async ()=>{
    try {
      const {data} = await axios.post(ADD_MESSAGE_ROUTE,{
        to:currentChatUser?.id,
        from:userInfo?.id,
        message
      });
      socket.current.emit("send-msg",{
        to:currentChatUser?.id,
        from:userInfo?.id,
        message:data.message
      });
      dispatch({
        type:reducerCases.ADD_MESSAGE,
        newMessage : {
          ...data.message
        },
        fromSelf:true
      });
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="bg-panel-header-background h-20 px-4 flex items-center gap-6 relative">
      <>
        <div className="flex gap-6">
          <BsEmojiSmile id="emoji-open" onClick={handleEmojiModal} className="text-panel-header-icon cursor-pointer text-xl" title="Emoji"/>
          {
            showEmojiPicker && <div ref={emojiPickerRef} className="absolute bottom-24 left-16 z-40">
              <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark"/>
            </div>
          }
          <ImAttachment onClick={()=>setGrabPhoto(true)} className="text-panel-header-icon cursor-pointer text-xl" title="Attach File"/>
        </div>
        <div className="w-full rounded-lg h-10 flex items-center">
          <input onChange={e=>setMessage(e.target.value)} value={message} type="text" placeholder="Type a message" className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg px-5 py-4 w-full"/>
        </div>
        <div className="flex w-10 items-center justify-center">
          <button>
            <MdSend onClick={sendMessage} className="text-panel-header-icon cursor-pointer text-xl" title="Send Message"/>
          </button>
          {/* <button>
            <FaMicrophone className="text-panel-header-icon cursor-pointer text-xl" title="Record"/>
          </button> */}
        </div>
      </>
      {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}

    </div>
  );
}

export default MessageBar;
