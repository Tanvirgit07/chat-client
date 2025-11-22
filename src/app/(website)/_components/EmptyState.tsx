import Image from 'next/image'
import React from 'react'

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24  flex items-center justify-center mx-auto mb-4">
         <Image src="/images/chat-auth1.webp" width={300} height={300} alt='image'/>
        </div>
        <h2 className="text-white text-2xl font-semibold">Chat anytime, anywhere</h2>
      </div>
    </div>
  )
}

export default EmptyState
