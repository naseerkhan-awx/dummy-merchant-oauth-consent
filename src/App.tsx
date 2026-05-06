import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ConsentPage from './pages/ConsentPage'
import HomePage from './pages/HomePage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/consent" element={<ConsentPage />} />
      </Routes>
    </BrowserRouter>
  )
}
