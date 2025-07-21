
// src/app/mentor/evaluation/page.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ClipboardCheck, Star, TrendingUp, Award, Send, Paperclip } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useChat } from '@/hooks/useChat';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef } from 'react';

export default function MentorEvaluationPage() {
  const prerequisiteQuestions = [
    "Have you completed the assigned tasks from the last session?",
    "What challenges did you face this week?",
    "Did you reach out for help when needed?",
    "What are your goals for the upcoming week?",
    "Is there any resource or support you need from me?",
  ];

  const chatId = 'mentor-user-evaluation';
  const { messages, loading, sendMessage, user } = useChat(chatId);

  const sendMentorMessage = (text: string) => {
    sendMessage(text, 'mentor');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Evaluation Center
            </h1>
            <p className="text-gray-600 text-lg">
              Review and provide feedback on your mentees' progress.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <ClipboardCheck className="h-5 w-5" />
            <span className="text-sm">Evaluation Tools</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Pending Evaluations</CardTitle>
            <ClipboardCheck className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 mb-1">3</div>
            <div className="flex items-center text-xs text-gray-500">
              <span>evaluations pending</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Average Rating</CardTitle>
            <Star className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 mb-1">4.8</div>
            <div className="flex items-center text-xs text-gray-500">
              <span>out of 5 stars</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Completed Reviews</CardTitle>
            <Award className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-1">12</div>
            <div className="flex items-center text-xs text-gray-500">
              <span>reviews completed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Prerequisite Questions</CardTitle>
          <CardDescription className="text-gray-600">
            Ask your mentee the following questions to assess their progress:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-gray-800">
            {prerequisiteQuestions.map((q, idx) => (
              <li
                key={idx}
                className="cursor-pointer hover:underline hover:text-blue-600 transition-colors"
                onClick={() => sendMentorMessage(q)}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') sendMentorMessage(q); }}
                role="button"
                aria-label={`Send question: ${q}`}
              >
                {q}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Chat with Mentee</CardTitle>
          <CardDescription className="text-gray-600">
            Use the chatbox below to communicate with your mentee in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChatBox
            messages={messages}
            loading={loading}
            sendMessage={sendMessage}
            user={user}
            currentUserType="mentor"
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
