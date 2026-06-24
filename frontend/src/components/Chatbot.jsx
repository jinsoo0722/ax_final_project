import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, RefreshCw, AlertCircle } from 'lucide-react';

export default function Chatbot({ employeeId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState('');
  const messagesEndRef = useRef(null);

  // Initial welcome message
  useEffect(() => {
    if (!employeeId) return;
    
    // Clear and set welcome message
    setMessages([
      {
        sender: 'bot',
        text: `안녕하세요! **HR AX 컨설턴트**입니다. 
지금부터 **${employeeId}** 직원의 데이터를 바탕으로 퇴사 방지 전략 상담을 시작합니다.

어떤 정보가 필요하신가요? 아래 추천 질문을 누르시거나 직접 질문해 주십시오.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [employeeId]);

  // Scroll to bottom when messages or typing status updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, currentTypingText]);

  // Basic Markdown Parser to HTML
  const parseMarkdown = (text) => {
    if (!text) return '';
    let html = text;

    // Escape HTML first to prevent XSS
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code Blocks (```lang ... ```)
    html = html.replace(/```(markdown|json|html|css|javascript)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
      return `<pre><code>${code.trim()}</code></pre>`;
    });

    // Inline code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers (### Header)
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

    // Bold (**text**)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Tables
    // Search for markdown tables and replace with HTML tables
    const tableRegex = /\|([^\n]+)\|\r?\n\|[ :-|\n]+\n((?:\|[^\n]+\|\r?\n?)*)/g;
    html = html.replace(tableRegex, (match, headerRow, bodyRows) => {
      const headers = headerRow.split('|').map(h => h.trim()).filter(h => h);
      const headerHtml = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
      
      const rows = bodyRows.split('\n').filter(r => r.trim());
      const bodyHtml = rows.map(row => {
        const cells = row.split('|').map(c => c.trim()).filter(c => c);
        // Ignore separator row if caught
        if (cells.every(c => c.includes('---') || c.includes(':---'))) return '';
        return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
      }).join('');

      return `<table><thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody></table>`;
    });

    // Bullet Lists (- or * item)
    html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>');
    // Wrap lists (very primitive wrapper, but looks fine if items are contiguous)
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

    // Line breaks
    html = html.replace(/\n/g, '<br/>');

    return html;
  };

  // Typing effect simulation
  const simulateStreamingText = (fullText, callback) => {
    let index = 0;
    setCurrentTypingText('');
    
    // We type chunk of characters or word by word
    const interval = setInterval(() => {
      if (index < fullText.length) {
        // Grab next character or word
        const chunk = fullText.slice(0, index + 3); // Type 3 characters at a time for speed
        setCurrentTypingText(chunk);
        index += 3;
      } else {
        clearInterval(interval);
        setCurrentTypingText('');
        callback(fullText);
      }
    }, 15); // Fast typing speed
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      // Build chat history from state
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      // Fetch mock API from FastAPI backend
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employee_id: employeeId,
          message: query,
          chat_history: history
        })
      });

      if (!res.ok) throw new Error('상담 결과를 받아오지 못했습니다.');
      const data = await res.json();
      
      setIsThinking(false);
      
      // Simulate streaming the response
      simulateStreamingText(data.reply, (finalText) => {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: finalText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      });

    } catch (err) {
      setIsThinking(false);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: `⚠️ 에러가 발생했습니다: ${err.message}. 잠시 후 다시 시도해주십시오.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const suggestedPrompts = [
    "유지(Retention) 대안책 제안해줘",
    "야근 줄여주면 퇴사를 막을 수 있을까?",
    "연봉 인상 효과 검토해줘",
    "면담 제안 이메일 작성해줘"
  ];

  return (
    <div className="chatbot-container animate-fade-in">
      
      {/* Header */}
      <div className="chat-header">
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-primary)' }}>
          <Bot size={18} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>AX HR Consultant</h4>
          <span style={{ fontSize: '0.75rem', color: '#38ef7d', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38ef7d', display: 'inline-block' }}></span>
            {employeeId} 컨텍스트 동기화 완료
          </span>
        </div>
        <button 
          onClick={onClose} 
          className="btn btn-secondary" 
          style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '0.75rem', border: 'none' }}
        >
          상담 닫기
        </button>
      </div>

      {/* Messages area */}
      <div className="chat-messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-bubble ${m.sender}`}>
            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(m.text) }} />
            <div style={{ 
              fontSize: '0.7rem', 
              color: m.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', 
              textAlign: m.sender === 'user' ? 'right' : 'left',
              marginTop: '8px'
            }}>
              {m.timestamp}
            </div>
          </div>
        ))}

        {/* Streaming Text display */}
        {currentTypingText && (
          <div className="chat-bubble bot">
            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(currentTypingText) }} />
            <span className="blinking-cursor">|</span>
          </div>
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="chat-bubble bot" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>AI가 분석 중입니다</span>
            <div className="thinking-dots">
              <div className="thinking-dot"></div>
              <div className="thinking-dot"></div>
              <div className="thinking-dot"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form area */}
      <div className="chat-input-area-wrapper" style={{ padding: '0 20px 20px 20px', background: 'rgba(0,0,0,0.2)' }}>
        {/* Suggested Prompts */}
        <div className="chat-suggested-prompts">
          {suggestedPrompts.map((p, idx) => (
            <button 
              key={idx} 
              onClick={() => handleSend(p)}
              disabled={isThinking || !!currentTypingText}
              className="suggested-btn"
            >
              {p}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <input 
            type="text" 
            className="chat-input" 
            placeholder="AI에게 솔루션 제안 요청..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isThinking || !!currentTypingText}
          />
          <button 
            onClick={() => handleSend()} 
            className="chat-send-btn"
            disabled={isThinking || !!currentTypingText}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Styling for Blinking Cursor */}
      <style>{`
        .blinking-cursor {
          font-weight: 700;
          color: var(--color-primary);
          animation: blink 0.8s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>

    </div>
  );
}
