
import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../App';
import { RecruitingStatus, SystemRole } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

export const WarRoom: React.FC = () => {
  const { activityLogs, profiles, currentSystemRole, issueBroadcast, addToast } = useApp();
  const [pulse, setPulse] = useState(false);
  const [broadcastInput, setBroadcastInput] = useState('');
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('Uplink Standby...');
  
  // Audio state for Gemini Live
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  // PCM Decoding Utils
  const decodePCM = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const toggleLiveBriefing = async () => {
    if (isLiveActive) {
      sessionRef.current?.close();
      setIsLiveActive(false);
      setLiveTranscript("Strategic Link Terminated.");
      return;
    }

    try {
      addToast("Initializing Neural Synchronization...", "info");
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const inputAudioContext = new AudioContext({ sampleRate: 16000 });
      const outputAudioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;
      outputNodeRef.current = outputAudioContext.createGain();
      outputNodeRef.current.connect(outputAudioContext.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsLiveActive(true);
            setLiveTranscript("LINK ESTABLISHED. Ask Command for scouting insights.");
            
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
              sessionPromise.then(s => s.sendRealtimeInput({
                media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
              }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const pcmData = decodePCM(msg.serverContent.modelTurn.parts[0].inlineData.data);
              const audioBuffer = await decodeAudioData(pcmData, outputAudioContext);
              
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNodeRef.current!);
              
              const startTime = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              source.start(startTime);
              nextStartTimeRef.current = startTime + audioBuffer.duration;
            }

            if (msg.serverContent?.modelTurn?.parts[0]?.text) {
              setLiveTranscript(msg.serverContent.modelTurn.parts[0].text);
            }
          },
          onclose: () => setIsLiveActive(false),
          onerror: (e) => console.error("Live Error", e)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are the IAL Chief of Operations. You assist GMs and Scouts with roster intelligence. You have access to a registry of ${profiles.length} athletes. Be precise, tactical, and brief. Use terms like 'Node Health', 'Strategic Depth', and 'Combine Metrics'.`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } }
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err) {
      console.error("Link failure", err);
      addToast("Uplink Connection Failed", "error");
      setIsLiveActive(false);
    }
  };

  const totalRegistry = profiles.length;
  const activeOffers = profiles.filter(p => p.status === RecruitingStatus.OFFER_EXTENDED).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end border-b-2 border-league-accent pb-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Scouting War Room</h2>
          <p className="text-league-muted uppercase tracking-[0.2em] text-[10px] font-black mt-2 italic flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${pulse ? 'bg-league-accent shadow-[0_0_8px_#e41d24]' : 'bg-red-900'} transition-all`} />
            LIVE OPS FEED • MULTI-NODE TELEMETRY ACTIVE
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={toggleLiveBriefing}
            className={`flex items-center gap-3 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${isLiveActive ? 'bg-league-accent border-league-accent text-white animate-pulse' : 'bg-league-panel border-league-border text-league-muted hover:text-white'}`}
          >
            <span className={`w-2 h-2 rounded-full ${isLiveActive ? 'bg-white' : 'bg-league-accent'}`} />
            {isLiveActive ? 'Link Active' : 'Initialize Command Briefing'}
          </button>
          <GlobalStat label="Registry" val={totalRegistry} />
          <GlobalStat label="Live Offers" val={activeOffers} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px]">
        <div className="lg:col-span-8 flex flex-col gap-8">
           <div className={`bg-league-panel border-4 ${isLiveActive ? 'border-league-ok animate-pulse' : 'border-league-accent'} p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden transition-all duration-500`}>
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              </div>
              <h4 className="text-[10px] font-black uppercase text-league-accent tracking-[0.4em] mb-4 italic">Neural Ops Transcript</h4>
              <div className="text-3xl font-black italic text-white tracking-tighter leading-tight max-w-2xl min-h-[100px]">
                {liveTranscript}
              </div>
           </div>

           <div className="flex-1 bg-league-panel border border-league-border rounded-[3rem] p-10 flex flex-col shadow-2xl overflow-hidden relative">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8 border-b border-league-border pb-4 italic">Operational Activity Stream</h4>
              <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                 {activityLogs.map((log, idx) => (
                   <div key={log.id} className="flex gap-6 animate-in slide-in-from-right-4 duration-500">
                     <div className="flex flex-col items-center"><div className="w-1.5 h-1.5 rounded-full bg-league-accent mb-2" /><div className="w-[1px] flex-1 bg-league-border" /></div>
                     <div className="flex-1 pb-6 border-b border-league-border/30">
                       <div className="flex justify-between items-start mb-2"><span className="text-[8px] font-black uppercase text-league-accent tracking-widest italic">{log.type}</span><span className="text-[7px] font-bold text-league-muted uppercase opacity-40">{new Date(log.timestamp).toLocaleTimeString()}</span></div>
                       <p className="text-xs font-bold italic text-white/90 leading-relaxed">{log.message}</p>
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8 h-full">
           <div className="bg-league-panel border border-league-border rounded-[3rem] p-8 shadow-2xl flex flex-col h-full">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8 border-b border-league-border pb-4 italic">Commission Directives</h4>
              <div className="space-y-4 flex-1">
                 <form onSubmit={(e) => { e.preventDefault(); if (broadcastInput.trim()) issueBroadcast(broadcastInput, 'STANDARD'); setBroadcastInput(''); }} className="space-y-4">
                    <textarea 
                      placeholder="Broadcast command..." 
                      className="w-full bg-league-bg border border-league-border p-4 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-league-accent shadow-inner h-32" 
                      value={broadcastInput} 
                      onChange={(e) => setBroadcastInput(e.target.value)} 
                    />
                    <button type="submit" className="w-full bg-league-accent text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:brightness-110">Transmit Directive</button>
                 </form>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const GlobalStat = ({ label, val }: any) => (
  <div className="text-right"><div className="text-[8px] font-black uppercase text-league-muted tracking-[0.3em] mb-1">{label}</div><div className="text-3xl font-black italic text-white leading-none tracking-tighter">{val}</div></div>
);
