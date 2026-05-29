"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.chatContainer}>
        <header className={styles.header}>
          <h1>Onboarding Assistant</h1>
        </header>

        <div className={styles.messageList}>
          {messages.length === 0 && (
            <p className={styles.emptyState}>
              Say hello to get started with your onboarding!
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.message} ${
                msg.role === "user" ? styles.userMessage : styles.assistantMessage
              }`}
            >
              <span className={styles.roleLabel}>
                {msg.role === "user" ? "You" : "Assistant"}
              </span>
              <p>{msg.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.assistantMessage}`}>
              <span className={styles.roleLabel}>Assistant</span>
              <p className={styles.thinking}>Thinking…</p>
            </div>
          )}
        </div>

        <form className={styles.inputForm} onSubmit={handleSubmit}>
          <input
            className={styles.textInput}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            disabled={isLoading}
          />
          <button
            className={styles.sendButton}
            type="submit"
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
