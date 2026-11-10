import "./AuthGate.css";
import { useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import SettingsModal from "./SettingsModal.jsx";
import Logo from "./Logo.jsx";

function AuthGate({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="authGate">
        <div className="authGateLoading">
          <Logo size="md" className="pulseLogo" />
          <p>Loading SigmaGPT...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="authGate">
        <div className="authGateCard">
          <Logo size="lg" className="authLogo" />
          <h1>SigmaGPT</h1>
          <p className="authTagline">
            Next-generation full-stack AI conversation assistant.
          </p>
          <p className="authSubtext">
            Sign in or create an account to start chatting, manage thread histories, and customize your plan.
          </p>
          <button
            type="button"
            className="btnPrimary authBtn"
            onClick={() => setShowAuth(true)}
          >
            <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign in / Sign up
          </button>

          <div className="authGateFooter">
            <p>
              Developed and maintained by{" "}
              <a
                href="https://github.com/harshvardhansinghbhanawat-glitch"
                target="_blank"
                rel="noopener noreferrer"
              >
                Harshvardhan Singh
              </a>
            </p>
          </div>
        </div>
        {showAuth && <SettingsModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  return children;
}

export default AuthGate;
