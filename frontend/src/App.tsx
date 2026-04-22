//routes between Login and Dashboard based on auth state
 
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
 
export default function App() {
  const { user, loading, login } = useAuth();
 
  if (loading) return <p style={{ padding: 20 }}>Loading…</p>;
  //if (loading) return null; // could be a small spinner for the sillies ,prevents flash of login page on refresh
 
  if (!user) return <Login onLogin={login} />;
 
  return <Dashboard />;
}