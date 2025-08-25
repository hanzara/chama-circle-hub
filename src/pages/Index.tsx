import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import HomePage from "./HomePage";
import Dashboard from "./Dashboard";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard route
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dashboard">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show public home page if not authenticated
  if (!user) {
    return <HomePage />;
  }

};

export default Index;
