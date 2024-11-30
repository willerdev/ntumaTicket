import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6 page-transition">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Ticketly</h1>
        <p className="text-muted-foreground">Your premium ticket booking experience</p>
      </div>
      <div className="flex flex-col w-full max-w-md gap-4">
        <Button onClick={() => navigate("/signin")} className="w-full">
          Sign In
        </Button>
        <Button onClick={() => navigate("/signup")} variant="outline" className="w-full">
          Create Account
        </Button>
      </div>
    </div>
  );
};

export default Index;