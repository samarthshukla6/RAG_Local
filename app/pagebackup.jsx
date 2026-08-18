"use client";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiUser, FiCpu } from "react-icons/fi";

// Default chat options for quick start
const defaultOptions = [
  "Tell me about the latest AI advancements",
  "Explain quantum computing",
  "What are the best practices in cybersecurity?",
  "How does blockchain technology work?",
];

const Markdown = ({ content }) => {
  return (
    <ReactMarkdown
      className="prose mt-1 w-full break-words prose-p:leading-relaxed py-3 px-3 mark-down"
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => (
          <a {...props} style={{ color: "#27afcf", fontWeight: "bold" }} />
        ),
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        p: ({ children }) => <p className="whitespace-pre-line">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-bold">{children}</strong>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-500 pl-4 py-2 my-2 italic bg-gray-800 rounded">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

function extractMessage(response) {
  // Log the response to check its format
  console.log("Raw Response:", response);

  // Ensure the response is a string, and if not, convert it to a string
  const responseStr =
    typeof response === "string" ? response : JSON.stringify(response);

  // Log the response string to see what is being passed
  console.log("Formatted Response String:", responseStr);

  // Check if the response has <think> tags before applying the replace function
  const cleanResponse = responseStr.replace(/<think>.*?<\/think>/g, "").trim();

  // Log the clean response to see the final result
  console.log("Cleaned Response:", cleanResponse);

  // Return the cleaned response without <think> tags
  return cleanResponse;
}

function cleanInput(input) {
  // Remove the content inside <think> tags, including the tags themselves
  return input.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

// Main ChatStream component

const ChatStream = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [personality, setPersonality] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [loading, setLoading] = useState(false); // Loader state
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await startChat(question);
  };

  const startChat = async (initialQuestion) => {
    setChatStarted(true);
    setLoading(true); // Start loader
    setQuestion("");

    setMessages((prev) => [
      ...prev,
      { type: "user", content: initialQuestion },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: initialQuestion,
          personality,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      const { text } = result;

      setMessages((prev) => [
        ...prev,
        { type: "ai", content: extractMessage(text) },
      ]);
      console.log(messages);
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          content: "An error occurred while processing your request.",
        },
      ]);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  console.log(messages);

  // Function to handle alert notification
  const handleAlert = () => {
    alert(`The personality is set to: ${personality}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-1/4 p-6 bg-gray-800 space-y-6">
        <h2 className="text-2xl font-semibold">Configure Chat</h2>
        <div className="space-y-4">
          <div>
            <label className="text-lg font-medium">Personality</label>
            <input
              type="text"
              className="w-full p-3 mt-2 rounded bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="e.g., Fashion influencer"
            />
          </div>
          {/* Alert button */}
          <button
            onClick={handleAlert}
            className="w-full p-3 bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none"
          >
            Set Personality
          </button>
          <div className="about-us-container max-w-4xl mx-auto p-8 bg-gray-700 rounded-lg shadow-lg">
            <div className="flex items-center justify-center space-x-6 mb-6">
              {/* Innovation icon before the title */}
              <div className="p-3 bg-indigo-600 rounded-full">
                <FiCpu className="text-5xl text-white" />
              </div>
              <h1 className="text-4xl font-extrabold text-indigo-500 tracking-wide">
                Local Chat
              </h1>
              {/* Innovation icon after the title */}
              <div className="p-3 bg-indigo-600 rounded-full">
                <FiSend className="text-3xl text-white" />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-200 mb-4">
                  About Us
                </h2>
                <p className="text-gray-200">
                  We are a dedicated team providing the best services to our
                  clients. Our goal is to ensure customer satisfaction through
                  quality and reliability.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="icon-item">
                  <div className="p-2 bg-indigo-100 rounded-full mx-auto mb-2">
                    <i className="fas fa-users text-indigo-500 text-2xl"></i>
                  </div>
                  <span className="font-semibold text-gray-200">Our Team</span>
                </div>
                <div className="icon-item">
                  <div className="p-2 bg-indigo-100 rounded-full mx-auto mb-2">
                    <i className="fas fa-award text-indigo-500 text-2xl"></i>
                  </div>
                  <span className="font-semibold text-gray-200">Awards</span>
                </div>
                <div className="icon-item">
                  <div className="p-2 bg-indigo-100 rounded-full mx-auto mb-2">
                    <i className="fas fa-cogs text-indigo-500 text-2xl"></i>
                  </div>
                  <span className="font-semibold text-gray-200">Services</span>
                </div>
                <div className="icon-item">
                  <div className="p-2 bg-indigo-100 rounded-full mx-auto mb-2">
                    <i className="fas fa-comments text-indigo-500 text-2xl"></i>
                  </div>
                  <span className="font-semibold text-gray-200">
                    Customer Support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="w-3/4 flex flex-col h-screen">
        <div
          className="flex-grow p-6 overflow-y-auto custom-scrollbar"
          ref={chatContainerRef}
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] p-4 my-4 rounded-lg shadow ${
                    message.type === "user" ? "bg-indigo-600" : "bg-gray-700"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {message.type === "user" ? (
                      <FiUser className="text-2xl" />
                    ) : (
                      <FiCpu className="text-3xl" />
                    )}
                    <div>
                      <p className="text-sm whitespace-pre-wrap">
                        {message.type === "user" ? (
                          cleanInput(message.content)
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {cleanInput(message.content)}
                          </ReactMarkdown>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {/* Loader */}
          {loading && (
            <div className="flex justify-center my-4">
              <div className="loader border-t-4 border-indigo-600 rounded-full w-8 h-8 animate-spin"></div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <motion.form
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="flex p-6 bg-gray-800 fixed bottom-0 w-full"
        >
          <input
            type="text"
            className="flex-grow p-4 rounded-l-lg bg-gray-700 text-gray-100 focus:outline-none"
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            type="submit"
            className="bg-indigo-600 p-4 rounded-r-lg hover:bg-indigo-700 focus:outline-none"
          >
            <FiSend className="text-xl" />
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default ChatStream;
