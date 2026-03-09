import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { useAuth } from "../context/authcontext.jsx";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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
    if (!validateForm()) return;
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
    <div className="register-page">
      <div className="register-container">
        {/* ── Left decorative panel ── */}
        <div className="register-left">
          <div className="register-bubble register-bubble-1" />

          <div className="register-welcome">
            <h2>Find Your Perfect Property</h2>
            <p>
              Create a free account to explore thousands of premium listings,
              save favourites, and connect with top agents.
            </p>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="register-right">
          <div className="register-form-container">
            <div className="register-header reg-slide-1">
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>

            {error && <div className="register-error">{error}</div>}

            <form onSubmit={handleSubmit} className="register-form" noValidate>
              {/* Full Name */}
              <div className="register-form-group reg-slide-2">
                <label htmlFor="name">
                  <FiUser /> Full Name
                </label>
                <div className="register-input-wrapper">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    className={formErrors.name ? "input-error" : ""}
                  />
                </div>
                {formErrors.name && (
                  <span className="register-field-error">
                    {formErrors.name}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="register-form-group reg-slide-3">
                <label htmlFor="email">
                  <FiMail /> Email Address
                </label>
                <div className="register-input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    className={formErrors.email ? "input-error" : ""}
                  />
                </div>
                {formErrors.email && (
                  <span className="register-field-error">
                    {formErrors.email}
                  </span>
                )}
              </div>

              {/* Phone */}
              <div className="register-form-group reg-slide-4">
                <label htmlFor="phone">
                  <FiPhone /> Phone Number
                </label>
                <div className="register-input-wrapper">
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
                </div>
                {formErrors.phone && (
                  <span className="register-field-error">
                    {formErrors.phone}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="register-form-group reg-slide-5">
                <label htmlFor="password">
                  <FiLock /> Password
                </label>
                <div className="register-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className={formErrors.password ? "input-error" : ""}
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                    required
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {formErrors.password && (
                  <span className="register-field-error">
                    {formErrors.password}
                  </span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="register-button reg-slide-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="register-spinner" />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="register-switch">
              Already have an account?
              <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
