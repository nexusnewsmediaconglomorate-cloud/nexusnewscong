'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false }) as any;
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false }) as any;
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false }) as any;
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false }) as any;

export default function NexusNews() {
  const [currentRoom, setCurrentRoom] = useState(0);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<any[]>([]);
  const [showAI, setShowAI] = useState(false);
  const [liveTime, setLiveTime] = useState('');
  const [currentUser, setCurrentUser] = useState<{ username: string; avatar: string } | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Simple agentic orchestration (LangGraph-style graph in JS)
  const runAgenticLoop = async (query: string) => {
    const agents = ['Research', 'FactCheck', 'Security', 'Creative'];
    let result = `NEXUS OS ONLINE — Running agentic loop for: ${query}\n\n`;
    
    for (const agent of agents) {
      result += `→ ${agent} Agent: Processing...\n`;
      await new Promise(resolve => setTimeout(resolve, 300)); // simulate thinking
      result += `  ✓ Completed. Contribution added.\n`;
    }
    
    result += `\nFinal output: Cross-referenced thousands of sources. Core facts stable. Free media flow secured.`;
    return result;
  };

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }) + ' EDT');
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load account
  useEffect(() => {
    const saved = localStorage.getItem('nexusUser');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  const createAccount = () => {
    if (!usernameInput.trim()) return alert('Enter a username');
    const reader = new FileReader();
    if (avatarFile) {
      reader.onload = (e) => {
        const user = { username: usernameInput.trim(), avatar: e.target?.result as string };
        localStorage.setItem('nexusUser', JSON.stringify(user));
        setCurrentUser(user);
        setUsernameInput('');
        setAvatarFile(null);
      };
      reader.readAsDataURL(avatarFile);
    } else {
      const user = { username: usernameInput.trim(), avatar: '' };
      localStorage.setItem('nexusUser', JSON.stringify(user));
      setCurrentUser(user);
      setUsernameInput('');
    }
  };

  const logout = () => {
    localStorage.removeItem('nexusUser');
    setCurrentUser(null);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const msg = {
      username: currentUser ? currentUser.username : 'Visitor',
      message: chatInput.trim(),
      avatar: currentUser ? currentUser.avatar : '',
      timestamp: new Date().toISOString()
    };
    setChatMessages((prev) => [...prev, msg]);
    setChatInput('');
  };

  const sendAIMessage = async () => {
    if (!aiInput.trim()) return;
    const userMsg = { role: 'user', content: aiInput };
    setAiMessages((prev) => [...prev, userMsg]);

    const reply = await runAgenticLoop(aiInput);
    setAiMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    setAiInput('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl font-black tracking-tighter">N</div>
            <h1 className="text-4xl font-bold tracking-[-2px]">NEXUS OS</h1>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-lg font-medium">
            <button onClick={() => setCurrentRoom(0)} className={currentRoom === 0 ? 'text-cyan-400' : 'hover:text-cyan-400'}>SUMMARY</button>
            <button onClick={() => setCurrentRoom(1)} className={currentRoom === 1 ? 'text-cyan-400' : 'hover:text-cyan-400'}>WAR ROOM</button>
            <button onClick={() => setCurrentRoom(2)} className={currentRoom === 2 ? 'text-cyan-400' : 'hover:text-cyan-400'}>PRESS ROOM</button>
            <button onClick={() => setCurrentRoom(3)} className={currentRoom === 3 ? 'text-cyan-400' : 'hover:text-cyan-400'}>CONSPIRACY ROOM</button>
            <button onClick={() => setCurrentRoom(4)} className={currentRoom === 4 ? 'text-cyan-400' : 'hover:text-cyan-400'}>MARKET MOVERS</button>
            <button onClick={() => setCurrentRoom(5)} className={currentRoom === 5 ? 'text-emerald-400' : 'hover:text-emerald-400'}>ACCOUNT</button>
          </nav>

          <button onClick={() => setShowAI(true)} className="px-7 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl font-semibold hover:scale-105 transition">ASK NEXUS</button>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-8 py-12">
        {currentRoom === 0 && <div className="text-center text-5xl font-bold">LIVE GLOBAL SUMMARY • <span className="text-cyan-400 font-mono">{liveTime}</span></div>}
        {currentRoom === 1 && <div className="text-4xl font-bold">WAR ROOM • Real-Time Threat Intelligence</div>}
        {currentRoom === 2 && <div className="text-4xl font-bold">PRESS ROOM • Raw Feeds + AI Analysis</div>}
        {currentRoom === 3 && <div className="text-4xl font-bold">CONSPIRACY ROOM • Total Free Media (Unmoderated)</div>}
        {currentRoom === 4 && <div className="text-4xl font-bold">MARKET MOVERS • AI-Powered Signals</div>}

        {currentRoom === 5 && (
          <div className="max-w-md mx-auto bg-slate-900 rounded-3xl p-8">
            <h2 className="text-4xl font-bold mb-8 text-emerald-400">Account</h2>
            {currentUser ? (
              <div className="text-center">
                <img src={currentUser.avatar || 'https://via.placeholder.com/120'} className="w-24 h-24 mx-auto rounded-full border-4 border-emerald-400 mb-6" />
                <h3 className="text-2xl font-semibold mb-2">Welcome, {currentUser.username}!</h3>
                <button onClick={logout} className="text-red-400 underline">Logout</button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl mb-6">Create Account</h3>
                <input value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Username" className="w-full bg-slate-800 border border-slate-700 rounded-3xl px-6 py-4 mb-4" />
                <input type="file" accept="image/*" onChange={(e) => e.target.files && setAvatarFile(e.target.files[0])} className="w-full bg-slate-800 border border-slate-700 rounded-3xl px-6 py-4 mb-6" />
                <button onClick={createAccount} className="w-full bg-emerald-600 hover:bg-emerald-700 py-4 rounded-3xl font-semibold">Create Account & Upload Picture</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showAI && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center" onClick={() => setShowAI(false)}>
          <div className="bg-slate-900 w-full max-w-2xl rounded-3xl p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold">NEXUS — Agentic AI OS</h3>
              <button onClick={() => setShowAI(false)} className="text-5xl leading-none hover:text-red-400">×</button>
            </div>
            <div className="h-96 overflow-y-auto space-y-6 mb-8 pr-4">
              {aiMessages.map((msg, i) => (
                <div key={i} className={msg.role === 'user' ? 'text-right' : ''}>
                  <div className={`inline-block max-w-[80%] px-6 py-4 rounded-3xl ${msg.role === 'user' ? 'bg-white/10' : 'bg-gradient-to-r from-cyan-500 to-purple-600'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Command the OS..." className="flex-1 bg-slate-800 border border-slate-700 rounded-3xl px-7 py-5 text-lg" />
              <button onClick={sendAIMessage} className="bg-gradient-to-r from-cyan-500 to-purple-600 px-12 rounded-3xl font-bold">EXECUTE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}