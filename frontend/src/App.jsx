import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className='mt-2 bg-background text-text text-2xl'>Hello world</h1>
    </>
  )
}

export default App
