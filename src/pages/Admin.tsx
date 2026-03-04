import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Lock } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const [password, setPassword] = useState("");
<<<<<<< HEAD
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!password.trim()) {
      toast.error("Please enter the password");
      return;
    }

    setIsLoading(true);

    // Simulate a tiny delay for realism (optional)
    setTimeout(() => {
      if (password === "admin123") {
        sessionStorage.setItem("isAdmin", "true");
        navigate("/dashboard");
        toast.success("Welcome, Admin!");
      } else {
        toast.error("Incorrect password");
        setPassword(""); // clear field on failure
      }
      setIsLoading(false);
    }, 300);
=======
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === "admin123") {
      sessionStorage.setItem("isAdmin", "true");
      navigate("/dashboard");
    } else {
      toast.error("Incorrect password");
    }
>>>>>>> 9afc44d0c8ffebbb5b60b3b379e54663283bde89
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm rounded-xl bg-card p-8 shadow-xl card-green-border text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange/20">
            <Lock className="h-7 w-7 text-orange" />
          </div>
          <h2 className="mb-1 text-xl font-bold text-primary">🔐 Admin Access</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Restricted area, for school administrators only.
          </p>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
<<<<<<< HEAD
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            disabled={isLoading}
            className="mb-4 w-full rounded-lg border-2 border-primary/30 bg-card px-4 py-2.5 text-sm outline-none transition focus:border-primary disabled:opacity-70"
          />
          <button
            onClick={handleLogin}
            disabled={isLoading || !password.trim()}
            className={`w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground shadow transition hover:opacity-90 active:scale-[0.98] ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
=======
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            className="mb-4 w-full rounded-lg border-2 border-primary/30 bg-card px-4 py-2.5 text-sm outline-none transition focus:border-primary"
          />
          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground shadow transition hover:opacity-90 active:scale-[0.98]"
          >
            Login
>>>>>>> 9afc44d0c8ffebbb5b60b3b379e54663283bde89
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

<<<<<<< HEAD
export default Admin;
=======
export default Admin;
>>>>>>> 9afc44d0c8ffebbb5b60b3b379e54663283bde89
