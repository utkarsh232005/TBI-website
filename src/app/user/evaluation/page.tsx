
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useChat } from '@/hooks/useChat';
import { Send, Paperclip } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef } from 'react';

export default function UserEvaluationPage() {
  const chatId = 'mentor-user-evaluation';
  const { messages, loading, sendMessage, user } = useChat(chatId);

  return (
    <div className="space-y-8">
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Chat with Mentor</CardTitle>
          <CardDescription className="text-gray-600">
            You can freely communicate with your mentor here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChatBox
            messages={messages}
            loading={loading}
            sendMessage={sendMessage}
            user={user}
            currentUserType="user"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ChatBox({ messages, loading, sendMessage, user, currentUserType }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() === "") return;
    sendMessage(input, currentUserType);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {loading ? (
            <div className="text-gray-400 text-center">Loading chat...</div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`flex items-end gap-2 ${msg.senderType === currentUserType ? 'justify-end' : 'justify-start'}`}
              >
                {msg.senderType !== currentUserType && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{msg.senderType.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                <div className="max-w-xs lg:max-w-md">
                  <div className={`px-4 py-3 rounded-2xl ${msg.senderType === currentUserType
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                    }`}>
                    <p className="text-sm break-words">{msg.text}</p>
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${msg.senderType === currentUserType ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp ? format(msg.timestamp.toDate(), 'p') : 'sending...'}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="relative">
          <Textarea
            className="w-full min-h-[48px] pr-28 resize-none rounded-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button size="icon" onClick={handleSend} className="rounded-full bg-blue-600 hover:bg-blue-700">
              <Send className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
