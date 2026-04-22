'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabaseClient';

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

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }) + ' EDT');
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Realtime chat from Supabase (bulletproofed)
  useEffect(() => {
    let mounted = true;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      if (data && mounted) setChatMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          if (mounted) {
            setChatMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    await supabase.from('messages').insert({ username: 'Visitor', message: chatInput.trim() });
    setChatInput('');
  };

  const sendAIMessage = async () => {
    if (!aiInput.trim()) return;
    const userMsg = { role: 'user', content: aiInput };
    setAiMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/ask-grok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiInput }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'AI response unavailable.';
      setAiMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setAiMessages((prev) => [...prev, { role: 'assistant', content: 'Error connecting to AI.' }]);
    }
    setAiInput('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl font-black tracking-tighter">N</div>
            <h1 className="text-4xl font-bold tracking-[-2px]">NEXUS NEWS</h1>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-lg font-medium">
            <button onClick={() => setCurrentRoom(0)} className={currentRoom === 0 ? 'text-cyan-400' : 'hover:text-cyan-400'}>SUMMARY</button>
            <button onClick={() => setCurrentRoom(1)} className={currentRoom === 1 ? 'text-cyan-400' : 'hover:text-cyan-400'}>WAR ROOM</button>
            <button onClick={() => setCurrentRoom(2)} className={currentRoom === 2 ? 'text-cyan-400' : 'hover:text-cyan-400'}>PRESS ROOM</button>
            <button onClick={() => setCurrentRoom(3)} className={currentRoom === 3 ? 'text-cyan-400' : 'hover:text-cyan-400'}>CONSPIRACY ROOM</button>
            <button onClick={() => setCurrentRoom(4)} className={currentRoom === 4 ? 'text-cyan-400' : 'hover:text-cyan-400'}>MARKET MOVERS</button>
          </nav>

          <div className="flex gap-4">
            <button
              onClick={() => setShowAI(true)}
              className="px-7 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl font-semibold hover:scale-105 transition"
            >
              ASK AI
            </button>
            <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-3xl text-sm transition">🔗 Link X Account</button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-8 py-12">
        {/* SUMMARY ROOM */}
        {currentRoom === 0 && (
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-8">LIVE GLOBAL SUMMARY • <span className="text-cyan-400 font-mono">{liveTime}</span></h2>
            <div className="bg-slate-900 rounded-3xl p-12 border border-slate-700 max-w-4xl mx-auto text-lg leading-relaxed">
              Cross-referenced satellite thermal data, X geolocated posts, and major feeds. Escalation signals detected. Oil markets reacting to shipping disruptions. 
              <div className="mt-10 border-l-4 border-cyan-400 pl-8 text-cyan-300">
                NEXUS AI: 214 sources verified. Core facts stable. Narrative divergence noted on recent drone activity.
              </div>
            </div>
          </div>
        )}

        {/* WAR ROOM */}
        {currentRoom === 1 && (
          <div>
            <h2 className="text-4xl font-bold mb-8">WAR ROOM • Real-Time Threat Intelligence</h2>
            <div className="bg-slate-900 rounded-3xl p-4 border border-slate-700 h-[520px]">
              <MapContainer center={[48.5, 32]} zoom={5} className="h-full w-full rounded-2xl">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[50.45, 30.52]}>
                  <Popup>Kyiv • High-threat zone • X-confirmed activity</Popup>
                </Marker>
              </MapContainer>
            </div>
            <p className="text-center mt-6 text-slate-400">Threat zones, flight & shipping data will expand here with real APIs.</p>
          </div>
        )}

        {/* PRESS ROOM */}
        {currentRoom === 2 && (
          <div>
            <h2 className="text-4xl font-bold mb-8">PRESS ROOM • Raw Feeds + AI Analysis</h2>
            <div className="bg-slate-900 rounded-3xl p-10 text-center text-slate-400">
              Press feeds and X political ticker coming soon (ready for X API integration).
            </div>
          </div>
        )}

        {/* CONSPIRACY ROOM */}
        {currentRoom === 3 && (
          <div>
            <h2 className="text-4xl font-bold mb-8">CONSPIRACY ROOM • Open Discussion</h2>
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4">
                <h3 className="text-purple-400 mb-6 text-xl">TRENDING CONSPIRACIES</h3>
                <div className="space-y-5">
                  <div className="bg-slate-900 p-6 rounded-3xl">🌐 Global Digital ID Rollout (18,942 discussions)</div>
                  <div className="bg-slate-900 p-6 rounded-3xl">🛰️ Satellite Surveillance Grid (14,221)</div>
                  <div className="bg-slate-900 p-6 rounded-3xl">💉 mRNA Long-Term Data (9,874)</div>
                </div>
              </div>
              <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-8 border border-purple-500/30">
                <h3 className="text-purple-400 mb-6">LIVE CHAT ROOM</h3>
                <div className="h-96 overflow-y-auto bg-black/40 rounded-2xl p-6 space-y-4 mb-6" id="chat">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="text-sm">
                      <span className="text-purple-400 font-medium">{msg.username || 'Visitor'}:</span> {msg.message}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Drop your theory or evidence..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-3xl px-6 py-4 focus:outline-none"
                  />
                  <button onClick={sendChatMessage} className="bg-purple-600 hover:bg-purple-700 px-10 rounded-3xl font-semibold">POST</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MARKET MOVERS */}
        {currentRoom === 4 && (
          <div>
            <h2 className="text-4xl font-bold mb-10">MARKET MOVERS • AI-Powered Signals</h2>
            <div className="grid md:grid-cols-5 gap-6">
              <div className="bg-slate-900 rounded-3xl p-8 text-center border border-amber-400/30">
                OIL<br /><span className="text-5xl font-bold text-amber-400">XOM +3.1%</span>
              </div>
              <div className="bg-slate-900 rounded-3xl p-8 text-center border border-cyan-400/30">
                TECH<br /><span className="text-5xl font-bold text-cyan-400">NVDA +2.4%</span>
              </div>
              <div className="bg-slate-900 rounded-3xl p-8 text-center border border-red-400/30">
                WAR<br /><span className="text-5xl font-bold text-red-400">LMT +4.2%</span>
              </div>
              <div className="bg-slate-900 rounded-3xl p-8 text-center">
                BTC<br /><span className="text-5xl font-bold">$68,420</span>
              </div>
              <div className="bg-slate-900 rounded-3xl p-8 text-center">
                ETH<br /><span className="text-5xl font-bold text-emerald-400">+5.8%</span>
              </div>
            </div>
            <div className="mt-12 text-center text-slate-400">AI predictions update live here (expand with Polygon.io later).</div>
          </div>
        )}
      </div>

      {/* Ask AI Modal */}
      {showAI && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center" onClick={() => setShowAI(false)}>
          <div className="bg-slate-900 w-full max-w-2xl rounded-3xl p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold">Ask NEXUS AI • Instant Fact Check</h3>
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
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendAIMessage()}
                placeholder="Paste any claim or headline..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-3xl px-7 py-5 text-lg focus:outline-none"
              />
              <button onClick={sendAIMessage} className="bg-gradient-to-r from-cyan-500 to-purple-600 px-12 rounded-3xl font-bold">VERIFY</button>
            </div>
            <p className="text-center text-xs text-slate-500 mt-6">Powered by your Grok API key • Secure backend proxy</p>
          </div>
        </div>
      )}
    </div>
  );
}
