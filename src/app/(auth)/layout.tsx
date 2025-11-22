import React from "react";
import Image from "next/image";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div>
        <Image
          src="/images/bgImage.svg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Overlay with blur */}
      <div className="absolute inset-0 bg-black/8 backdrop-blur-2xl"></div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default Layout;
