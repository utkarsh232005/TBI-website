"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { resetPassword } from '@/app/actions/auth-actions';

interface PasswordResetDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PasswordResetDialog({ isOpen, onClose }: PasswordResetDialogProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setStatus('error');
            setMessage('Please enter your email address');
            return;
        }

        setIsLoading(true);
        setStatus('idle');

        try {
            const result = await resetPassword(email.trim());

            if (result.success) {
                setStatus('success');
                setMessage(result.message);
                setEmail('');
            } else {
                setStatus('error');
                setMessage(result.message);
            }
        } catch (error) {
            setStatus('error');
            setMessage('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setStatus('idle');
        setMessage('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                />

                {/* Dialog */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md mx-4"
                >
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="relative bg-gray-900 px-6 py-8">
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-white/20 rounded-full">
                                    <Mail className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Reset Password
                                    </h2>
                                    <p className="text-gray-300 text-sm font-medium">
                                        Enter your email to receive reset instructions
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {status === 'success' ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-4"
                                >
                                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Email Sent!
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {message}
                                    </p>
                                    <button
                                        onClick={handleClose}
                                        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200"
                                    >
                                        Continue
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="reset-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email address"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                                disabled={isLoading}
                                            />
                                            <Mail className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>

                                    {status === 'error' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg"
                                        >
                                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                            <span className="text-sm">{message}</span>
                                        </motion.div>
                                    )}

                                    <div className="flex space-x-3">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isLoading || !email.trim()}
                                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Sending...</span>
                                                </>
                                            ) : (
                                                <span>Send Reset Link</span>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
