import React, { useState } from "react";
import { T, GAP, W, Card, Btn, I, RepetMark, Txt, Field, Input } from "../ui.jsx";
import { TRIAL_CODE, findParcours } from "../lib/store.js";
import { PHRASES } from "../content/legal.js";
import { CODE_ERR, stack, wrap } from "./shared.jsx";

/* ─── Saisie du code ─── */
export function CodeEntry({ initial, invalid, onOk }) {
  const [code, setCode] = useState((initial || TRIAL_CODE).toUpperCase());
  /* Erreur posée seulement si le code reçu par le lien est inconnu (BUG-04), pas après « Retour » depuis l'accord. */
  const [err, setErr] = useState(invalid ? CODE_ERR : "");
  const submit = e => {
    e?.preventDefault();
    const p = findParcours(code);
    if (!p) return setErr(CODE_ERR);
    onOk(p.code); // pas d'attente artificielle (UI-10)
  };
  return (
    <div style={{ ...wrap(W.narrow), textAlign: "center", display: "grid", gap: GAP.grid, justifyItems: "center" }}>
      <RepetMark s={56} />
      <div style={stack(12)}>
        <Txt v="h1" as="h1" color={T.navy}>Bienvenue sur La Répét'</Txt>
        <Txt v="bodyLg" color={T.body}>Écrivez le code d'accès que votre coach vous a donné.</Txt>
      </div>
      <Card pad="lg" level={2} style={{ width: "100%", textAlign: "left" }}>
        <form onSubmit={submit} style={stack(GAP.grid)}>
          <Field id="code" label="Votre code d'accès" error={err}>
            <Input id="code" variant="code" error={err} value={code} autoComplete="off" maxLength={6} placeholder="6 caractères"
              onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setErr(""); }} />
          </Field>
          <Btn kind="objective" size="lg" full disabled={code.length < 6} iconRight={I.arrow}>Ouvrir mon espace</Btn>
        </form>
      </Card>
      <Txt v="caption" color={T.muted}>Ce code est à vous. Ne le donnez à personne. {PHRASES.code}</Txt>
    </div>
  );
}
