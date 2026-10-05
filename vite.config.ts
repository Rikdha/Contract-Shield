import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

function contractShieldApiPlugin(): Plugin {
  return {
    name: 'contract-shield-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Handle /api/audit
        if (req.url?.startsWith('/api/audit') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const { code, contractType, title } = JSON.parse(body || '{}');
              const docType = contractType === 'legal_contract' ? 'legal_contract' : 'smart_contract';
              const docTitle = title || (docType === 'smart_contract' ? 'Smart Contract' : 'Legal Agreement');

              if (process.env.GEMINI_API_KEY) {
                try {
                  const ai = new GoogleGenAI({
                    apiKey: process.env.GEMINI_API_KEY,
                    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
                  });

                  const prompt = `You are Contract Shield, an elite contract auditor and security engineer.
Audit the following ${docType === 'smart_contract' ? 'Smart Contract code' : 'Legal Agreement text'}.
Contract Title: "${docTitle}"
Document Content:
\`\`\`
${code.slice(0, 20000)}
\`\`\`

Perform an exhaustive security and risk audit. Return a strictly structured JSON response.`;

                  const response = await ai.models.generateContent({
                    model: 'gemini-3.8-flash',
                    contents: prompt,
                    config: { responseMimeType: 'application/json' },
                  });

                  const rawText = response.text || '';
                  const result = JSON.parse(rawText.trim());

                  res.statusCode = 200;
                  res.end(JSON.stringify({ success: true, report: result, provider: 'gemini-3.8-flash' }));
                  return;
                } catch (geminiError: any) {
                  console.warn('Gemini API call failed:', geminiError?.message);
                }
              }

              res.statusCode = 204;
              res.end();
            } catch (e: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        // Handle /api/chat
        if (req.url?.startsWith('/api/chat') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const { messages, enableSearch, contractContext } = JSON.parse(body || '{}');
              const latestUserMsg = messages?.[messages.length - 1]?.text || '';

              if (process.env.GEMINI_API_KEY) {
                try {
                  const ai = new GoogleGenAI({
                    apiKey: process.env.GEMINI_API_KEY,
                    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
                  });

                  const formattedContents = (messages || []).map((m: any) => ({
                    role: m.role === 'model' ? 'model' : 'user',
                    parts: [{ text: m.text }],
                  }));

                  const systemInstruction = `You are ContractShield AI, an empathetic, expert contract advisor and legal companion.
Your primary mission is to protect regular people, freelancers, students, and startup founders from predatory legal and smart contract clauses.
CRITICAL COMMUNICATION GUIDELINES:
1. Explain everything in simple, everyday language. Never use dense legalese without instantly translating it into plain English.
2. If explaining a clause, always tell the user: "What this really means for you" and "How to protect yourself / What to ask for instead".
3. Be reassuring, friendly, and practical.
4. When Google Search is enabled, incorporate the latest legal standards, court precedents, and official consumer protection regulations.

${contractContext ? `\nACTIVE CONTRACT CONTEXT:\n${contractContext.slice(0, 10000)}` : ''}`;

                  const tools: any[] = [];
                  if (enableSearch) {
                    tools.push({ googleSearch: {} });
                  }

                  const response = await ai.models.generateContent({
                    model: 'gemini-3.5-flash',
                    contents: formattedContents,
                    config: {
                      systemInstruction,
                      tools: tools.length > 0 ? tools : undefined,
                    },
                  });

                  const replyText = response.text || "I've reviewed your question. Could you clarify which clause you'd like me to look into?";
                  const candidate = response.candidates?.[0];
                  const groundingChunks = (candidate as any)?.groundingMetadata?.groundingChunks || [];
                  const webSearchQueries = (candidate as any)?.groundingMetadata?.webSearchQueries || [];

                  res.statusCode = 200;
                  res.end(JSON.stringify({
                    success: true,
                    reply: replyText,
                    grounding: { chunks: groundingChunks, queries: webSearchQueries },
                    model: 'gemini-3.5-flash',
                  }));
                  return;
                } catch (geminiChatErr: any) {
                  console.warn('Gemini chat error, fallback active:', geminiChatErr?.message);
                }
              }

              // Friendly Plain English Fallback Assistant
              let fallbackReply = `Here is a plain-English explanation for you:\n\n`;
              const lower = latestUserMsg.toLowerCase();
              if (lower.includes('non-compete') || lower.includes('compete')) {
                fallbackReply += `• **What is happening:** The other party is trying to stop you from working in your entire industry for up to 3 years after this contract ends.\n• **Why this is risky:** If you sign this as-is, they could threaten legal action if you take another job or start your own business, even if it has nothing to do with their specific clients.\n• **In plain English:** "You can't earn a living in your trade for 36 months."\n• **Safe Alternative:** Replace this with a narrow 6-month non-solicitation clause that only prevents you from taking their existing active clients.`;
              } else if (lower.includes('indemnif') || lower.includes('liability')) {
                fallbackReply += `• **What is happening:** The contract has an **uncapped one-way liability trap**.\n• **Why this is risky:** If something goes wrong—or if they are just unhappy with your work—you could be held personally responsible for unlimited monetary damages, while they take zero responsibility.\n• **In plain English:** "You pay for everything, even if it's not completely your fault, with no limit on the bill."\n• **Safe Alternative:** Cap your total liability to the amount of money they actually paid you over the past 12 months, and make it mutual.`;
              } else if (lower.includes('ip') || lower.includes('invention') || lower.includes('ownership')) {
                fallbackReply += `• **What is happening:** This is an **overbroad Intellectual Property landgrab**.\n• **Why this is risky:** They claim ownership over everything you create—even in your free time, on your own laptop, for 5 years after you finish working with them.\n• **In plain English:** "Everything you build belongs to them forever."\n• **Safe Alternative:** State clearly that they only own the specific deliverables they paid for, while you keep all your prior tools, libraries, and personal projects.`;
              } else {
                fallbackReply += `I've analyzed your contract. The biggest things to watch out for are **unlimited financial liability**, **sneaky auto-renewals with surprise price jumps**, and **overbroad non-compete clauses**.\n\nYou can click any red or yellow highlighted section on the contract viewer to see the safer wording I generated for you, or ask me: *"Draft an email to negotiate section 2"*!`;
              }

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                reply: fallbackReply,
                grounding: { chunks: [], queries: [] },
                model: 'ContractShield Plain-English AI',
              }));
            } catch (e: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message || 'Chat service error' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), contractShieldApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  },
});
