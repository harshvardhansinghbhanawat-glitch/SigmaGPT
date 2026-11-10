import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useRef, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import { sendChat } from "./api.js";
import { useAuth } from "./AuthContext.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import UpgradeModal from "./components/UpgradeModal.jsx";
import Logo from "./components/Logo.jsx";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    currThreadId,
    setPrevChats,
    setNewChat,
    error,
    setError,
    refreshThreads,
    toggleSidebar,
    sidebarOpen,
  } = useContext(MyContext);

  const { user, usage, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

  const handleSend = async (messageToSend) => {
    const message = (typeof messageToSend === "string" ? messageToSend : prompt).trim();
    if (!message || loading) return;

    setNewChat(false);
    setError(null);
    setPrompt("");
    setLoading(true);

    setPrevChats((prev) => [...prev, { role: "user", content: message }]);

    try {
      const reply = await sendChat(currThreadId, message);
      setPrevChats((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
      await refreshThreads();
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Failed to get a response. Please check if the backend is running."
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const usageLabel =
    usage?.dailyLimit === null
      ? "Unlimited"
      : `${usage?.messagesToday ?? 0}/${usage?.dailyLimit}`;

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <main className="chatWindow">
      {/* Top Navigation */}
      <header className="navbar">
        <div className="navLeft">
          <button
            type="button"
            className="sidebarToggleBtn"
            onClick={toggleSidebar}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-label="Toggle sidebar"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
          <div className="navBrand">
            <Logo size="sm" />
            <span className="brandName">SigmaGPT</span>
            <span className={`planBadge ${user?.plan || "free"}`}>
              {user?.plan || "free"}
            </span>
          </div>
        </div>

        <div className="navRight">
          <button
            type="button"
            className="upgradeQuickBtn"
            onClick={() => setShowUpgrade(true)}
            title="Upgrade subscription plan"
          >
            <i className="fa-solid fa-bolt"></i>
            <span>Upgrade</span>
          </button>

          <span className="usageBadge" title="Messages used today">
            <i className="fa-regular fa-clock"></i>
            {usageLabel} today
          </span>

          <div className="userMenuContainer" ref={menuRef}>
            <button
              type="button"
              className="userAvatarBtn"
              onClick={() => setMenuOpen(!menuOpen)}
              title="User profile & settings"
              aria-label="Open user menu"
            >
              <span className="userAvatarText">{userInitial}</span>
            </button>

            {menuOpen && (
              <div className="dropDown" role="menu">
                <div className="dropDownUser">
                  <div className="dropDownAvatar">{userInitial}</div>
                  <div className="dropDownUserInfo">
                    <strong className="dropDownUserName">{user?.name}</strong>
                    <span className="dropDownUserEmail">{user?.email}</span>
                    <span className={`planPill ${user?.plan || "free"}`}>
                      {user?.plan?.toUpperCase() || "FREE"} PLAN
                    </span>
                  </div>
                </div>

                <div
                  className="dropDownItem"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowSettings(true);
                  }}
                >
                  <i className="fa-solid fa-gear"></i>
                  <span>Settings & Profile</span>
                </div>

                <div
                  className="dropDownItem"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowUpgrade(true);
                  }}
                >
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>Upgrade Plan</span>
                </div>

                <a
                  href="https://github.com/harshvardhansinghbhanawat-glitch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dropDownItem dropDownLink"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="fa-brands fa-github"></i>
                  <span>Maintainer GitHub</span>
                </a>

                <div className="dropDownDivider"></div>

                <div
                  className="dropDownItem dropDownLogout"
                  role="menuitem"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <span>Log out</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Chat Display */}
      <Chat onSelectSuggestion={(promptText) => handleSend(promptText)} />

      {/* Loading Indicator */}
      {loading && (
        <div className="chatLoaderContainer">
          <div className="chatLoaderBubble">
            <Logo size="sm" />
            <div className="loaderContent">
              <span className="loaderText">SigmaGPT is thinking</span>
              <ScaleLoader color="#10a37f" height={14} width={3} radius={2} margin={2} loading={loading} />
            </div>
          </div>
        </div>
      )}

      {/* Chat Input & Website Footer */}
      <footer className="chatInputSection">
        <div className="inputBox">
          <input
            ref={inputRef}
            type="text"
            placeholder="Message SigmaGPT... (Press Enter to send)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            aria-label="Message prompt"
          />
          <button
            type="button"
            id="submit"
            onClick={() => handleSend()}
            className={loading || !prompt.trim() ? "disabled" : "active"}
            disabled={loading || !prompt.trim()}
            title="Send message"
            aria-label="Send message"
          >
            <i className="fa-solid fa-arrow-up"></i>
          </button>
        </div>

        <div className="footerAttribution">
          <p className="disclaimer">
            SigmaGPT can make mistakes. Verify important info.
          </p>
          <p className="authorCredit">
            Developed and maintained by{" "}
            <a
              href="https://github.com/harshvardhansinghbhanawat-glitch"
              target="_blank"
              rel="noopener noreferrer"
              className="footerLink"
            >
              Harshvardhan Singh
            </a>
          </p>
        </div>
      </footer>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onOpenUpgrade={() => setShowUpgrade(true)}
        />
      )}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </main>
  );
}

export default ChatWindow;
