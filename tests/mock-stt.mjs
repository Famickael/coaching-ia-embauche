import http from "http";
http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.end();
  let n = 0; req.on("data", c => n += c.length); req.on("end", () => {
    console.log("STT reçu", n, "octets");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ text: "x", duration: 5, segments: [
      { start: 0, end: 2.5, text: "Bonjour, euh, je m'appelle Alex et je postule comme agent d'accueil." },
      { start: 3, end: 5, text: "J'ai travaillé deux ans en magasin. C'est pour ça que ce poste me correspond." }] }));
  });
}).listen(Number(process.env.E2E_STT_PORT || 5099));
