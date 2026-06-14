import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Singup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Todos from "./pages/Todos";
import NavBar from "./components/NavBar";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard/>} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;