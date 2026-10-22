import { useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { ScorePage } from "./pages/ScorePage";
import type { Session } from "./types";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  if (!session) {
    return <LoginPage onLogin={setSession} />;
  }

  return <ScorePage session={session} onLogout={() => setSession(null)} />;
}
