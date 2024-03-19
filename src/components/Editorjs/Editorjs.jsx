import React, { useContext, useEffect, useRef } from 'react'
import { EditorContext } from './Editor'
export default function Editorjs() {
    const {initEditor} = useContext(EditorContext)
    const editorRef = useRef(null)
    useEffect(()=>{
        if(!editorRef.current){
            initEditor()
            editorRef.current = true
        }
    },[])
  return (
    <div style={{  backgroundColor: "white", color:"black"}} id='editorjs'></div>
  )
}
