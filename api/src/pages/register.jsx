import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiPhone } from "react-icons/fi";
import { useAuth } from "../context/authcontext.jsx";
import "./Auth.css";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const { register, error, setError } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = "Full name is required";
        if (!formData.email.trim()) errors.email = "Email is required";
        if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
            errors.email = "Please enter a valid email";
        }
        if (!formData.phone.trim()) errors.phone = "Phone number is required";
        if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
            errors.phone = "Please enter a valid 10-digit phone number";
        }
        if (!formData.password) errors.password = "Password is required";
        if (formData.password && formData.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await register({
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                password: formData.password,
            });
            navigate("/");
        } catch (err) {
            const message = err?.response?.data?.message || "Registration failed";
            setError(message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-right">
            <div className="auth-form-container">
                <div className="form-header">
                    <h2>Create Account</h2>
                    <p>Enter your details to get started</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">
                            <FiUser /> Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            autoComplete="name"
                            className={formErrors.name ? "input-error" : ""}
                        />
                        {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">
                            <FiMail /> Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            className={formErrors.email ? "input-error" : ""}
                        />
                        {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">
                            <FiPhone /> Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            autoComplete="tel"
                            pattern="[0-9]{10}"
                            className={formErrors.phone ? "input-error" : ""}
                        />
                        {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            <FiLock /> Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            className={formErrors.password ? "input-error" : ""}
                        />
                        {formErrors.password && <span className="error-text">{formErrors.password}</span>}
                    </div>

                    <button className="auth-button" type="submit" disabled={isLoading}>
                        {isLoading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
