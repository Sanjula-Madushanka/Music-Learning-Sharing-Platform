import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import UsersList from "./pages/UserList";
import Navbar from "./components/Navbar";
import UserProfile from "./pages/UserProfile";
import OAuthRedirect from "./pages/OAuthRedirect";
import CompleteProfile from "./pages/CompleteProfile";

const AppWrapper = () => {
  const location = useLocation();
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const hiddenRoutes = ["/login", "/register", "/oauth-redirect", "/complete-profile"];
    setShowNavbar(!hiddenRoutes.includes(location.pathname));
  }, [location]);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<UsersList />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/edit/:id" element={<EditProfile />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/oauth-redirect" element={<OAuthRedirect />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;
