import React, { useEffect, useRef } from "react";

function ContextMenu({options, coordinates, contextMenu, setContextMenu}) {
  const contextMenuRef = useRef(null);
  useEffect(()=>{
    const handleOutsideClick = (event)=>{
      if(event.target.id !== "context-opener"){
        if(contextMenuRef.current && !contextMenuRef.current.contains(event.target)){
          setContextMenu(false);
        }
      }
    }
    document.addEventListener('click',handleOutsideClick);
    return ()=>{
      document.removeEventListener('click',handleOutsideClick);
    }
  },[])
  let {x,y} = coordinates
  
  const handleClick = (e,callback)=>{
    e.stopPropagation();
    setContextMenu(false)
    callback()
  }
  return <div style={ {position:"absolute", top:y, left:x, zIndex:100} } className="bg-dropdown-background py-2 shadow-xl"  ref={contextMenuRef}>
    <ul>
      {
        options.map(({name, callback})=>(
          <li className="px-5 py-2 cursor-pointer hover:bg-background-default-hover" key={name} onClick={(e)=>handleClick(e,callback)}> <span className="text-white">{name}</span> </li>
        ))
      }
    </ul>
  </div>;
}

export default ContextMenu;
