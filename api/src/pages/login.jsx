import { useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiHome, FiUser, FiBriefcase, FiShield, FiUserCheck } from "react-icons/fi";
import { useAuth } from "../context/authcontext.jsx";
import "./Auth.css";
import { loginSchema } from "../validators/loginschema.js";
const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [activeRole] = useState("buyer"); // buyer, seller, admin
    const { login, error, setError } = useAuth();
    const navigate = useNavigate();

    const roles = [
        { id: "buyer", label: "Buyer/Renter", icon: <FiUser />, color: "from-blue-500 to-indigo-600" },
        { id: "seller", label: "Agent/Seller", icon: <FiUser/>, color: "from-[var(--emerald)] to-[var(--pacific-cyan)]" },
        { id: "admin", label: "Admin", icon: <FiShield />, color: "from-purple-600 to-indigo-700" }
    ];

    /* const demoCredentials = {
        buyer: { email: "buyer@example.com", password: "password123" },
        seller: { email: "seller@example.com", password: "password123" },
        admin: { email: "admin@example.com", password: "password123" }
    };*/

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setFormErrors({});
        setIsLoading(true);

        //--Zod Validation--
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
            const errors = {};
            if (result.error && result.error.errors) {
                result.error.errors.forEach((err) => {
                    errors[err.path[0]] = err.message;
                });
            }
            setFormErrors(errors);
            setIsLoading(false);
            return;
        }

        try {
            const response = await login(formData);
            navigate("/dashboard");
            const userRole = response?.user?.role || activeRole;

            if (userRole === "admin" || userRole === "seller") {
                navigate("/dashboard");
            } else {
                navigate("/");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const activeRoleData = roles.find(r => r.id === activeRole);

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className={`auth-left ${activeRole}-theme`}>
            
                    <div className="auth-welcome-content">
                        <h2>
                            {activeRole === "buyer" && "Find Your Dream Home"}
                        </h2>
                        <p>
                            {activeRole === "buyer" && "Discover thousands of premium properties. Buy, rent, and move in today."}
                        </p>
                    </div>
                </div>
                
                
                <div className="auth-right">
                    <div className="auth-form-container">
                        <div className="auth-header">
                            <h2>Welcome Back</h2>
                            <p>Sign in to your account to continue</p>
                        </div>
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group slide-in-1">
                                <label htmlFor="email">Email Address</label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                                {formErrors.email && (
                                    <p>
                                        {formErrors.email}
                                        </p>
                                    )}
                            </div>

                            <div className="form-group slide-in-2">
                                <label htmlFor="password">Password</label>
                                <div className="input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>
                    {formErrors.password && (<p style={{ color: "red", fontSize: "0.85rem" }}>{formErrors.password}</p>)}
                            <div className="form-options slide-in-3">
                                <Link to="/forgot-password" className="forgot-link">
                                    Forgot password?
                                </Link>
                            </div>

                            <button type="submit" className={`auth-button slide-in-4 bg-gradient-to-r ${activeRoleData.color}`} disabled={isLoading}>
                                {isLoading ? (
                                    <span className="loading-spinner"></span>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                             {error && <div className="auth-error">{error}</div>}
                        </form>
                        <p className="auth-switch">
                            Don't have an account?{" "}
                            <Link to="/register">Create Account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
