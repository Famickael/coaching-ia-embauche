import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { themeCSS } from "./tokens.js";
import { loadA11y, applyA11y } from "./lib/a11y.js";

/* Thème et options d'accessibilité appliqués avant le premier rendu : pas de flash. */
const themeStyle = document.createElement("style");
themeStyle.id = "rp-theme";
themeStyle.textContent = themeCSS();
document.head.appendChild(themeStyle);
applyA11y(loadA11y());
import { T, TY, W, Txt, Btn } from "./ui.jsx";

/* Filet de sécurité : en cas d'erreur d'affichage, montrer un message plutôt qu'une page blanche. */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error(error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    const home = () => { location.hash = ""; location.reload(); };
    return (
      <div style={{ maxWidth: W.form, margin: "80px auto", padding: "0 24px", display: "grid", gap: 16, justifyItems: "start", color: T.navy }}>
        <Txt v="h1" as="h1" color={T.navy}>Un problème d'affichage est survenu</Txt>
        <Txt v="bodyLg" color={T.body}>Vos données restent enregistrées sur cet appareil. Vous pouvez revenir à l'accueil et réessayer.</Txt>
        <Btn kind="primary" onClick={home}>Revenir à l'accueil</Btn>
        <pre style={{ ...TY.mono, margin: 0, color: T.muted, whiteSpace: "pre-wrap" }}>{String(this.state.error?.message || this.state.error)}</pre>
      </div>
    );
  }
}

createRoot(document.getElementById("root")).render(<ErrorBoundary><App /></ErrorBoundary>);
