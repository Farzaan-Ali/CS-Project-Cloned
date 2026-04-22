import React, { useState, useEffect } from "react";
import bgImage from "../assets/bgimage.jpg";
import slide1 from "../assets/slide1.png";
import slide2 from "../assets/slide2.png";
import slide3 from "../assets/slide3.png";

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<string | null>;
}

// Receives onLogin prop, Login needs to know if user succeeds, prop allows this
export default function Login({ onLogin }: LoginProps) {
  const slides: string[] = [slide1, slide2, slide3];
  const [index, setIndex] = useState<number>(0);

  // Form State
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // UI Logic State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBtnHovered, setIsBtnHovered] = useState<boolean>(false);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => nextSlide(), 5000);
    return () => clearInterval(timer);
  }, [index]);

  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    const err = await onLogin(email, password);
    if (err) setErrorMessage(err);
    setIsLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>

        {/* LEFT PANEL */}
        <div style={styles.leftPanel}>
          <div style={styles.slideWrapper}>
            <img
              src={slides[index]}
              alt="Platform Detail"
              style={styles.slideImage}
            />
            <div style={styles.slideControls}>
              <button onClick={prevSlide} style={styles.navBtn}>◀</button>
              <div style={styles.dotContainer}>
                {slides.map((_, i) => (
                  <div key={i} style={{...styles.dot, opacity: i === index ? 1 : 0.3}} />
                ))}
              </div>
              <button onClick={nextSlide} style={styles.navBtn}>▶</button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.rightPanel}>
          <div style={styles.formHeader}>
            <h1 style={styles.title}>Login page</h1>
            <p style={styles.subtitle}>Secure Tool Platform Login</p>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            {errorMessage && <div style={styles.errorBox}>{errorMessage}</div>}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="admin@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              style={{
                ...styles.loginBtn,
                backgroundColor: isLoading ? "#4b5563" : isBtnHovered ? "#2563eb" : "#3b82f6",
                transform: isBtnHovered ? "translateY(-1px)" : "none",
              }}
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </button>

            <button type="button" style={styles.forgotBtn}>
              Forgot Password?
            </button>
          </form>

          <p style={styles.footerText}>
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Deployable Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Inter', sans-serif",
  },
  glassCard: {
    display: "flex",
    width: "90%",
    maxWidth: "1000px",
    height: "650px",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(10px)",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  leftPanel: {
    flex: 1,
    backgroundColor: "#0f172a",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },
  rightPanel: {
    flex: 1,
    padding: "60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  slideWrapper: { width: "100%", textAlign: "center" },
  slideImage: { width: "100%", borderRadius: "12px", boxShadow: "0 10px 15px rgba(0,0,0,0.3)", transition: "all 0.5s ease-in-out" },
  slideControls: { display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px", gap: "15px" },
  navBtn: { background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" },
  dotContainer: { display: "flex", gap: "8px" },
  dot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "white" },
  formHeader: { marginBottom: "32px" },
  title: { fontSize: "28px", fontWeight: 800, margin: 0, color: "#1e293b" },
  subtitle: { color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#475569" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", outline: "none", transition: "border 0.2s" },
  loginBtn: { padding: "14px", borderRadius: "8px", border: "none", color: "white", fontSize: "16px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease", marginTop: "10px" },
  errorBox: { padding: "12px", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "13px", fontWeight: 500 },
  forgotBtn: { background: "none", border: "none", color: "#3b82f6", fontSize: "13px", fontWeight: 600, cursor: "pointer", marginTop: "10px" },
  footerText: { textAlign: "center", fontSize: "11px", color: "#94a3b8", marginTop: "40px", textTransform: "uppercase", letterSpacing: "1px" },
};
