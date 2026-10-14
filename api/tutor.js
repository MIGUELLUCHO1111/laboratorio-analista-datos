// Tutor IA del Laboratorio del Analista: función de Vercel que conversa con Claude.
// Requiere la variable de entorno ANTHROPIC_API_KEY. Opcional: TUTOR_CODE para exigir un código de acceso.
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM =
  "Eres el tutor de una plataforma para aprender análisis de datos (Web Scraping, APIs, Python, SQL, Excel, Power BI y Git). " +
  "Responde en español, de forma clara y breve. Si la pregunta no tiene relación con aprender datos, programación o la plataforma, " +
  "redirige amablemente al tema de estudio.";

const MAX_CHARS = 60000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 30;
const hits = new Map();

function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  return list.length > MAX_HITS;
}

// Limpia la conversación: solo user/assistant con texto, alternando y terminando en user.
function cleanMessages(raw) {
  if (!Array.isArray(raw)) return null;
  const out = [];
  let total = 0;
  for (const m of raw.slice(-24)) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string" || !m.content.trim()) continue;
    total += m.content.length;
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += "\n\n" + m.content;
    else out.push({ role: m.role, content: m.content });
  }
  while (out.length && out[0].role !== "user") out.shift();
  if (!out.length || out[out.length - 1].role !== "user" || total > MAX_CHARS) return null;
  return out;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ configured: !!process.env.ANTHROPIC_API_KEY, needsCode: !!process.env.TUTOR_CODE });
  }
  if (req.method !== "POST") return res.status(405).json({ code: "invalid_request", error: "Método no permitido" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ code: "not_configured", error: "Falta ANTHROPIC_API_KEY" });
  if (process.env.TUTOR_CODE && req.headers["x-tutor-code"] !== process.env.TUTOR_CODE) {
    return res.status(401).json({ code: "bad_code", error: "Código de acceso incorrecto" });
  }
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  if (limited(ip)) return res.status(429).json({ code: "rate_limited", error: "Demasiadas preguntas seguidas" });

  const messages = cleanMessages(req.body && req.body.messages);
  if (!messages) return res.status(400).json({ code: "invalid_request", error: "Conversación no válida o demasiado larga" });

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: SYSTEM,
      messages,
    });
    if (response.stop_reason === "refusal") return res.status(200).json({ code: "refused", error: "Pregunta rechazada" });
    const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    return res.status(200).json({ text: text || "(sin respuesta)", truncated: response.stop_reason === "max_tokens" });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ code: "rate_limited", error: "Límite de la API alcanzado" });
    if (err instanceof Anthropic.AuthenticationError) return res.status(503).json({ code: "not_configured", error: "Clave de API inválida" });
    if (err instanceof Anthropic.APIError) return res.status(502).json({ code: "upstream_error", error: `Error de la API (${err.status})` });
    return res.status(500).json({ code: "upstream_error", error: "Error inesperado" });
  }
}
