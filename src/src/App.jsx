import { useState } from 'react'
import SVGDragDropEditor from './components/SVGDragDropEditor'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
       <div className="w-screen h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">SVG Drag and Drop Editor</h1>
      </header>
      
      <main className="flex-grow">
        <SVGDragDropEditor />
      </main>
      
      <footer className="bg-gray-200 p-2 text-center text-sm text-gray-600">
        SVG Editor - Created with React and Vite
      </footer>
    </div>
    </>
  )
}

export default App
