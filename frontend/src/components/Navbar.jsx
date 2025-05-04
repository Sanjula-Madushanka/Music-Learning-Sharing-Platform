import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if OAuth or normal login was successful
    const email = localStorage.getItem("userEmail");
    if (email) setIsLoggedIn(true);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:9090/api/users/logout", {
        method: "GET",
        credentials: "include",
      });
      localStorage.clear();
      setIsLoggedIn(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="bg-purple-600 text-white p-4 flex justify-between">
      <h1 className="font-bold text-xl">Treble</h1>
      <div className="space-x-4">
        <Link to="/">Users</Link>
        <Link to="/register">Register</Link>
        {isLoggedIn ? (
          <>
            <Link to="/profile">Profile</Link>
            <button onClick={handleLogout} className="underline">Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;