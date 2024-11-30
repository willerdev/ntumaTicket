import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement registration
    setTimeout(() => {
      setLoading(false);
      navigate("/home");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 page-transition">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="text-muted-foreground mt-2">Sign up to get started</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input type="text" placeholder="Full Name" required />
            <Input type="email" placeholder="Email" required />
            <Input type="password" placeholder="Password" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Button variant="link" onClick={() => navigate("/signin")} className="p-0">
            Sign in
          </Button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;