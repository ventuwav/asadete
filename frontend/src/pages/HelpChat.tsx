import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import Grill from '../components/Grill';
import { api } from '../lib/api';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const QUICK_QUESTIONS = [
  '¿Cómo funciona asaDeTe?',
  '¿Cómo liquido el asado?',
  '¿Qué es el alias?',
  '¿Cómo marco un pago?',
];

export default function HelpChat() {
  const { shareToken } = useParams<{ shareToken?: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: ({ message, history }: { message: string; history: Message[] }) =>
      api.chat.send(message, history),
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        { role: 'model', text: data.response },
      ]);
    },
    onError: () => {
      setMessages(prev => [
        ...prev,
        { role: 'model', text: 'Uy, algo salió mal. Intentá de nuevo en un momento.' },
      ]);
    },
  });

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    sendMutation.mutate({ message: trimmed, history: messages });
  }

  return (
    <div className="min-h-screen bg-[#fcf8f7] flex flex-col font-body text-[#1f1a17]">
      <header className="flex items-center gap-3 px-6 pt-[max(1.5rem,env(safe-area-inset-top,1.5rem))] pb-4 border-b border-[#e8ded8]">
        <button
          onClick={() => shareToken ? navigate(`/e/${shareToken}`) : navigate('/')}
          className="w-9 h-9 rounded-full bg-[#f2ece9] flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#f5e4df] flex items-center justify-center">
            <Grill size={16} className="text-[#b83a0a]" fill="#b83a0a" />
          </div>
          <div>
            <p className="text-[13px] font-heading font-bold leading-tight">Asistente asaDeTe</p>
            <p className="text-[10px] text-[#7a706b]">Preguntame lo que necesites</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 pb-36">
        {messages.length === 0 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f5e4df] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Grill size={14} className="text-[#b83a0a]" fill="#b83a0a" />
              </div>
              <div className="bg-white rounded-[1.25rem] rounded-tl-sm px-4 py-3 shadow-sm border border-[#e8ded8] max-w-[80%]">
                <p className="text-[13px] leading-relaxed">¡Hola! Soy el asistente de asaDeTe. ¿En qué te puedo ayudar?</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pl-11">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-[11px] font-bold px-3 py-2 rounded-full border border-[#e8ded8] bg-white text-[#b83a0a] hover:bg-[#f5e4df] transition-colors active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {m.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-[#f5e4df] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Grill size={14} className="text-[#b83a0a]" fill="#b83a0a" />
              </div>
            )}
            <div
              className={`px-4 py-3 rounded-[1.25rem] max-w-[80%] text-[13px] leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'bg-[#b83a0a] text-white rounded-tr-sm'
                  : 'bg-white border border-[#e8ded8] rounded-tl-sm text-[#1f1a17]'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {sendMutation.isPending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f5e4df] flex items-center justify-center flex-shrink-0">
              <Grill size={14} className="text-[#b83a0a]" fill="#b83a0a" />
            </div>
            <div className="bg-white border border-[#e8ded8] rounded-[1.25rem] rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-[#b83a0a]/40 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-[#b83a0a]/40 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-[#b83a0a]/40 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#fcf8f7] border-t border-[#e8ded8] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))]">
        <div className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Escribí tu pregunta..."
            className="flex-1 bg-white border border-[#e8ded8] rounded-[1.25rem] px-4 py-3 text-[13px] outline-none focus:border-[#b83a0a] transition-colors"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || sendMutation.isPending}
            className="w-11 h-11 rounded-full bg-[#b83a0a] text-white flex items-center justify-center disabled:opacity-40 transition-opacity active:scale-95 flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
