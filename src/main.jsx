import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

/* Filet de sécurité : en cas d'erreur d'affichage, montrer un message plutôt qu'une page blanche. */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error(error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    const home = () => { location.hash = ""; location.reload(); };
    return (
      <div style={{ maxWidth: 560, margin: "80px auto", padding: "0 24px", fontFamily: "system-ui, sans-serif", color: "#1E2A3B" }}>
        <h1 style={{ fontSize: 24, margin: "0 0 12px" }}>Un problème d'affichage est survenu</h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, margin: "0 0 20px" }}>Vos données restent enregistrées sur cet appareil. Vous pouvez revenir à l'accueil et réessayer.</p>
        <button onClick={home} style={{ font: "600 15px system-ui, sans-serif", padding: "10px 18px", borderRadius: 999, border: "none", background: "#386097", color: "#fff", cursor: "pointer" }}>Revenir à l'accueil</button>
        <pre style={{ marginTop: 24, fontSize: 12, color: "#64748B", whiteSpace: "pre-wrap" }}>{String(this.state.error?.message || this.state.error)}</pre>
      </div>
    );
  }
}

createRoot(document.getElementById("root")).render(<ErrorBoundary><App /></ErrorBoundary>);
