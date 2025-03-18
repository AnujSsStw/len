"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <main className="">
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch h-[calc(100vh-2rem)] overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="whitespace-pre-wrap">
            {message.role === "user" ? "User: " : "AI: "}
            {message.parts.map((part, i) => {
              switch (part.type) {
                case "text":
                  return (
                    <div
                      key={`${message.id}-${i}`}
                      dangerouslySetInnerHTML={{ __html: part.text }}
                    />
                  );
                case "tool-invocation":
                  if (part.toolInvocation.state === "result") {
                    return (
                      <div key={`${message.id}-${i}`}>
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded-md"
                          onClick={() => {
                            try {
                              if (part.toolInvocation.state === "result") {
                                const jsonStr = JSON.stringify(
                                  part.toolInvocation.result
                                );
                                const base64State = btoa(jsonStr);
                                window.open(
                                  `/latest?state=${base64State}&header=true`,
                                  "_blank"
                                );
                              }
                            } catch (error) {
                              console.error("Error processing state:", error);
                            }
                          }}
                        >
                          View PDF
                        </button>
                      </div>
                    );
                  }
              }
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />

        <form onSubmit={handleSubmit}>
          <input
            className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </main>
  );
}
