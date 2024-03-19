import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Editor from './components/Editorjs/Editor.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
  {/* <App2 /> */}
<Editor>
<App />
</Editor>
  </>
  ,
)
