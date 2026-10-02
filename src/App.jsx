import { BrowserRouter, Routes, Route } from "react-router-dom"

import Header from "./components/Header/Header"

import Home from "./pages/Home"
import Profile from "./pages/Profile"

import RequireAuth from "./supabase/auth/RequireAuth"

import "./pages/css/pages.css"

function App() {
    return (
        <BrowserRouter basename="/ouistream">
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App