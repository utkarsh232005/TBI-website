// src/app/mentor/evaluation/page.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardCheck, 
  Plus, 
  MoreHorizontal, 
  Paperclip, 
  MessageSquare,
  Star,
  Calendar,
  User,
  Flag,
  Filter,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type Status = "Backlog" | "In Progress" | "Completed";
type Priority = "Low" | "Medium" | "High";

interface EvaluationTask {
  id: string;
  title: string;
  menteeName: string;
  menteeAvatar: string;
  dueDate: Date;
  priority: Priority;
  status: Status;
  attachmentCount: number;
  commentCount: number;
}

// --- Dummy Data ---
const initialTasks: EvaluationTask[] = [
  { id: 'task-1', title: 'Review Q1 Business Plan', menteeName: 'Alice Johnson', menteeAvatar: '/api/placeholder/100/100', dueDate: new Date('2024-08-15'), priority: 'High', status: 'In Progress', attachmentCount: 2, commentCount: 5 },
  { id: 'task-2', title: 'Prototype Feedback Session', menteeName: 'Bob Williams', menteeAvatar: '/api/placeholder/100/100', dueDate: new Date('2024-08-20'), priority: 'Medium', status: 'In Progress', attachmentCount: 1, commentCount: 2 },
  { id: 'task-3', title: 'Final Pitch Deck Evaluation', menteeName: 'Charlie Brown', menteeAvatar: '/api/placeholder/100/100', dueDate: new Date('2024-07-30'), priority: 'High', status: 'Completed', attachmentCount: 3, commentCount: 8 },
  { id: 'task-4', title: 'Market Research Analysis', menteeName: 'Diana Prince', menteeAvatar: '/api/placeholder/100/100', dueDate: new Date('2024-08-25'), priority: 'Low', status: 'Backlog', attachmentCount: 0, commentCount: 0 },
  { id: 'task-5', title: 'Review User Testing Results', menteeName: 'Ethan Hunt', menteeAvatar: '/api/placeholder/100/100', dueDate: new Date('2024-09-01'), priority: 'Medium', status: 'Backlog', attachmentCount: 5, commentCount: 1 },
  { id: 'task-6', title: 'Financial Projections Review', menteeName: 'Fiona Glenanne', menteeAvatar: '/api/placeholder/100/100', dueDate: new Date('2024-08-18'), priority: 'High', status: 'In Progress', attachmentCount: 1, commentCount: 3 },
  { id: 'task-7', title: 'Q2 Progress Report', menteeName: 'Grace O-Malley', menteeAvatar: '/api/placeholder/100/100', dueDate: new Date('2024-07-25'), priority: 'Low', status: 'Completed', attachmentCount: 1, commentCount: 4 },
];

const getPriorityStyles = (priority: Priority): string => {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-800 border-red-200';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusStyles = (status: Status): string => {
  switch (status) {
    case 'Backlog': return 'bg-gray-200';
    case 'In Progress': return 'bg-blue-500';
    case 'Completed': return 'bg-green-500';
    default: return 'bg-gray-200';
  }
};

const TaskCard = ({ task, handleDragStart }: { task: EvaluationTask, handleDragStart: (e: React.DragEvent<HTMLDivElement>, task: EvaluationTask) => void }) => {
  return (
    <motion.div
      draggable="true"
      onDragStart={(e) => handleDragStart(e, task)}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card className="bg-white hover:bg-gray-50 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-gray-900 leading-snug">{task.title}</h4>
            <Badge className={`text-xs font-medium border ${getPriorityStyles(task.priority)}`}>
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.menteeAvatar} alt={task.menteeName} />
              <AvatarFallback className="text-xs">{task.menteeName.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">{task.menteeName}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center space-x-3">
              {task.attachmentCount > 0 && (
                <div className="flex items-center space-x-1">
                  <Paperclip className="w-3 h-3" />
                  <span>{task.attachmentCount}</span>
                </div>
              )}
              {task.commentCount > 0 && (
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{task.commentCount}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const BoardColumn = ({ title, status, tasks, handleDragStart, onDrop }: { title: string; status: Status; tasks: EvaluationTask[], handleDragStart: (e: React.DragEvent<HTMLDivElement>, task: EvaluationTask) => void, onDrop: (e: React.DragEvent<HTMLDivElement>, status: Status) => void }) => {
  const [active, setActive] = useState(false);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setActive(false);
    onDrop(e, status);
  };
  
  return (
    <div 
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`bg-gray-100 rounded-xl p-4 flex-1 min-w-[300px] transition-colors duration-200 ${active ? 'bg-blue-100' : ''}`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusStyles(status)}`}></div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <span className="text-sm text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">{tasks.length}</span>
        </div>
        <button className="text-gray-500 hover:text-gray-800">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-3 h-full overflow-y-auto">
        <AnimatePresence>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} handleDragStart={handleDragStart} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AddTaskModal = ({ isOpen, onClose, onAddTask }: { isOpen: boolean, onClose: () => void, onAddTask: (task: Omit<EvaluationTask, 'id' | 'status'>) => void }) => {
  const [title, setTitle] = useState('');
  const [menteeName, setMenteeName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !menteeName || !dueDate) return;

    onAddTask({
      title,
      menteeName,
      menteeAvatar: '/api/placeholder/100/100',
      dueDate: new Date(dueDate),
      priority,
      attachmentCount: 0,
      commentCount: 0,
    });
    onClose();
    setTitle('');
    setMenteeName('');
    setDueDate('');
    setPriority('Medium');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">New Evaluation Task</h2>
          <button onClick={onClose}><X/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" required />
          <input type="text" placeholder="Mentee Name" value={menteeName} onChange={e => setMenteeName(e.target.value)} className="w-full p-2 border rounded" required />
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border rounded" required />
          <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="w-full p-2 border rounded">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default function MentorEvaluationPage() {
  const [tasks, setTasks] = useState<EvaluationTask[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: EvaluationTask) => {
    e.dataTransfer.setData("taskId", task.id);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const handleAddTask = (newTaskData: Omit<EvaluationTask, 'id' | 'status'>) => {
    const newTask: EvaluationTask = {
      id: `task-${Date.now()}`,
      status: 'Backlog',
      ...newTaskData,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const columns: { title: string; status: Status }[] = [
    { title: "Backlog", status: "Backlog" },
    { title: "In Progress", status: "In Progress" },
    { title: "Completed", status: "Completed" },
  ];

  return (
    <>
      <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Evaluation Board</h1>
            <p className="text-gray-600">Track and manage your mentee evaluations.</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 flex space-x-4 overflow-x-auto pb-4">
          {columns.map(col => (
            <BoardColumn 
              key={col.status} 
              title={col.title} 
              status={col.status}
              tasks={tasks.filter(t => t.status === col.status)}
              handleDragStart={handleDragStart}
              onDrop={onDrop}
            />
          ))}
        </div>
      </div>
      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddTask={handleAddTask} />
    </>
  );
}
