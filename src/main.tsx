import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { testGeminiAuthentication } from "./lib/openai-test";

// Gemini API認証テスト（初期化時に1回だけ実行）
testGeminiAuthentication();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
