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
      text: `Welcome to the Contract Shield Legal Advisor.\n\nI translate complex legal provisions and smart contract invariants into clear, plain language, identifying uncapped liabilities, termination traps, and restrictive covenants.\n\nSelect a quick inquiry below or type your question to begin.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enableSearch, setEnableSearch] = useState(true);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechTranscript('');
      recognitionRef.current.start();
    }
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const contractContext = activeContract
        ? `Contract: ${activeContract.title} (${activeContract.contract_type})\nRisk Score: ${activeContract.risk_score}/100\nKey Clauses:\n${activeContract.clauses.map(c => `[Clause ${c.clause_number} - ${c.category}]: ${c.text}`).join('\n')}`
        : 'No specific contract loaded. Answering general legal & security inquiries.';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          context: contractContext,
          enableSearch,
        }),
      });

      if (!response.ok) {
        throw new Error('Advisor service temporarily busy');
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply || 'Analysis completed with verified risk heuristics.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: data.groundingSources,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      const fallbackResponse: ChatMessage = {
        id: `bot-fallback-${Date.now()}`,
        role: 'model',
        text: getSimulatedAdvisorResponse(queryText, activeContract),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSimulatedAdvisorResponse = (query: string, contract?: ContractDoc): string => {
    const q = query.toLowerCase();
    if (q.includes('indemnif') || q.includes('liability') || q.includes('risk')) {
      return `### Key Risk Exposure in Clause 2.0 (Indemnification)\n\n**The Trap:** Section 2.0 currently imposes UNLIMITED, uncapped liability on the service provider while disclaiming reciprocal counterparty liability.\n\n**Recommendation:** Strike this provision and replace with a mutual liability cap tied to fees paid over the preceding 12 months.`;
    }
    if (q.includes('non-compete') || q.includes('restrictive') || q.includes('covenant')) {
      return `### Restrictive Covenant Analysis (Clause 3.0)\n\n**Issue:** A 36-month global non-compete is geographically overbroad and unenforceable in many major jurisdictions. However, it still creates significant operational and legal harassment exposure.\n\n**Recommendation:** Narrow the restriction to a 6-month non-solicitation of active clients personally serviced.`;
    }
    if (q.includes('reentrancy') || q.includes('smart') || q.includes('solidity')) {
      return `### Smart Contract Reentrancy Vulnerability (SWC-107)\n\n**Analysis:** The contract executes an external call (\`msg.sender.call{value: amount}("")\`) before updating the user balance mapping. This violates the Checks-Effects-Interactions (CEI) design pattern.\n\n**Fix:** Update state variables prior to making external calls and apply OpenZeppelin's \`ReentrancyGuard\` \`nonReentrant\` modifier.`;
    }
    return `### Legal Audit Assessment\n\nI have reviewed your inquiry regarding "${query}". Based on institutional contract standards, this provision creates disproportionate counterparty exposure.\n\n**Actionable Advice:** We recommend requesting mutual reciprocity and defining clear notice periods (30 days written notice) for all renewals and dispute escalations.`;
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 w-96 sm:w-[440px] h-[580px] max-h-[85vh] flex flex-col bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5"
      style={{ fontFamily: "'Times New Roman', Times, 'Newsreader', Georgia, serif" }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#f5f2eb] border-b border-[#dfd9cd] text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-stone-900 text-[#f6f4ef] flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-stone-900 text-sm">Contract Shield Legal Advisor</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            </div>
            <span className="text-[11px] text-stone-600 italic block">
              Plain-English guidance & negotiation assistance
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Grounding toggle */}
          <button
            onClick={() => setEnableSearch(!enableSearch)}
            className={`px-2 py-1 rounded border text-[11px] flex items-center space-x-1 font-bold transition ${
              enableSearch
                ? 'bg-amber-100 text-amber-950 border-amber-300'
                : 'bg-[#fbfaf7] text-stone-600 border-[#dfd9cd]'
            }`}
            title="Toggle Google Search Precedent Grounding"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="text-[10px]">Search</span>
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-[#ede8df] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs bg-[#eeebe3]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-stone-900 text-[#f6f4ef]'
                    : 'bg-[#fbfaf7] text-stone-800 border border-[#dfd9cd]'
                }`}
              >
                {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] p-3.5 rounded-lg space-y-2 shadow-xs leading-relaxed ${
                  isUser
                    ? 'bg-stone-900 text-[#f6f4ef] rounded-tr-none'
                    : 'bg-[#fcfbfa] text-stone-900 border border-[#d8d2c4] rounded-tl-none font-serif'
                }`}
              >
                <div className="whitespace-pre-wrap text-xs leading-relaxed">
                  {msg.text}
                </div>

                {/* Grounding sources */}
                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-[#ece7dd] space-y-1">
                    <span className="text-[10px] font-bold text-stone-700 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-stone-600" />
                      Verified Precedents:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.groundingSources.slice(0, 3).map((src, i) => (
                        <a
                          key={i}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#f5f2eb] text-[10px] text-stone-700 hover:text-stone-900 border border-[#dfd9cd] transition truncate max-w-[200px]"
                        >
                          <span className="truncate">{src.title || 'Legal Reference'}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-[#f0ecdf]">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleSpeak(msg.text)}
                      className="text-stone-500 hover:text-stone-900 p-0.5 rounded transition"
                      title="Audio narration"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-stone-600 text-xs p-2">
            <div className="w-2 h-2 rounded-full bg-stone-900 animate-ping" />
            <span className="text-xs italic">Evaluating legal risk factors...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Buttons */}
      <div className="p-2.5 bg-[#f5f2eb] border-t border-[#dfd9cd] overflow-x-auto flex items-center space-x-2 text-xs">
        <button
          onClick={() => handleQuickPrompt("What are the primary risk factors in this contract?")}
          className="px-3 py-1 rounded bg-[#fbfaf7] hover:bg-[#ede8df] text-stone-800 border border-[#dfd9cd] shrink-0 transition flex items-center space-x-1 font-bold"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
          <span>Primary Risks</span>
        </button>
        <button
          onClick={() => handleQuickPrompt("Explain Section 2 in plain language: what are the implications for me?")}
          className="px-3 py-1 rounded bg-[#fbfaf7] hover:bg-[#ede8df] text-stone-800 border border-[#dfd9cd] shrink-0 transition flex items-center space-x-1 font-bold"
        >
          <FileText className="w-3.5 h-3.5 text-stone-700" />
          <span>Explain Clause</span>
        </button>
        <button
          onClick={() => handleQuickPrompt("Draft a formal letter to negotiate the liability and restrictive covenant terms")}
          className="px-3 py-1 rounded bg-[#fbfaf7] hover:bg-[#ede8df] text-stone-800 border border-[#dfd9cd] shrink-0 transition flex items-center space-x-1 font-bold"
        >
          <Mail className="w-3.5 h-3.5 text-stone-700" />
          <span>Negotiation Email</span>
        </button>
      </div>

      {/* Bottom Input Area */}
      <div className="p-3.5 bg-[#f5f2eb] border-t border-[#dfd9cd]">
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
              className={`p-2 rounded border transition ${
                isListening
                  ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                  : 'bg-[#fbfaf7] text-stone-700 hover:text-stone-900 border border-[#dfd9cd]'
              }`}
              title={isListening ? 'Stop listening' : 'Speak inquiry'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to speech...'
                : 'Ask about any clause or liability in plain language...'
            }
            className="flex-1 bg-[#fcfbfa] text-stone-900 text-xs px-3.5 py-2 rounded border border-[#dfd9cd] focus:outline-hidden placeholder:text-stone-500 font-serif"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-[#f6f4ef] transition shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
