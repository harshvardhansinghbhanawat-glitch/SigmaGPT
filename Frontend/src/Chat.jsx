import "./Chat.css";
import { useContext, useEffect, useRef, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import Logo from "./components/Logo.jsx";

const SUGGESTIONS = [
  {
    icon: "fa-solid fa-lightbulb",
    title: "Explain concepts",
    desc: "Explain quantum computing in simple terms",
    prompt: "Explain quantum computing in simple terms with easy-to-understand analogies.",
  },
  {
    icon: "fa-solid fa-code",
    title: "Code assistance",
    desc: "Write a REST API in Node.js & Express",
    prompt: "Show me how to build a secure REST API with Node.js and Express.",
  },
  {
    icon: "fa-regular fa-envelope",
    title: "Draft content",
    desc: "Draft a professional follow-up email",
    prompt: "Draft a polite and concise follow-up email for a software developer interview.",
  },
  {
    icon: "fa-solid fa-rocket",
    title: "Brainstorm ideas",
    desc: "Brainstorm innovative AI application ideas",
    prompt: "Give me 5 innovative full-stack AI web application ideas with practical architectures.",
  },
];

function CodeBlockWithCopy({ children, ...props }) {
  const [copied, setCopied] = useState(false);
  const codeText = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="codeBlockWrapper">
      <div className="codeBlockHeader">
        <span className="codeLanguage">Code</span>
        <button
          type="button"
          onClick={handleCopy}
          className="codeCopyBtn"
          title="Copy code to clipboard"
        >
          <i className={copied ? "fa-solid fa-check" : "fa-regular fa-copy"}></i>
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <pre {...props}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Chat({ onSelectSuggestion }) {
  const { newChat, prevChats, error, setError } = useContext(MyContext);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [prevChats]);

  return (
    <div className="chatContainer">
      {error && (
        <div className="chatErrorBanner" role="alert">
          <i className="fa-solid fa-triangle-exclamation errorIcon"></i>
          <span className="errorText">{error}</span>
          <button
            type="button"
            className="errorDismissBtn"
            onClick={() => setError(null)}
            title="Dismiss error"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {newChat && prevChats.length === 0 ? (
        <div className="welcomeSection">
          <div className="welcomeHeader">
            <Logo size="lg" className="welcomeLogo" />
            <h1 className="welcomeTitle">Welcome to SigmaGPT</h1>
            <p className="welcomeSubtitle">
              How can I assist you with code, ideas, or writing today?
            </p>
          </div>

          <div className="suggestionsGrid">
            {SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className="suggestionCard"
                onClick={() => onSelectSuggestion?.(item.prompt)}
              >
                <div className="suggestionIcon">
                  <i className={item.icon}></i>
                </div>
                <div className="suggestionContent">
                  <div className="suggestionTitle">{item.title}</div>
                  <div className="suggestionDesc">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="chats">
          {prevChats.map((chat, idx) => (
            <div
              className={`messageRow ${chat.role === "user" ? "userRow" : "gptRow"}`}
              key={`${chat.role}-${idx}`}
            >
              <div className="messageAvatar">
                {chat.role === "user" ? (
                  <div className="userAvatarIcon">
                    <i className="fa-solid fa-user"></i>
                  </div>
                ) : (
                  <Logo size="sm" className="gptAvatarIcon" />
                )}
              </div>

              <div className="messageBody">
                <div className="messageSender">
                  {chat.role === "user" ? "You" : "SigmaGPT"}
                </div>
                {chat.role === "user" ? (
                  <p className="userMessage">{chat.content}</p>
                ) : (
                  <div className="gptMessage">
                    <ReactMarkdown
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        pre: CodeBlockWithCopy,
                      }}
                    >
                      {chat.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>
      )}
    </div>
  );
}

export default Chat;
