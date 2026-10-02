import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home/Home"
import Profile from "./pages/Profile/Profile"
import User from "./pages/User/User"

import RequireAuth from "./supabase/auth/RequireAuth"

function App() {
    return (
        <BrowserRouter basename="/ouistream">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/user/:id" element={<User />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App