import { useState, useEffect } from "react";
import "./Modal.css";
import { useAuth } from "../AuthContext.jsx";
import Logo from "./Logo.jsx";

function SettingsModal({ onClose, onOpenUpgrade }) {
  const { user, usage, login, register, logout } = useAuth();
  const [tab, setTab] = useState("signin"); // "signin" or "signup"
  const [activeSettingsTab, setActiveSettingsTab] = useState("account"); // "account" or "about"
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Feedback states
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Switch tabs cleanly
  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setError("");
    setFieldErrors({});
  };

  // Client-side input validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (tab === "signup") {
      if (!name.trim()) {
        errors.name = "Full name is required";
      } else if (name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters";
      }
    }

    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit handler (connects to existing backend APIs)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (tab === "signin") {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
      onClose();
    } catch (err) {
      console.error("[Auth Error]:", err);
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Access for instant testing
  const handleDemoAccess = async () => {
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      try {
        await login("demo@sigmagpt.dev", "demopassword123");
        onClose();
        return;
      } catch {
        await register("Harshvardhan Demo", "demo@sigmagpt.dev", "demopassword123");
        onClose();
        return;
      }
    } catch (err) {
      setError(err.message || "Failed to start demo session");
    } finally {
      setLoading(false);
    }
  };

  // RENDER: Logged-in Settings View
  if (user) {
    const limitLabel =
      usage?.dailyLimit === null
        ? "Unlimited"
        : `${usage?.messagesToday ?? 0} / ${usage?.dailyLimit}`;

    return (
      <div className="modalOverlay" onClick={onClose} role="dialog" aria-modal="true">
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modalHeader">
            <div className="modalHeaderBrand">
              <Logo size="sm" />
              <div>
                <h2>Settings & Profile</h2>
                <p className="modalHeaderSubtext">Manage account preferences and view subscription status</p>
              </div>
            </div>
            <button
              type="button"
              className="modalClose"
              onClick={onClose}
              aria-label="Close modal"
              title="Close (Esc)"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="modalBody">
            <div className="modalSubTabs">
              <button
                type="button"
                className={`subTabBtn ${activeSettingsTab === "account" ? "active" : ""}`}
                onClick={() => setActiveSettingsTab("account")}
              >
                <i className="fa-solid fa-user-shield"></i> Account
              </button>
              <button
                type="button"
                className={`subTabBtn ${activeSettingsTab === "about" ? "active" : ""}`}
                onClick={() => setActiveSettingsTab("about")}
              >
                <i className="fa-solid fa-circle-info"></i> About SigmaGPT
              </button>
            </div>

            {activeSettingsTab === "account" ? (
              <>
                <div className="accountInfo">
                  <div className="accountRow">
                    <span className="rowLabel">Name</span>
                    <span className="rowValue">{user.name}</span>
                  </div>
                  <div className="accountRow">
                    <span className="rowLabel">Email</span>
                    <span className="rowValue">{user.email}</span>
                  </div>
                  <div className="accountRow">
                    <span className="rowLabel">Current Plan</span>
                    <span className={`planBadge ${user.plan}`}>{user.plan}</span>
                  </div>
                  <div className="accountRow">
                    <span className="rowLabel">Daily Messages</span>
                    <span className="rowValue">{limitLabel}</span>
                  </div>
                </div>

                <div className="modalActions">
                  <button
                    type="button"
                    className="btnPrimary"
                    onClick={() => {
                      onClose();
                      onOpenUpgrade?.();
                    }}
                  >
                    <i className="fa-solid fa-bolt"></i> Upgrade Subscription
                  </button>
                  <button
                    type="button"
                    className="btnSecondary"
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="aboutSection">
                <div className="aboutRow">
                  <span className="aboutLabel">Application</span>
                  <span className="aboutValue">SigmaGPT v2.0</span>
                </div>
                <div className="aboutRow">
                  <span className="aboutLabel">Maintainer</span>
                  <span className="aboutValue">Harshvardhan Singh</span>
                </div>
                <div className="aboutRow">
                  <span className="aboutLabel">GitHub Profile</span>
                  <a
                    href="https://github.com/harshvardhansinghbhanawat-glitch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aboutLink"
                  >
                    harshvardhansinghbhanawat-glitch
                  </a>
                </div>
                <div className="aboutRow">
                  <span className="aboutLabel">Repository</span>
                  <a
                    href="https://github.com/harshvardhansinghbhanawat-glitch/SigmaGPT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aboutLink"
                  >
                    SigmaGPT on GitHub
                  </a>
                </div>
                <div className="aboutDescription">
                  <p>
                    Developed and maintained by <strong>Harshvardhan Singh</strong>.
                    SigmaGPT delivers a fast, responsive AI chat experience with full
                    authentication, persistent conversation history, and tiered subscription plans.
                  </p>
                </div>
              </div>
            )}

            <div className="authModalFooter">
              <p className="footerAttribution">Developed and maintained by Harshvardhan Singh</p>
              <p className="footerGithub">
                GitHub:{" "}
                <a
                  href="https://github.com/harshvardhansinghbhanawat-glitch"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  harshvardhansinghbhanawat-glitch
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Login / Signup Modal View
  return (
    <div className="modalOverlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal authModalCard" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modalHeader">
          <div className="modalHeaderBrand">
            <Logo size="sm" />
            <div>
              <h2>{tab === "signin" ? "Sign in to SigmaGPT" : "Create your Account"}</h2>
              <p className="modalHeaderSubtext">
                {tab === "signin"
                  ? "Welcome back! Enter your credentials to continue"
                  : "Join SigmaGPT for unlimited AI chats and saved threads"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modalClose"
            onClick={onClose}
            aria-label="Close modal"
            title="Close (Esc)"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="modalBody">
          {/* Segmented Switch Tabs */}
          <div className="modalTabs segmented" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "signin"}
              className={`modalTab ${tab === "signin" ? "active" : ""}`}
              onClick={() => handleTabSwitch("signin")}
            >
              <i className="fa-solid fa-arrow-right-to-bracket"></i>
              <span>Sign in</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "signup"}
              className={`modalTab ${tab === "signup" ? "active" : ""}`}
              onClick={() => handleTabSwitch("signup")}
            >
              <i className="fa-solid fa-user-plus"></i>
              <span>Sign up</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="formError" role="alert">
              <i className="fa-solid fa-circle-exclamation errorBannerIcon"></i>
              <div className="errorBannerText">
                <span>{error}</span>
                {tab === "signin" && error.toLowerCase().includes("invalid") && (
                  <button
                    type="button"
                    className="errorActionLink"
                    onClick={() => handleTabSwitch("signup")}
                  >
                    Don't have an account? Sign up here &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name field (Sign up only) */}
            {tab === "signup" && (
              <div className="formGroup">
                <label htmlFor="auth-name">Full Name</label>
                <div className={`inputWithIcon ${fieldErrors.name ? "hasError" : ""}`}>
                  <i className="fa-regular fa-user inputIcon"></i>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: null });
                    }}
                    placeholder="Harshvardhan Singh"
                    autoComplete="name"
                    disabled={loading}
                    required
                  />
                </div>
                {fieldErrors.name && (
                  <p className="fieldErrorText">
                    <i className="fa-solid fa-circle-xmark"></i> {fieldErrors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Address field */}
            <div className="formGroup">
              <label htmlFor="auth-email">Email Address</label>
              <div className={`inputWithIcon ${fieldErrors.email ? "hasError" : ""}`}>
                <i className="fa-regular fa-envelope inputIcon"></i>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="fieldErrorText">
                  <i className="fa-solid fa-circle-xmark"></i> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="formGroup">
              <div className="labelRow">
                <label htmlFor="auth-password">Password</label>
                <span className="fieldHint">Min. 6 characters</span>
              </div>
              <div className={`inputWithIcon ${fieldErrors.password ? "hasError" : ""}`}>
                <i className="fa-solid fa-lock inputIcon"></i>
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                  }}
                  placeholder="At least 6 characters"
                  autoComplete={tab === "signin" ? "current-password" : "new-password"}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="passwordToggleBtn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                </button>
              </div>
              {fieldErrors.password && (
                <p className="fieldErrorText">
                  <i className="fa-solid fa-circle-xmark"></i> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              className="btnPrimary submitBtn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>{tab === "signin" ? "Signing In..." : "Creating Account..."}</span>
                </>
              ) : (
                <>
                  <i className={tab === "signin" ? "fa-solid fa-arrow-right-to-bracket" : "fa-solid fa-user-plus"}></i>
                  <span>{tab === "signin" ? "Sign In" : "Create Account"}</span>
                </>
              )}
            </button>
          </form>

          {/* Tab Switcher Link */}
          <div className="switchTabPrompt">
            {tab === "signin" ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="switchTabLink"
                  onClick={() => handleTabSwitch("signup")}
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className="switchTabLink"
                  onClick={() => handleTabSwitch("signin")}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Quick Demo Access Divider & Button */}
          <div className="demoDivider">
            <span>Or continue with</span>
          </div>

          <button
            type="button"
            className="btnDemo"
            onClick={handleDemoAccess}
            disabled={loading}
            title="Sign in instantly with a guest demo session"
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <span>One-Click Demo Access</span>
          </button>

          {/* Required Footer */}
          <div className="authModalFooter">
            <p className="footerAttribution">Developed and maintained by Harshvardhan Singh</p>
            <p className="footerGithub">
              GitHub:{" "}
              <a
                href="https://github.com/harshvardhansinghbhanawat-glitch"
                target="_blank"
                rel="noopener noreferrer"
              >
                harshvardhansinghbhanawat-glitch
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
