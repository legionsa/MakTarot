import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Reading from './pages/Reading'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reading" element={<Reading />} />
    </Routes>
  )
}

export default App
