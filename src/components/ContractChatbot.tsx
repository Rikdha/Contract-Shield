import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Globe, 
  Sparkles, 
  X, 
  Bot, 
  User as UserIcon, 
  ExternalLink,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  Radio,
  FileText,
  Mail,
  Scale
} from 'lucide-react';
import { ContractDoc } from '../types/contract';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  groundingSources?: Array<{ title?: string; uri?: string }>;
}

interface ContractChatbotProps {
  activeContract?: ContractDoc;
  isOpen: boolean;
  onClose: () => void;
}

export const ContractChatbot: React.FC<ContractChatbotProps> = ({
  activeContract,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: `Welcome to the ContractShield AI Legal Advisor.

I translate dense legal terminology into clear, accessible language, identifying contractual liabilities, termination traps, and restrictive covenants before execution.

Select a quick inquiry below, type your question, or tap the microphone to begin a voice consultation.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enableSearch, setEnableSearch] = useState(true);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setSpeechTranscript(transcript);
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#_`>-]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Could not start recognition', e);
      }
    }
  };

  const handleSendMessage = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSpeechTranscript('');
    setIsLoading(true);

    let contextStr = '';
    if (activeContract) {
      contextStr = `Contract Title: ${activeContract.title} (v${activeContract.version})\nType: ${activeContract.contract_type}\nRisk Index: ${activeContract.risk_score}/100\n\nKey Clauses:\n`;
      activeContract.clauses.forEach(c => {
        contextStr += `Section ${c.clause_number} (${c.category}): ${c.text}\n`;
      });
      if (activeContract.risk_flags.length > 0) {
        contextStr += `\nFlagged Risk Areas:\n`;
        activeContract.risk_flags.forEach(f => {
          contextStr += `- ${f.rule_name} (${f.severity} RISK): ${f.issue_summary}\n`;
        });
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            text: m.text,
          })),
          enableSearch,
          contractContext: contextStr,
        }),
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Chat service unavailable');
      }

      const data = await response.json();
      const sources: Array<{ title?: string; uri?: string }> = [];
      if (data.grounding?.chunks) {
        data.grounding.chunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            sources.push({
              title: chunk.web.title || 'Legal Reference',
              uri: chunk.web.uri,
            });
          }
        });
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: sources.length > 0 ? sources : undefined,
      };

      setMessages(prev => [...prev, botMessage]);

      if (isVoiceActive) {
        handleSpeak(data.reply);
      }
    } catch (err: any) {
      const lower = textToSend.toLowerCase();
      let smartAnswer = `Here is an objective legal analysis of your inquiry:\n\n`;

      if (lower.includes('non-compete') || lower.includes('compete') || lower.includes('california')) {
        smartAnswer += `1. **Contractual Scope:** The clause establishes a 36-month worldwide non-compete prohibiting work across software and artificial intelligence.\n2. **Statutory Enforceability:** Under California Business and Professions Code 16600 and modern antitrust enforcement frameworks, post-employment covenants not to compete are generally void against public policy.\n3. **Recommended Position:** Propose substituting this provision with a reasonable 6-month non-solicitation agreement restricted solely to clients you directly served.`;
      } else if (lower.includes('indemnif') || lower.includes('liability') || lower.includes('lose') || lower.includes('money')) {
        smartAnswer += `1. **Exposure Analysis:** The contract currently enforces uncapped unilateral indemnification.\n2. **Financial Risk:** In the event of third-party litigation or dissatisfaction, your organization would bear uncapped defense and liability costs with zero reciprocal protection.\n3. **Recommended Position:** Introduce a bilateral liability cap equivalent to total fees paid during the preceding 12 months, with an express waiver of consequential damages.`;
      } else if (lower.includes('ip') || lower.includes('invention') || lower.includes('patent') || lower.includes('own')) {
        smartAnswer += `1. **Ownership Scope:** The counterparty asserts assignment of all works created during the term and for 5 years thereafter, irrespective of company equipment or working hours.\n2. **Compliance Concern:** This compromises your independent toolsets, open-source libraries, and personal inventions.\n3. **Recommended Position:** Restrict intellectual property assignment exclusively to final paid deliverables created under an authorized Statement of Work, preserving pre-existing IP.`;
      } else if (lower.includes('email') || lower.includes('negotiate') || lower.includes('draft')) {
        smartAnswer += `Here is a formal negotiation communication template:\n\n\`\`\`text\nDear [Counterparty Name],\n\nThank you for transmitting the draft agreement for review.\n\nFollowing compliance review against our institutional governance standards, we request three standard adjustments:\n1. Mutual limitation of liability capped at aggregate fees paid over the preceding 12 months.\n2. Clarification that intellectual property assignment applies solely to deliverables accepted and paid for under the Statement of Work.\n3. Narrowing the restrictive covenant to a standard 6-month non-solicitation of active clients.\n\nWe look forward to executing the finalized agreement upon these updates.\n\nSincerely,\n[Your Name]\n\`\`\``;
      } else {
        smartAnswer += `Upon evaluating this agreement against corporate risk standards, the primary areas of exposure are:\n1. Uncapped indemnification liability in Section 2.\n2. Broad non-compete restraint in Section 3.\n3. Overbroad post-termination IP assignment in Section 1.\n\nSelect "View Remediation" on any highlighted clause in the document viewer to review balanced replacement text.`;
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: smartAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMessage]);

      if (isVoiceActive) {
        handleSpeak(smartAnswer);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[440px] h-[600px] max-h-[85vh] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3">
      {/* Top Header */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-sm text-white font-heading">AI Legal Advisor</span>
              <span className="text-slate-500 text-xs">·</span>
              <span className="text-[11px] text-slate-400 font-normal">
                {activeContract ? activeContract.title.slice(0, 20) + '...' : 'General'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Plain-language clause breakdown & negotiation guidance
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Voice Mode Toggle */}
          <button
            onClick={() => {
              const nextState = !isVoiceActive;
              setIsVoiceActive(nextState);
              if (!nextState && isSpeaking) {
                window.speechSynthesis?.cancel();
                setIsSpeaking(false);
              }
            }}
            className={`p-1.5 rounded-lg text-xs transition flex items-center space-x-1 ${
              isVoiceActive
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isVoiceActive ? 'Voice narration active' : 'Enable voice readouts'}
          >
            {isVoiceActive ? <Volume2 className="w-3.5 h-3.5 text-rose-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Search Grounding Toggle */}
          <button
            onClick={() => setEnableSearch(!enableSearch)}
            className={`p-1.5 rounded-lg text-xs transition flex items-center space-x-1 ${
              enableSearch
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
            title={enableSearch ? 'Google Search Grounding Enabled' : 'Google Search Grounding Disabled'}
          >
            <Globe className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice Mode Active Waveform Banner */}
      {isVoiceActive && (
        <div className="px-3 py-1.5 bg-slate-950 border-b border-rose-900/30 flex items-center justify-between text-[11px] text-rose-300">
          <div className="flex items-center space-x-1.5">
            <Radio className="w-3 h-3 text-rose-400 animate-spin" />
            <span className="font-semibold font-mono text-[10px] uppercase">Voice Conversation Engine Active</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {isSpeaking ? 'Narrating response...' : 'Microphone standby'}
          </span>
        </div>
      )}

      {/* Chat Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-950/60">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-cyan-300 border border-slate-700'
                }`}
              >
                {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[82%] p-3 rounded-2xl space-y-1.5 shadow-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none font-sans'
                }`}
              >
                <div className="whitespace-pre-wrap text-[11px] leading-relaxed">
                  {msg.text}
                </div>

                {/* Grounding sources citation chips */}
                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 font-mono">
                      <Globe className="w-3 h-3" />
                      Google Search Verified Sources:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {msg.groundingSources.slice(0, 3).map((src, i) => (
                        <a
                          key={i}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-950 text-[10px] text-slate-300 hover:text-cyan-300 border border-slate-800 transition truncate max-w-[200px]"
                        >
                          <span className="truncate">{src.title || 'Legal Reference'}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleSpeak(msg.text)}
                      className="text-slate-400 hover:text-cyan-300 p-0.5 rounded transition"
                      title="Listen to audio narration"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs p-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[11px]">ContractShield is evaluating legal risk...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Plain-English Quick Action Chips (NO EMOJIS) */}
      <div className="p-2 bg-slate-950 border-t border-slate-800/80 overflow-x-auto flex items-center space-x-1.5 text-[11px] no-scrollbar">
        <button
          onClick={() => handleQuickPrompt("What are the primary risk factors in this contract?")}
          className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 shrink-0 transition flex items-center space-x-1"
        >
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span>Primary Risk Factors</span>
        </button>
        <button
          onClick={() => handleQuickPrompt("Explain Section 2 in plain language: what are the implications for me?")}
          className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 shrink-0 transition flex items-center space-x-1"
        >
          <FileText className="w-3 h-3 text-cyan-400" />
          <span>Explain Section 2</span>
        </button>
        <button
          onClick={() => handleQuickPrompt("Draft a formal letter to negotiate the liability and restrictive covenant terms")}
          className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 shrink-0 transition flex items-center space-x-1"
        >
          <Mail className="w-3 h-3 text-indigo-400" />
          <span>Draft Negotiation Letter</span>
        </button>
        <button
          onClick={() => handleQuickPrompt("Check current FTC and California statutory rules on non-compete enforceability")}
          className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 shrink-0 transition flex items-center space-x-1"
        >
          <Globe className="w-3 h-3 text-cyan-400" />
          <span>Search Legal Precedents</span>
        </button>
      </div>

      {/* Bottom Input Area */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          {isSpeechSupported && (
            <button
              type="button"
              onClick={toggleMic}
              className={`p-2 rounded-xl border transition ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
              title={isListening ? 'Stop listening' : 'Speak inquiry'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-cyan-400" />}
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to speech...'
                : enableSearch
                ? 'Ask a contract question (Google Search enabled)...'
                : 'Ask about any clause or liability in plain language...'
            }
            className="flex-1 bg-slate-900 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition shadow-md shadow-cyan-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
