import { useState  } from 'react'
import './App.css'
import Editorjs from './components/Editorjs/Editorjs'


function App() {
  const [count, setCount] = useState(0)
  const hello = (t)=>{
    return t+2
  }

  return (
    <>
   
        
       <Editorjs></Editorjs>
      

    </>
  )
}

export default App
