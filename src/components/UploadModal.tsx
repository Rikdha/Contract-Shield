import React, { useState } from 'react';
import { calculateSHA256, parseDocumentClauses, evaluateRulesAgainstClauses } from '../services/contractEngine';
import { extractTextFromFile, isBinaryGibberish } from '../services/documentParserService';
import { ContractDoc, PlaybookRule } from '../types/contract';
import { 
  Upload, 
  X, 
  FileText, 
  CheckCircle2, 
  Lock, 
  Copy, 
  Check, 
  AlertCircle,
  Loader2,
  FileCode,
  FileType
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRules: PlaybookRule[];
  onUploadSuccess: (newContract: ContractDoc) => void;
  uploaderName: string;
  ownerId: number;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  activeRules,
  onUploadSuccess,
  uploaderName,
  ownerId,
}) => {
  const [title, setTitle] = useState('');
  const [filename, setFilename] = useState('');
  const [content, setContent] = useState('');
  const [sha256, setSha256] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [contractType, setContractType] = useState<'MSA' | 'NDA' | 'SLA' | 'EMPLOYMENT' | 'SMART_CONTRACT' | 'VENDOR'>('MSA');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsProcessing(true);
    setFilename(file.name);
    setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
    setProcessingStatus(`Parsing document and extracting readable text from ${file.name}...`);

    try {
      const { text, pageCount } = await extractTextFromFile(file);

      if (!text || text.trim().length === 0) {
        throw new Error('No readable text could be extracted from this document.');
      }

      if (isBinaryGibberish(text)) {
        throw new Error('The extracted content contains unreadable binary data. Please upload a valid text or PDF document.');
      }

      setContent(text);
      setProcessingStatus(`Computing SHA-256 cryptographic verification checksum...`);

      const hash = await calculateSHA256(text);
      setSha256(hash);
      setProcessingStatus('');
    } catch (err: any) {
      console.error('File parsing error:', err);
      setErrorMessage(err.message || 'Failed to extract text from document. Please copy and paste the contract text below.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteChange = async (text: string) => {
    setContent(text);
    setErrorMessage(null);

    if (text.length > 20) {
      const hash = await calculateSHA256(text);
      setSha256(hash);
    }
  };

  const loadSamplePreset = async (presetName: string, sampleText: string, type: any) => {
    setTitle(presetName);
    setFilename(`${presetName.replace(/\s+/g, '_')}.pdf`);
    setContent(sampleText);
    setContractType(type);
    setErrorMessage(null);
    setIsProcessing(true);

    const hash = await calculateSHA256(sampleText);
    setSha256(hash);
    setIsProcessing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !title.trim()) return;

    if (isBinaryGibberish(content)) {
      setErrorMessage('The contract text contains raw binary data. Please paste readable contract text.');
      return;
    }

    const contractId = Date.now();
    const clauses = parseDocumentClauses(content, contractId);
    const { riskScore, riskFlags } = evaluateRulesAgainstClauses(clauses, activeRules);

    const newDoc: ContractDoc = {
      id: contractId,
      title: title.trim(),
      filename: filename.trim() || `${title.replace(/\s+/g, '_')}.pdf`,
      uploaded_by: uploaderName,
      owner_id: ownerId,
      file_size: `${Math.round(content.length / 1024) || 1} KB`,
      uploaded_at: new Date().toISOString(),
      status: riskScore >= 70 ? 'IN_REVIEW' : 'AUDITED',
      risk_score: riskScore,
      sha256: sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      clauses,
      risk_flags: riskFlags,
      version: '1.0',
      contract_type: contractType,
    };

    onUploadSuccess(newDoc);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/45 backdrop-blur-xs animate-in fade-in"
      style={{ fontFamily: "'Times New Roman', Times, 'Newsreader', Georgia, serif" }}
    >
      <div className="bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg max-w-2xl w-full p-6 sm:p-7 shadow-xl space-y-5 text-xs max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ece7dd]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-stone-900 text-[#f6f4ef] flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Ingest New Agreement into Workspace
              </h3>
              <p className="text-xs text-stone-600">
                Parses PDF, Word DOCX, and text agreements with cryptographic checksum verification.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-[#eeebe3] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification if binary or extraction failed */}
        {errorMessage && (
          <div className="p-3.5 rounded bg-rose-50 border border-rose-300 text-rose-950 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-xs text-rose-900">Document Notice:</span>
              <p className="text-xs leading-relaxed text-rose-900">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Picker Drag & Drop Box */}
          <div className="border-2 border-dashed border-[#d8d2c4] hover:border-stone-800 rounded-lg p-6 text-center bg-[#f5f2eb] transition">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer block space-y-2">
              <div className="w-10 h-10 rounded bg-[#fbfaf7] border border-[#d8d2c4] text-stone-800 mx-auto flex items-center justify-center shadow-xs">
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin text-stone-900" />
                ) : (
                  <FileType className="w-5 h-5 text-stone-800" />
                )}
              </div>
              <div>
                <p className="font-bold text-stone-900 text-xs">
                  {isProcessing ? (
                    <span>{processingStatus}</span>
                  ) : filename ? (
                    <span>{filename} (Selected)</span>
                  ) : (
                    <span>Click to browse or drop an agreement (PDF, DOCX, or TXT)</span>
                  )}
                </p>
                <p className="text-[11px] text-stone-500 italic mt-0.5">
                  Automatic clause segmentation · Strips raw binary headers · Computes SHA-256
                </p>
              </div>
            </label>
          </div>

          {/* Quick preset contracts */}
          <div className="space-y-2">
            <div className="text-xs text-stone-700 font-bold">
              <span>Or load an institutional benchmark draft:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadSamplePreset(
                  'Cloud Infrastructure Enterprise MSA',
                  `1. SERVICES AND SCOPE: Provider shall deliver high-performance cloud hosting and managed infrastructure services in accordance with applicable Service Orders.\n\n2. INDEMNIFICATION & UNLIMITED LIABILITY: Customer shall indemnify, defend, and hold harmless Provider, its parent, subsidiaries, officers, and agents against all claims, liabilities, and damages arising from Customer use. Customer liability under this Section shall be UNLIMITED and not subject to any aggregate cap or disclaimer of consequential damages.\n\n3. NON-SOLICITATION AND COMPETITION: Customer agrees that during the term and for thirty-six (36) months thereafter, Customer shall not directly or indirectly engage in, hire, or solicit any personnel or software engineering providers operating in the cloud infrastructure domain globally.\n\n4. INTELLECTUAL PROPERTY RIGHTS: Provider irrevocably assigns to Customer all customized deliverables. However, Customer hereby assigns to Provider all rights, title, and ownership in any feedback, custom configurations, or derivative software authored during the term and for three years thereafter.\n\n5. PAYMENT AND WITHHOLDING: Invoices are due within fifteen (15) days. Provider reserves the sole right to suspend service and withhold data access in the event of any payment dispute.\n\n6. TERM AND AUTOMATIC RENEWAL: This Agreement shall automatically renew for successive terms of twenty-four (24) months unless terminated by certified postal mail at least ninety (90) days prior to the expiration date. Rates shall escalate by twenty-five percent (25%) upon renewal.\n\n7. GOVERNING LAW AND ARBITRATION: Any controversy shall be resolved exclusively through binding individual arbitration administered in the Cayman Islands under local commercial rules.`,
                  'MSA'
                )}
                className="px-3 py-1.5 rounded bg-[#f5f2eb] border border-[#d8d2c4] text-xs text-stone-800 hover:text-stone-900 hover:bg-[#ede8df] transition font-bold"
              >
                Sample MSA (Uncapped Indemnity & Auto-Renewal)
              </button>

              <button
                type="button"
                onClick={() => loadSamplePreset(
                  'Senior Executive Employment Agreement',
                  `1. POSITION AND DUTIES: Executive agrees to serve as Vice President of Engineering and devote full business time and best efforts to the business of the Corporation.\n\n2. RESTRICTIVE COVENANTS AND WORLDWIDE NON-COMPETE: Executive acknowledges that Corporation business is global. For a period of thirty-six (36) months following termination of employment for any reason, Executive shall not directly or indirectly engage in, advise, invest in, or work for any software, fintech, or technology enterprise globally.\n\n3. ASSIGNMENT OF INVENTIONS: Executive hereby irrevocably assigns to Corporation all right, title, and interest in and to all inventions, patents, code, and proprietary workflows, regardless of whether created during working hours or using personal equipment, and for five (5) years thereafter.\n\n4. ARBITRATION AND JURY WAIVER: Any disputes shall be submitted to confidential individual arbitration. Executive unconditionally waives any right to a jury trial or class action proceeding.`,
                  'EMPLOYMENT'
                )}
                className="px-3 py-1.5 rounded bg-[#f5f2eb] border border-[#d8d2c4] text-xs text-stone-800 hover:text-stone-900 hover:bg-[#ede8df] transition font-bold"
              >
                Sample Employment (Worldwide Non-Compete)
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800">
                Agreement Title:
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Acme Enterprise Services Agreement"
                className="w-full bg-[#f5f2eb] text-xs text-stone-900 px-3 py-2 rounded border border-[#d8d2c4] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800">
                Contract Category:
              </label>
              <select
                value={contractType}
                onChange={e => setContractType(e.target.value as any)}
                className="w-full bg-[#f5f2eb] text-xs text-stone-900 px-3 py-2 rounded border border-[#d8d2c4] focus:outline-hidden font-bold"
              >
                <option value="MSA">MSA (Master Services Agreement)</option>
                <option value="NDA">NDA (Non-Disclosure Agreement)</option>
                <option value="SLA">SLA (Service Level Agreement)</option>
                <option value="EMPLOYMENT">Employment Agreement</option>
                <option value="VENDOR">Vendor / Supplier Agreement</option>
                <option value="SMART_CONTRACT">Web3 Smart Contract</option>
              </select>
            </div>
          </div>

          {/* Contract Content Textarea */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-stone-800">
                Contract Content (Clauses):
              </label>
              <span className="text-stone-500 font-mono text-[11px]">
                {content.length} characters · ~{Math.max(1, content.split(/\n\s*\n/).filter(p => p.length > 25).length)} clauses
              </span>
            </div>
            <textarea
              required
              rows={8}
              value={content}
              onChange={e => handlePasteChange(e.target.value)}
              placeholder="Paste contract clauses here, or select a PDF / Word document above..."
              className="w-full bg-[#f5f2eb] font-serif text-xs leading-relaxed text-stone-900 px-3.5 py-2.5 rounded border border-[#d8d2c4] focus:outline-hidden"
            />
          </div>

          {/* Cryptographic SHA-256 Preview */}
          {sha256 && (
            <div className="p-3 rounded bg-[#f5f2eb] border border-[#d8d2c4] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 truncate">
                <Lock className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                <span className="text-stone-600 font-bold">SHA-256:</span>
                <span className="font-mono text-stone-900 truncate max-w-sm" title={sha256}>
                  {sha256}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sha256);
                  setCopiedHash(true);
                  setTimeout(() => setCopiedHash(false), 2000);
                }}
                className="text-stone-600 hover:text-stone-900 shrink-0 ml-2 font-bold"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#ece7dd]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-[#fbfaf7] border border-[#dfd9cd] text-stone-700 hover:bg-[#ede8df] transition text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !content.trim() || !title.trim()}
              className="px-5 py-2 rounded bg-stone-900 hover:bg-stone-800 text-[#f6f4ef] font-bold text-xs transition disabled:opacity-50 flex items-center space-x-2 shadow-xs"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Execute Compliance Audit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
