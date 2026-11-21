import React from "react";
import { T, GAP, W, Card, RepetMark, Txt } from "../ui.jsx";
import { PHRASES } from "../content/legal.js";
import { stack, wrap } from "./shared.jsx";
import CodeForm from "../CodeForm.jsx";

/* ─── Saisie du code ─── */
export function CodeEntry({ initial, invalid, onOk }) {
  return (
    <div style={{ ...wrap(W.narrow), textAlign: "center", display: "grid", gap: GAP.grid, justifyItems: "center" }}>
      <RepetMark s={56} />
      <div style={stack(12)}>
        <Txt v="h1" as="h1" color={T.navy}>Bienvenue sur La Répét'</Txt>
        <Txt v="bodyLg" color={T.body}>Écrivez le code d'accès que votre coach vous a donné.</Txt>
      </div>
      <Card pad="lg" level={2} style={{ width: "100%", textAlign: "left" }}>
        <CodeForm initial={initial} invalid={invalid} onOk={onOk} size="lg" />
      </Card>
      <Txt v="caption" color={T.muted}>Ce code est à vous. Ne le donnez à personne. {PHRASES.code}</Txt>
    </div>
  );
}
