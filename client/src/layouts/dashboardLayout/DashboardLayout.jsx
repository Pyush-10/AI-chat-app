import { Outlet, useNavigate } from "react-router-dom";
import "./dashboardLayout.css";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import ChatList from "../../components/ChatList/ChatList";

const DashboardLayout = () => {
  const { userId, isLoaded } = useAuth();
  const [authInitTimedOut, setAuthInitTimedOut] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded) return undefined;

    // Avoid an infinite loading screen when Clerk fails to initialize.
    const timeout = setTimeout(() => {
      setAuthInitTimedOut(true);
    }, 8000);

    return () => clearTimeout(timeout);
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded && !userId) {
      navigate("/sign-in");
    }
  }, [isLoaded, userId, navigate]);

  if (!isLoaded && authInitTimedOut) {
    return (
      <div className="dashboardLayout">
        <div className="content">
          <p>
            Authentication is taking longer than expected. Please refresh the
            page and verify your Clerk publishable key in the client env file.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) return "Loading...";

  return (
    <div className="dashboardLayout">
      <div className="menu">
        <ChatList />
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
