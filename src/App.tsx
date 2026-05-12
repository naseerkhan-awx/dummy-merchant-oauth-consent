import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ConsentPage from './pages/ConsentPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth/consent" element={<ConsentPage />} />
      </Routes>
    </BrowserRouter>
  )
}
