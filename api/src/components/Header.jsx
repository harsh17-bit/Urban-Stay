import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineMenuAlt3, HiX } from "react-icons/hi";
import { FiUser, FiHome, FiLogOut, FiGrid, FiSettings } from "react-icons/fi";
import { useAuth } from "../context/authcontext.jsx";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: "Buy", href: "/properties?listingType=buy" },
    { label: "Rent", href: "/properties?listingType=rent" },
    { label: "Sell", href: "/post-property" }, // Direct to post property for "Sell" intent
    { label: "Projects", href: "/properties?propertyType=project" },
  ];

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    navigate("/");
  };

  return (
   <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--emerald)] to-[var(--pacific-cyan)] bg-clip-text text-transparent">
              <span style={{ background: "linear-gradient(to right, var(--emerald), var(--pacific-cyan))", WebkitBackgroundClip: "text", color: "transparent" }}>
                Urban
              </span>
              <span style={{ color: 'lightgreen'}}>Stay</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="relative px-4 py-2 text-gray-600 font-medium text-sm transition-all duration-300 hover:text-[var(--emerald)] group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[var(--emerald)] to-[var(--pacific-cyan)] transition-all duration-300 group-hover:w-3/4 rounded-full"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full hover:border-[var(--emerald)] transition-all focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--emerald)] to-[var(--pacific-cyan)] flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user?.name || "User"}</span>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[var(--light-yellow)] hover:text-[var(--pacific-cyan)] transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FiGrid className="w-4 h-4" />
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium text-sm border border-gray-200 rounded-full hover:border-[var(--emerald)] hover:text-[var(--emerald)] transition-all duration-300 hover:shadow-md">
                <FiUser className="w-4 h-4" />
                Login
              </Link>
            )}

            <Link to="/post-property" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--emerald)] to-[var(--pacific-cyan)] text-white font-semibold text-sm rounded-full shadow-lg shadow-[var(--emerald)]/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <FiHome className="w-4 h-4" />
              Post Property
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-[var(--emerald)] hover:bg-[var(--light-yellow)] rounded-lg transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <HiX className="w-6 h-6" />
            ) : (
              <HiOutlineMenuAlt3 className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-[500px] pb-6" : "max-h-0"}`}
        >
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="px-4 py-3 text-gray-600 font-medium hover:text-[var(--emerald)] hover:bg-[var(--light-yellow)] rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 mt-4 px-2 border-t border-gray-100 pt-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--emerald)] to-[var(--pacific-cyan)] flex items-center justify-center text-white font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 w-full py-3 text-gray-700 font-medium border border-gray-200 rounded-xl hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiGrid className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-3 text-red-600 font-medium border border-red-100 bg-red-50 rounded-xl hover:bg-red-100"
                >
                  <FiLogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center justify-center gap-2 w-full py-3 text-gray-700 font-medium border border-gray-200 rounded-xl hover:border-[var(--emerald)] hover:text-[var(--emerald)] transition-all duration-300" onClick={() => setIsMenuOpen(false)}>
                <FiUser className="w-4 h-4" />
                Login
              </Link>
            )}

            <Link to="/post-property" className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[var(--emerald)] to-[var(--pacific-cyan)] text-white font-semibold rounded-xl shadow-lg shadow-[var(--emerald)]/20 hover:shadow-xl transition-all duration-300" onClick={() => setIsMenuOpen(false)}>
              <FiHome className="w-4 h-4" />
              Post Property
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
