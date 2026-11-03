import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FolderPlus,
  RefreshCw,
  FolderGit2,
  Layers,
  ArrowRight,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { Project, AiChatMessage, WsmProposalData } from '../../types';
import { sendAiChatMessage, generateWsmFromProblem, analyzeProjectResultsWithAi } from '../../services/ai';

interface Props {
  projects: Project[];
  activeProject: Project | null;
  hasAiKey: boolean;
  onApplyAiProposal: (proposal: WsmProposalData) => void;
}

const QUICK_PROMPTS = [
  'Đề xuất phương án & tiêu chí chọn phần mềm ERP cho doanh nghiệp sản xuất cơ khí',
  'Lựa chọn nhà cung cấp dịch vụ Điện toán đám mây (AWS vs Azure vs Google Cloud)',
  'Phân bổ trọng số lựa chọn đối tác vận chuyển Logistics cho sàn thương mại điện tử',
  'Gợi ý tiêu chí đánh giá tuyển dụng Giám đốc Kinh doanh (CCO) cấp cao',
];

export const AiAssistantSection: React.FC<Props> = ({
  projects,
  activeProject,
  hasAiKey,
  onApplyAiProposal,
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Xin chào! Tôi là Trợ lý AI Cố vấn Ra Quyết định (Decision Advisor).
Tôi có thể hỗ trợ bạn:
• Phân tích tình huống và xác định mục tiêu ra quyết định.
• Đề xuất các phương án tối ưu để so sánh.
• Xây dựng bộ tiêu chí đánh giá chuẩn hóa kèm trọng số (đảm bảo tổng 100%).
• Phân tích độ nhạy và tư vấn kết quả sau khi bạn chấm điểm.

Bạn đang gặp bài toán ra quyết định nào trong doanh nghiệp của mình?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachContext, setAttachContext] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewProposal, setPreviewProposal] = useState<WsmProposalData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    setErrorMsg(null);
    const userMsg: AiChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const projectContext = attachContext && activeProject ? {
        projectName: activeProject.name,
        businessName: activeProject.businessName,
        domain: activeProject.domain,
        problemDescription: activeProject.problemDescription,
        options: activeProject.options.map((o) => o.name),
        criteria: activeProject.criteria.map((c) => ({ name: c.name, weight: c.weight })),
        status: activeProject.status,
      } : null;

      // Call real backend Gemini API
      const result = await sendAiChatMessage(
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        projectContext
      );

      const aiMsg: AiChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.reply,
        proposal: result.proposal,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (result.proposal) {
        setPreviewProposal(result.proposal);
      }
    } catch (err: any) {
      console.error('AI chat error:', err);
      setErrorMsg(err.message || 'Không thể kết nối với dịch vụ AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeActiveProject = async () => {
    if (!activeProject || isLoading) return;
    const prompt = `Hãy phân tích chuyên sâu dự án hiện tại "${activeProject.name}" (Lĩnh vực: ${activeProject.domain}). Đánh giá tính cân bằng của các tiêu chí và trọng số, sau đó gợi ý xem có cần bổ sung phương án hoặc điều chỉnh tỷ trọng nào không.`;
    handleSendMessage(prompt);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* API Key Banner if offline or missing */}
      {!hasAiKey && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong className="font-semibold block mb-0.5">Lưu ý cấu hình Gemini API Key:</strong>
            Hiện hệ thống chưa nhận diện biến môi trường <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-950 font-bold">GEMINI_API_KEY</code>.
            Trợ lý AI sử dụng API thực sự thông qua máy chủ backend. Bạn hãy thêm khóa API Gemini trong tệp <code className="font-mono">.env</code> hoặc Secrets panel để trò chuyện thực tế.
          </div>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-[75vh]">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-xs">Trợ lý Cố vấn Quyết định AI</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Phân tích tình huống · Gợi ý ma trận WSM · Tự động cân đối 100%
              </p>
            </div>
          </div>

          {activeProject && (
            <div className="flex items-center gap-2">
              <label className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attachContext}
                  onChange={(e) => setAttachContext(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-[11px]">Đính kèm ngữ cảnh dự án: <strong className="text-slate-800">{activeProject.name.slice(0, 20)}...</strong></span>
              </label>

              <button
                type="button"
                onClick={handleAnalyzeActiveProject}
                disabled={isLoading}
                className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                title="Yêu cầu AI đánh giá dự án đang chọn"
              >
                <SlidersHorizontal className="w-3 h-3 text-blue-600" />
                <span className="hidden md:inline">Phân tích dự án hiện tại</span>
              </button>
            </div>
          )}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-xl p-4 text-xs leading-relaxed space-y-2.5 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Proposal Action Card embedded directly in chat response */}
                {msg.proposal && (
                  <div className="mt-3 p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2 text-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-900 flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Đề xuất Ma trận WSM khả thi
                      </span>
                      <span className="text-[10px] text-blue-700 font-mono">
                        {msg.proposal.domain}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-700 space-y-1">
                      <p>
                        <strong>Tên dự án:</strong> {msg.proposal.projectTitle}
                      </p>
                      <p>
                        <strong>Phương án đề xuất ({msg.proposal.options.length}):</strong>{' '}
                        {msg.proposal.options.join(', ')}
                      </p>
                      <div>
                        <strong>Tiêu chí & Trọng số ({msg.proposal.criteria.length}):</strong>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {msg.proposal.criteria.map((c, i) => (
                            <span
                              key={i}
                              className="inline-block px-2 py-0.5 bg-white border border-blue-200 rounded text-[11px] text-slate-700"
                            >
                              {c.name}: <strong className="text-blue-700">{c.weight}%</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onApplyAiProposal(msg.proposal!)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>Áp dụng vào dự án WSM</span>
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] text-right font-mono ${
                    msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-slate-500">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span>AI đang phân tích vấn đề và tính toán trọng số WSM...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  className="block mt-1 font-semibold text-red-800 underline"
                >
                  Thử gửi lại
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap">
            Gợi ý nhanh:
          </span>
          {QUICK_PROMPTS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              disabled={isLoading}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tình huống doanh nghiệp đang gặp phải (ví dụ: Chọn phần mềm HRM cho công ty 200 nhân sự)..."
              className="flex-1 text-xs border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-800 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <span>Gửi</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
