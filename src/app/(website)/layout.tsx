import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="mt-[90px]">{children}</div>
    </div>
  );
}

export default layout;
