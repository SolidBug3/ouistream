import { BrowserRouter, Routes, Route } from "react-router-dom"

import Header from "./components/Header/Header"
import SidePanel from "./components/SidePanel/SidePanel"

import Home from "./pages/Home"
import Profile from "./pages/Profile"

function App() {
    return (
        <BrowserRouter basename="/ouistream">
            <Header />
            <SidePanel />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App