import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import {
  fetchThreadMessages,
  deleteThread as deleteThreadApi,
} from "./api.js";
import Logo from "./components/Logo.jsx";

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setCurrThreadId,
    setPrevChats,
    setError,
    refreshThreads,
    sidebarOpen,
    setSidebarOpen,
  } = useContext(MyContext);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    refreshThreads();
  }, [refreshThreads, currThreadId]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setError(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const changeThread = async (threadId) => {
    if (threadId === currThreadId) {
      if (window.innerWidth < 768) setSidebarOpen(false);
      return;
    }

    setCurrThreadId(threadId);
    setError(null);

    try {
      const messages = await fetchThreadMessages(threadId);
      setPrevChats(Array.isArray(messages) ? messages : []);
      setNewChat(false);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load chat history");
      setPrevChats([]);
    }
  };

  const deleteThread = async (threadId, e) => {
    e.stopPropagation();

    try {
      await deleteThreadApi(threadId);
      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId)
      );

      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete chat");
    }
  };

  const filteredThreads = allThreads.filter((t) =>
    (t.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div className="sidebarHeader">
        <button
          type="button"
          onClick={createNewChat}
          className="newChatBtn"
          title="Start a new chat"
        >
          <div className="newChatBtnLeft">
            <Logo size="sm" />
            <span>New chat</span>
          </div>
          <i className="fa-solid fa-pen-to-square"></i>
        </button>
        <button
          type="button"
          className="sidebarCloseBtn"
          onClick={() => setSidebarOpen(false)}
          title="Close sidebar"
          aria-label="Close sidebar"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {allThreads.length > 5 && (
        <div className="historySearch">
          <i className="fa-solid fa-magnifying-glass searchIcon"></i>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="searchInput"
          />
        </div>
      )}

      <div className="historySection">
        <div className="historyHeader">
          <h2 className="historyTitle">Recent Conversations</h2>
          {allThreads.length > 0 && (
            <span className="historyCount">{allThreads.length}</span>
          )}
        </div>

        <ul className="history">
          {filteredThreads.length === 0 ? (
            <li className="emptyHistory">
              {searchQuery ? "No matching chats found" : "No chats yet"}
            </li>
          ) : (
            filteredThreads.map((thread) => (
              <li
                key={thread.threadId}
                onClick={() => changeThread(thread.threadId)}
                className={
                  thread.threadId === currThreadId ? "highlighted" : ""
                }
                title={thread.title}
              >
                <i className="fa-regular fa-message threadIcon"></i>
                <span className="threadTitle">{thread.title || "New Chat"}</span>
                <button
                  type="button"
                  className="deleteBtn"
                  onClick={(e) => deleteThread(thread.threadId, e)}
                  title="Delete conversation"
                  aria-label="Delete conversation"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="sidebarFooter">
        <div className="sign">
          <p className="attribution">
            Developed and maintained by{" "}
            <a
              href="https://github.com/harshvardhansinghbhanawat-glitch"
              target="_blank"
              rel="noopener noreferrer"
              className="maintainerLink"
            >
              Harshvardhan Singh
            </a>
          </p>
          <a
            href="https://github.com/harshvardhansinghbhanawat-glitch/SigmaGPT"
            target="_blank"
            rel="noopener noreferrer"
            className="repoLink"
            title="View on GitHub"
          >
            <i className="fa-brands fa-github"></i>
            <span>SigmaGPT on GitHub</span>
          </a>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
