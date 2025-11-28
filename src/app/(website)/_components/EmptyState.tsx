import Image from 'next/image';
import React from 'react';

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-900/30 p-4">
      <div className="text-center max-w-md">
        <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 flex items-center justify-center mx-auto mb-6 sm:mb-8 animate-pulse">
          <Image 
            src="/images/chat-auth1.webp" 
            width={300} 
            height={300} 
            alt="QuickChat Logo"
            className="w-full h-full object-contain drop-shadow-2xl"
            priority
          />
        </div>
        
        <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Chat anytime, anywhere
        </h2>
        
        <p className="text-gray-400 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 px-4">
          Select a conversation from the sidebar to start messaging
        </p>

        <div className="flex items-center justify-center gap-3 sm:gap-4 text-gray-500 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.2s]" />
            <span>Fast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]" />
            <span>Reliable</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmptyState;