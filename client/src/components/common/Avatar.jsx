import React, { useEffect, useState } from "react";
import Image from "next/image";
import {FaCamera} from "react-icons/fa"
import ContextMenu from "./ContextMenu";
import PhotoPicker from "./PhotoPicker";
import PhotoLibrary from "./PhotoLibrary";
import CapturePhoto from "./CapturePhoto";


function Avatar({type, image, setImage}) {
  const [hover, setHover] = useState(false)
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false)
  const [grabPhoto, setGrabPhoto] = useState(false);
  const [contextMenuCoordinates, setContextMenuCoordinates] = useState({
    x:0,
    y:0
  })
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false)
  const [showCapturePhoto, setShowCapturePhoto] = useState(false);
  const showContextMenu = (e)=>{
    e.preventDefault;
    setContextMenuCoordinates(
      {
        x:e.pageX,
        y:e.pageY
      }  
    )
    setIsContextMenuVisible(true);
  }

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
  const contextMenuOptions = [
    {name:"Take photo", callback : ()=> {
      setShowCapturePhoto(true);
    }},
    {name:"Choose from library", callback : ()=> {
      setShowPhotoLibrary(true);
    }},
    {name:"Upload photo", callback : ()=> {
      setGrabPhoto(true);
    }},
    {name:"Remove photo", callback : ()=> {
      setImage("/default_avatar.png")
    }},
    
  ]

  const photoPickerChange = async (e)=>{
    const file =  e.target.files[0];
    const reader = new FileReader();
    let data = document.createElement('img')
    reader.onload = function(event){
      data.src = event.target.result;
      data.setAttribute("data-src", event.target.result)
    }
    reader.readAsDataURL(file);
    setTimeout(()=>{
      setImage(data.src)
    },100);
    
  };

  return <>
    <div className="flex items-center justify-center">
      {
        type === "sm" && (
          <div className="relative h-10 w-10">
            <Image src={image} alt="avatar" className="rounded-full" fill></Image>
          </div>
        )
      }
      {
        type === "lg" && (
          <div className="relative h-14 w-14">
            <Image src={image} alt="avatar" className="rounded-full" fill></Image>
          </div>
        )
      }
      {
        type === "xl" && (
          <div className="relative cursor-pointer h-60 w-60" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
            <div id="context-opener" className={`z-10 bg-photopicker-overlay-background absolute h-60 w-60 top-0 left-0 flex items-center rounded-full justify-center flex-col text-center gap-2
                ${hover ? "visible" : "hidden"}
              `} onClick={e=>showContextMenu(e)}>
              <FaCamera onClick={e=>showContextMenu(e)} className="text-2xl" id="context-opener"/>
              <span onClick={e=>showContextMenu(e)} id="context-opener">Change <br />Profile <br /> Photo</span>
            </div>
            <div className="flex items-center justify-center h-60 w-60">
              <Image src={image} alt="avatar" className="rounded-full" fill></Image>
            </div>
          </div>
        )
      }
    </div>
    {
      isContextMenuVisible && (<ContextMenu options={contextMenuOptions} coordinates={contextMenuCoordinates} contextMenu={isContextMenuVisible} setContextMenu={setIsContextMenuVisible}/>)
    }
    {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
    {showCapturePhoto && <CapturePhoto setImage={setImage} hide={setShowCapturePhoto} />}
    {showPhotoLibrary && <PhotoLibrary setImage={setImage} hidePhotoLibrary={setShowPhotoLibrary}/>}
  </>
}

export default Avatar;
