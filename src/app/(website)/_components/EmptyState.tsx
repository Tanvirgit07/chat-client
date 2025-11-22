import React from 'react'

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
            <circle cx="12" cy="8" r="1" fill="currentColor"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
        </div>
        <h2 className="text-white text-2xl font-semibold">Chat anytime, anywhere</h2>
      </div>
    </div>
  )
}

export default EmptyState
