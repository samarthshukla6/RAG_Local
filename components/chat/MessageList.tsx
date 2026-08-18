import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import type { ChatMessage } from "@/types/chat";

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <AnimatePresence initial={false}>
      {messages.map((message, index) => (
        <motion.div
          key={`${index}-${message.role}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-4"
        >
          <MessageBubble message={message} />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
