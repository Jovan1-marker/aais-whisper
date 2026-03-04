import { Link, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";

// Replace this URL with your actual hosted logo URL 
// (e.g., upload to Supabase Storage → get public URL, ImgBB, Vercel public folder, GitHub raw link, etc.)
const SCHOOL_LOGO = "https://i.ibb.co/0j5z1vQG/aais-logo.jpg"; // ← CHANGE THIS TO YOUR REAL LOGO LINK

const Header = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const isAdmin = location.pathname === "/admin";

  const handleSignOut = () => {
    sessionStorage.removeItem("isAdmin");
    window.location.href = "/"; // or use navigate("/") if preferred
  };

  return (
    <header className="w-full bg-cream shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <div className="flex items-center gap-3">
          {/* Logo Image */}
          <img
            src={SCHOOL_LOGO}
            alt="Army's Angels Integrated School Logo"
            className="h-10 w-10 rounded-full object-cover border-2 border-primary/60 shadow-sm"
          />
          <div className="leading-tight">
            <h1 className="text-sm font-extrabold text-primary md:text-base">
              Army's Angels Integrated School, Inc.
            </h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              ANONYMOUS SUGGESTION WEBSITE
            </p>
          </div>
        </div>

        <div>
          {isDashboard ? (
            <button
              onClick={handleSignOut}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition hover:opacity-90"
            >
              Sign out
            </button>
          ) : !isAdmin ? (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Shield className="h-4 w-4" />
              Login
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;