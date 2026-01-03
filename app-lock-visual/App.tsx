import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LOCK_MODELS, TRANSLATIONS, UI_CONFIG } from './constants';
import { AppStatus, LockModel } from './types';

const App: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'bm' | 'cn'>('en');
  const [selectedLock, setSelectedLock] = useState<LockModel>(LOCK_MODELS[0]);
  const [doorImage, setDoorImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang];

  // Reducing resolution even further to 640px to combat the 429 "Busy" error.
  // Smaller payloads process faster and avoid hitting aggressive rate/bandwidth limits.
  const compressImage = (base64Str: string, maxWidth: number = 640): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }
        // Lowering quality slightly to 0.7 for smaller file size
        resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
      };
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setDoorImage(reader.result as string);
        setResultImage(null);
        setStatus(AppStatus.IDLE);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `iris-smartlock-preview.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generate = async () => {
    if (!doorImage) {
      setError(t.uploadFirst);
      return;
    }
    setStatus(AppStatus.GENERATING);
    setError(null);
    try {
      // 1. Compress main door image to 640px
      const compressedDoorB64 = await compressImage(doorImage, 640);
      
      // 2. Fetch and compress the selected lock image to a small reference size
      const lockResp = await fetch(selectedLock.imageUrl);
      const lockBlob = await lockResp.blob();
      const lockOriginalB64 = await new Promise<string>(res => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(lockBlob);
      });
      const compressedLockB64 = await compressImage(lockOriginalB64, 300);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      // Using gemini-2.5-flash-image with a very concise instruction to speed up generation
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: compressedDoorB64, mimeType: 'image/jpeg' } },
            { inlineData: { data: compressedLockB64, mimeType: 'image/jpeg' } },
            { text: "Replace the handle on this door with the smart lock from the second image. Match the scale and perspective. Output only the result image." }
          ]
        }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setResultImage(`data:image/jpeg;base64,${part.inlineData.data}`);
        setStatus(AppStatus.SUCCESS);
      } else {
        throw new Error("No output from AI");
      }
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      if (err.message?.includes('429')) {
        setError(t.quotaError);
      } else {
        setError(`${t.error} (${err.message?.substring(0, 30)}...)`);
      }
      setStatus(AppStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <nav className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
             <i className="fas fa-microchip text-white text-sm"></i>
           </div>
           <h1 className="font-black text-xl tracking-tighter">IRIS.MY <span className="text-blue-600">AI</span></h1>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(['en', 'bm', 'cn'] as const).map(l => (
            <button 
              key={l} 
              onClick={() => setLang(l)} 
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === l ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        <div className="flex flex-col gap-6">
          {/* Step 1: Upload */}
          <section className="bg-gray-50 rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
              {t.step1}
            </h2>
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="group relative h-52 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all overflow-hidden"
            >
              {doorImage ? (
                <>
                  <img src={doorImage} className="h-full w-full object-contain" alt="User door" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-black uppercase tracking-widest">
                    {t.changePhoto}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-camera text-xl text-gray-300"></i>
                  </div>
                  <p className="text-gray-400 text-sm px-4 font-bold">{t.step1Hint}</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
            
            <div className="mt-4 p-3 bg-white/50 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 flex items-start gap-2 leading-relaxed">
                <i className="fas fa-shield-halved text-blue-400 mt-0.5"></i>
                {t.privacyNotice}
              </p>
            </div>
          </section>

          {/* Step 2: Lock Selector */}
          <section className="bg-gray-50 rounded-3xl p-6 border border-gray-100 shadow-sm flex-1 flex flex-col">
            <h2 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                 <i className="fas fa-fingerprint text-[8px]"></i>
              </span>
              {t.step2}
            </h2>
            
            <div className="flex-1 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-2">
                {LOCK_MODELS.map(lock => (
                  <button 
                    key={lock.id} 
                    onClick={() => setSelectedLock(lock)} 
                    className={`p-3 rounded-2xl border-2 transition-all bg-white relative group flex flex-col items-center gap-2 ${selectedLock.id === lock.id ? 'border-blue-600 shadow-md ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md'}`}
                  >
                    <div className="h-20 w-full flex items-center justify-center">
                      <img src={lock.imageUrl} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500" alt={lock.name} />
                    </div>
                    <p className="text-[10px] font-black text-gray-700 text-center leading-tight uppercase tracking-tighter">{lock.name}</p>
                    {selectedLock.id === lock.id && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                        <i className="fas fa-check text-[8px]"></i>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3">
            <button 
              onClick={generate} 
              disabled={status === AppStatus.GENERATING} 
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-gray-300 disabled:shadow-none relative overflow-hidden group"
            >
              {status === AppStatus.GENERATING ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-circle-notch animate-spin"></i>
                  {t.generating}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                   <i className="fas fa-wand-sparkles text-sm group-hover:rotate-12 transition-transform"></i>
                   {t.generateBtn}
                </span>
              )}
            </button>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-3">
                  <i className="fas fa-triangle-exclamation text-red-500 mt-0.5"></i>
                  <p className="text-red-600 text-[11px] font-bold leading-tight">{error}</p>
                </div>
                <button 
                  onClick={generate} 
                  className="w-full py-2 bg-red-100 text-red-600 text-[10px] font-black rounded-xl hover:bg-red-200 transition-colors uppercase tracking-widest"
                >
                  {t.retryBtn}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Result Canvas */}
        <section className="flex flex-col gap-4 h-full">
          <div className="bg-gray-900 rounded-[3rem] p-4 lg:p-8 shadow-2xl flex-1 flex flex-col min-h-[560px] border-4 border-gray-800 relative overflow-hidden">
            {/* Glossy Reflection */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
            
            <header className="flex justify-between items-center mb-6 px-4 relative z-10">
              <span className="text-white/30 text-[10px] font-black tracking-[0.2em] uppercase">{t.canvasTitle}</span>
              {status === AppStatus.SUCCESS && (
                <button 
                  onClick={handleDownload}
                  className="bg-white/10 hover:bg-blue-600 text-white py-2 px-5 rounded-full transition-all flex items-center gap-2 group border border-white/10"
                >
                   <i className="fas fa-download text-xs group-hover:animate-bounce"></i>
                   <span className="text-[10px] font-black uppercase tracking-widest">{t.downloadBtn}</span>
                </button>
              )}
            </header>
            
            <div className="flex-1 bg-black rounded-[2rem] overflow-hidden relative border border-white/5 flex items-center justify-center group shadow-inner z-10">
              {resultImage ? (
                <img src={resultImage} className="w-full h-full object-contain animate-in fade-in zoom-in-95 duration-1000" alt="Result" />
              ) : status === AppStatus.GENERATING ? (
                <div className="text-center px-8">
                  <div className="relative w-20 h-20 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-2 border-blue-400/20 border-b-transparent rounded-full animate-spin-reverse"></div>
                  </div>
                  <p className="text-white font-black text-2xl mb-2 tracking-tight">{t.generating}</p>
                  <p className="text-blue-400 text-[11px] font-bold tracking-wider animate-pulse uppercase">{t.generatingSub}</p>
                </div>
              ) : (
                <div className="text-center p-12">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 group-hover:border-blue-500/30 transition-all duration-700">
                    <i className="fas fa-wand-magic-sparkles text-4xl text-white/5 group-hover:text-blue-500/20 transition-all"></i>
                  </div>
                  <p className="text-white/20 text-[11px] font-black max-w-[180px] mx-auto leading-relaxed uppercase tracking-[0.2em]">{t.canvasEmpty}</p>
                </div>
              )}
            </div>
            
            <footer className="mt-8 bg-white/5 backdrop-blur-3xl p-5 rounded-3xl border border-white/10 flex gap-4 items-center z-10">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center shrink-0 border border-blue-500/10">
                <i className="fas fa-robot text-blue-400 text-sm"></i>
              </div>
              <p className="text-[10px] text-white/40 leading-normal italic font-medium">
                {lang === 'cn' ? UI_CONFIG.disclaimer.textCN : lang === 'bm' ? UI_CONFIG.disclaimer.textBM : UI_CONFIG.disclaimer.textEN}
              </p>
            </footer>
          </div>
        </section>
      </main>

      <footer className="mt-auto p-12 text-center border-t border-gray-50 bg-gray-50/30">
        <p className="text-[10px] text-gray-300 font-black tracking-[0.4em] uppercase mb-4">© 2024 IRIS.MY SMART TECHNOLOGY SOLUTIONS</p>
        <div className="flex justify-center gap-8 text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
           <span className="hover:text-blue-600 cursor-pointer transition-colors">Safety</span>
           <span className="hover:text-blue-600 cursor-pointer transition-colors">Privacy</span>
           <span className="hover:text-blue-600 cursor-pointer transition-colors">Support</span>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }
      `}} />
    </div>
  );
};

export default App;
