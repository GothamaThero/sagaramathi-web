import React from "react";
import RootRouter from "./router/root.router";
import { FloatingChatWidget } from "./component/FloatingChatWidget";

const App: React.FC = () => {
  return (
    <>
      <RootRouter />
      <FloatingChatWidget />
    </>
  );
};

export default App;