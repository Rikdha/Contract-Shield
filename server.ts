import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper to get fallback suggestions if Gemini API is unavailable or offline
function getFallbackSuggestions(category: string, ruleName: string, clauseText: string) {
  const cat = (category || '').toLowerCase();
  const rule = (ruleName || '').toLowerCase();

  if (cat.includes('indemnif') || cat.includes('liability') || rule.includes('indemnif')) {
    return [
      {
        id: 'opt-1',
        title: 'Option 1: Mutual Liability Cap (Market Standard)',
        posture: 'Mutual Compromise',
        explanation: 'Caps liability symmetrically for both parties at 12 months fees, disclaiming all consequential and punitive damages.',
        text: 'Each party’s aggregate cumulative liability arising out of or related to this Agreement shall be strictly capped at the total fees actually paid or payable by Company to Contractor in the twelve (12) months preceding the claim. In no event shall either party be liable for any indirect, special, incidental, or consequential damages.',
      },
      {
        id: 'opt-2',
        title: 'Option 2: Signer-Protective Safe Harbor',
        posture: 'Maximum Signer Protection',
        explanation: 'Excludes contractor liability entirely except for willful intentional misconduct, with Company assuming full indemnity for project use.',
        text: 'Contractor shall have no liability to Company or any third party for any damages, losses, or claims arising from the deliverables, except in cases of proven intentional gross misconduct. Company agrees to indemnify and hold harmless Contractor against all third-party claims arising from Company’s use of the deliverables.',
      },
      {
        id: 'opt-3',
        title: 'Option 3: Fixed Dollar Ceiling with Carve-Outs',
        posture: 'Targeted Exposure Limit',
        explanation: 'Fixes total exposure at a predictable flat dollar amount ($10,000 or contract sum) with clear notice and cure requirements.',
        text: 'Notwithstanding anything to the contrary, Contractor’s total liability for all claims arising under this Agreement shall not exceed the lesser of $10,000 or the total contract compensation received. Any indemnification claim is contingent upon Company providing prompt written notice within thirty (30) days.',
      },
    ];
  }

  if (cat.includes('restrictive') || cat.includes('compete') || rule.includes('compete')) {
    return [
      {
        id: 'opt-1',
        title: 'Option 1: Narrow Client Non-Solicit (6 Months)',
        posture: 'Mutual Compromise',
        explanation: 'Strikes out the broad industry ban and replaces it with a reasonable 6-month non-solicitation of directly served clients.',
        text: 'For a period of six (6) months following termination of this Agreement, Contractor shall not directly solicit the business of any active client of Company whom Contractor personally and substantially provided services to during the engagement. No general restriction on software engineering or consulting shall apply.',
      },
      {
        id: 'opt-2',
        title: 'Option 2: Complete Deletion / Right-to-Work Clause',
        posture: 'Maximum Signer Protection',
        explanation: 'Affirms signer’s unencumbered right to practice their profession without restriction, in line with California Bus. & Prof. Code § 16600.',
        text: 'The parties acknowledge and agree that Contractor retains the complete and unrestricted right to provide services, seek employment, and operate in any industry or geographic region without restriction. Any non-competition covenant is hereby struck and void.',
      },
      {
        id: 'opt-3',
        title: 'Option 3: Paid Garden Leave / Standstill Stanza',
        posture: 'Compensated Standstill',
        explanation: 'Allows non-compete only if the client pays 100% full monthly compensation during the restricted standstill duration.',
        text: 'Any covenant not to compete shall apply solely for a maximum duration of three (3) months and shall be contingent upon Company paying Contractor 100% of the average monthly contract compensation for each month of the restriction period.',
      },
    ];
  }

  if (cat.includes('intellectual') || cat.includes('ip') || rule.includes('ip') || rule.includes('inventions')) {
    return [
      {
        id: 'opt-1',
        title: 'Option 1: Deliverables-Only Transfer with Tool Retainer',
        posture: 'Mutual Compromise',
        explanation: 'Assigns final customized deliverables to the client while explicitly retaining pre-existing tools, libraries, and independent works.',
        text: 'Company shall exclusively own all final custom deliverables created and paid for pursuant to an authorized Statement of Work. Contractor exclusively retains all right, title, and interest in all pre-existing tools, codebases, frameworks, utilities, and independently authored materials.',
      },
      {
        id: 'opt-2',
        title: 'Option 2: Non-Exclusive Commercial License',
        posture: 'Maximum Signer Protection',
        explanation: 'Contractor retains ultimate IP ownership and grants the company a perpetual, royalty-free commercial usage license.',
        text: 'Contractor retains full intellectual property ownership of all software and materials created. Subject to payment in full, Contractor grants Company a perpetual, worldwide, non-exclusive, royalty-free license to use, modify, and deploy the deliverables for internal business operations.',
      },
      {
        id: 'opt-3',
        title: 'Option 3: Strict On-Hours & Company Equipment Boundary',
        posture: 'Personal Boundary Carve-Out',
        explanation: 'Strictly limits IP transfer to items created exclusively during paid client hours using client equipment.',
        text: 'Ownership assignments shall apply exclusively to inventions conceived solely during working hours, using Company-provided equipment, and directly related to Company’s current proprietary software. Contractor retains full title to all independent off-hours works.',
      },
    ];
  }

  if (cat.includes('renew') || cat.includes('term') || rule.includes('renew')) {
    return [
      {
        id: 'opt-1',
        title: 'Option 1: Month-to-Month with 30-Day Email Notice',
        posture: 'Mutual Compromise',
        explanation: 'Eliminates multi-year lock-in and allows standard 30-day written email cancellation.',
        text: 'Following the initial term, this Agreement shall automatically renew on a month-to-month basis unless either party provides thirty (30) days advance written email notice of non-renewal. Renewal rates shall not increase by more than the annual CPI (capped at 3%).',
      },
      {
        id: 'opt-2',
        title: 'Option 2: Active Confirmation Required (No Auto-Renew)',
        posture: 'Maximum Signer Protection',
        explanation: 'Requires affirmative mutual written execution before any contract term can be extended.',
        text: 'This Agreement shall expire at the conclusion of the initial term unless the parties mutually agree in writing to an extension at least thirty (30) days prior to expiration. There shall be no automatic renewal under any circumstances.',
      },
      {
        id: 'opt-3',
        title: 'Option 3: Convenience Termination with Pro-Rata Refund',
        posture: 'Flexibility with Refund',
        explanation: 'Allows termination at any time for convenience with immediate pro-rated fee refund.',
        text: 'Either party may terminate this Agreement at any time with or without cause upon forty-five (45) days written notice. In the event of early termination, Customer shall receive a prompt pro-rated refund of all pre-paid unearned fees.',
      },
    ];
  }

  // General default fallback options
  return [
    {
      id: 'opt-1',
      title: 'Option 1: Bilateral Mutual Protection (Standard)',
      posture: 'Mutual Compromise',
      explanation: 'Converts one-sided stipulations into equal, balanced obligations for both parties.',
      text: 'The obligations in this Section shall apply mutually and equally to both parties. Neither party shall be subject to unilateral discretion, unmitigated exposure, or unreciprocated indemnities without equal protection.',
    },
    {
      id: 'opt-2',
      title: 'Option 2: Strict Notice & Cure Safe Harbor',
      posture: 'Due Process Safeguard',
      explanation: 'Requires 30 days written notice with mandatory cure opportunity before any penalty can be assessed.',
      text: 'Prior to exercising any remedy, withholding, or claim under this Section, the non-breaching party must provide thirty (30) days detailed written notice specifying the deficiency, and provide thirty (30) days to cure such breach in good faith.',
    },
    {
      id: 'opt-3',
      title: 'Option 3: Balanced Neutral Commercial Wording',
      posture: 'Narrowed Exposure',
      explanation: 'Restricts scope to direct documented damages under governing commercial laws.',
      text: 'Any rights or remedies under this Section shall be strictly limited to direct, documented damages and governed by standard commercial equity principles without punitive penalties or unilateral forfeiture.',
    },
  ];
}

// POST: /api/remediation-suggestions
app.post('/api/remediation-suggestions', async (req, res) => {
  const { clauseText, category, ruleName, issueSummary } = req.body;

  if (!clauseText) {
    return res.status(400).json({ error: 'clauseText is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Return high quality deterministic fallback
    const suggestions = getFallbackSuggestions(category, ruleName, clauseText);
    return res.json({ suggestions, source: 'fallback_engine' });
  }

  try {
    const ai = new GoogleGenAI({});
    const prompt = `You are an elite corporate legal counsel and contract negotiation expert.
A high-risk clause was flagged in an agreement:
- Category: ${category || 'General'}
- Rule Flagged: ${ruleName || 'High Risk'}
- Risk Summary: ${issueSummary || 'Unbalanced legal exposure'}

Original Flagged Clause:
"""
${clauseText}
"""

Please draft 3 distinct, professional alternative replacement clauses for one-click remediation.
Each option should represent a distinct commercial negotiation posture:
1. Option 1: Balanced & Mutual Compromise (market standard, fair to both sides)
2. Option 2: Signer-Protective (minimizes signer/contractor liability and risk)
3. Option 3: Scope-Restricted / Narrowed Exception (tightens scope, duration, or adds carve-outs)

Respond ONLY with valid JSON in this exact structure:
{
  "suggestions": [
    {
      "id": "opt-1",
      "title": "Option 1: [Short Descriptive Title]",
      "posture": "Mutual Compromise",
      "explanation": "[1-2 sentence explanation of why this is better]",
      "text": "[The complete replacement legal clause ready to drop into contract]"
    },
    {
      "id": "opt-2",
      "title": "Option 2: [Short Descriptive Title]",
      "posture": "Signer Protective",
      "explanation": "[1-2 sentence explanation of why this is better]",
      "text": "[The complete replacement legal clause ready to drop into contract]"
    },
    {
      "id": "opt-3",
      "title": "Option 3: [Short Descriptive Title]",
      "posture": "Narrowed Scope",
      "explanation": "[1-2 sentence explanation of why this is better]",
      "text": "[The complete replacement legal clause ready to drop into contract]"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '';
    const parsed = JSON.parse(outputText);

    if (parsed.suggestions && Array.isArray(parsed.suggestions) && parsed.suggestions.length >= 3) {
      return res.json({ suggestions: parsed.suggestions, source: 'gemini_ai' });
    }

    throw new Error('Invalid format returned by AI');
  } catch (err: any) {
    console.warn('Gemini API call failed, falling back to rule engine:', err?.message || err);
    const suggestions = getFallbackSuggestions(category, ruleName, clauseText);
    return res.json({ suggestions, source: 'fallback_engine' });
  }
});

// POST: /api/audit
app.post('/api/audit', async (req, res) => {
  const { code, contractType, title } = req.body || {};
  const docType = contractType === 'legal_contract' ? 'legal_contract' : 'smart_contract';
  const docTitle = title || (docType === 'smart_contract' ? 'Smart Contract' : 'Legal Agreement');

  if (!code) {
    return res.status(400).json({ error: 'Code or document text is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // 204 allows client-side deterministic analyzer to execute seamlessly
    return res.status(204).end();
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const prompt = `You are Contract Shield, an elite contract auditor and friendly legal advisor.
Explain everything in simple, everyday language that non-lawyers and non-technical founders understand.
Audit the following ${docType === 'smart_contract' ? 'Smart Contract code' : 'Legal Agreement text'}.
Contract Title: "${docTitle}"
Document Content:
\`\`\`
${code.slice(0, 20000)}
\`\`\`

Perform an exhaustive security and risk audit. Explain every issue simply. Return a strictly structured JSON response.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const rawText = response.text || '';
    const result = JSON.parse(rawText.trim());

    return res.json({ success: true, report: result, provider: 'gemini-3.8-flash' });
  } catch (geminiError: any) {
    console.warn('Gemini audit API call failed, falling back to client engine:', geminiError?.message);
    return res.status(204).end();
  }
});

// POST: /api/chat
app.post('/api/chat', async (req, res) => {
  const { messages, enableSearch, contractContext, query, context } = req.body || {};
  const activeContext = contractContext || context || '';
  const latestUserMsg = query || (messages && messages.length > 0 ? messages[messages.length - 1]?.text : '') || '';

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const formattedContents = messages && messages.length > 0 
        ? messages.map((m: any) => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.text }],
          }))
        : [{ role: 'user', parts: [{ text: latestUserMsg }] }];

      const systemInstruction = `You are ContractShield AI, an empathetic, expert contract advisor and legal companion.
Your primary mission is to protect regular people, freelancers, students, and startup founders from predatory legal and smart contract clauses.
CRITICAL COMMUNICATION GUIDELINES:
1. Explain everything in simple, everyday language. Never use dense legalese or technical acronyms without instantly translating them into plain English.
2. If explaining a clause, always tell the user: "What this really means for you" and "How to protect yourself / What to ask for instead".
3. Be reassuring, friendly, warm, and practical.
4. When Google Search is enabled, incorporate the latest legal standards, court precedents, and official consumer protection regulations.

${activeContext ? `\nACTIVE CONTRACT CONTEXT:\n${activeContext.slice(0, 10000)}` : ''}`;

      const tools: any[] = [];
      if (enableSearch) {
        tools.push({ googleSearch: {} });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
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

      const groundingSources = groundingChunks.map((c: any) => ({
        title: c.web?.title || 'Legal Reference',
        uri: c.web?.uri,
      })).filter((s: any) => Boolean(s.uri));

      return res.json({
        success: true,
        reply: replyText,
        grounding: { chunks: groundingChunks, queries: webSearchQueries },
        groundingSources,
        model: 'gemini-3.8-flash',
      });
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
    fallbackReply += `I've analyzed your contract. The biggest things to watch out for are **unlimited financial liability**, **sneaky auto-renewals with surprise price jumps**, and **overbroad non-compete clauses**.\n\nYou can click any highlighted section on the contract viewer to see the safer wording I generated for you, or ask me: *"Draft an email to negotiate section 2"*!`;
  }

  return res.json({
    success: true,
    reply: fallbackReply,
    grounding: { chunks: [], queries: [] },
    model: 'ContractShield Plain-English AI',
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
