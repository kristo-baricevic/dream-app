'use client';

import { useState } from 'react';
import ChatWindow from './ChatWindow';
import ChatButton from './ChatButton';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {}

export default function ChatInterface({}: ChatInterfaceProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Button */}
      {!isOpen && <ChatButton isOpen={isOpen} setIsOpen={setIsOpen} />}

      <ChatWindow isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}
