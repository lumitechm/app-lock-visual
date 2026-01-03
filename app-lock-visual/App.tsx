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
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang];

  // Using 512px for maximum stability against 429 "Busy" errors.
  const compressImage = (base64Str: string, maxWidth: number = 512): Promise<string> => {
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
        resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
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
    link.download = `iris-ai-preview.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  const generate = async (attempt: number = 0) => {
    if (!doorImage) {
      setError(t.uploadFirst);
      return;
    }

    setRetryCount(attempt);
    setStatus(AppStatus.GENERATING);
    setError(null);

    try {
      const compressedDoorB64 = await compressImage(doorImage, 512);
      
      const lockResp = await fetch(selectedLock.imageUrl);
      const lockBlob = await lockResp.blob();
      const lockOriginalB64 = await new Promise<string>(res => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(lockBlob);
      });
      const compressedLockB64 = await compressImage(lockOriginalB64, 320);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: compressedDoorB64, mimeType: 'image/jpeg' } },
            { inlineData: { data: compressedLockB64, mimeType: 'image/jpeg' } },
            { text: "Photo editing task: Install the smart lock from image 2 onto the door in image 1. Position it where the current handle is. Keep the door's original texture and lighting. Output ONLY the resulting JPEG image." }
          ]
        }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setResultImage(`data:image/jpeg;base64,${part.inlineData.data}`);
        setStatus(AppStatus.SUCCESS);
      } else {
        throw new Error("Empty Response");
      }
    } catch (err: any) {
      console.error(`AI Attempt ${attempt} failed:`, err);
      
      // Auto-retry logic for 429 (Busy) or transient network errors
      if (attempt < 2 && (err.message?.includes('429') || err.message?.includes('503') || err.message?.includes('overloaded'))) {
        setError(t.quotaError);
        await sleep(3000 * (attempt + 1)); // Wait 3s, then 6s
        return generate(attempt + 1);
      }

      setError(err.message?.includes('429') ? t.quotaError : `${t.error} (${err.message?.substring(0, 20)})`);
      setStatus(AppStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <nav className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
             <i className="fas fa-lock-open text-white text-sm"></i>
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
          <section className="bg-gray-50 rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
              {t.step1}
            </h2>
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="group relative h-48 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all overflow-hidden shadow-inner"
            >
              {doorImage ? (
                <>
                  <img src={doorImage} className="h-full w-full object-contain" alt="Door" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-black uppercase tracking-widest">
                    {t.changePhoto}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <i className="fas fa-cloud-arrow-up text-3xl text-gray-300 mb-2 group-hover:text-blue-400 transition-colors"></i>
                  <p className="text-gray-400 text-sm px-4 font-bold">{t.step1Hint}</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
            <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
              <p className="text-[10px] text-blue-600/70 flex items-start gap-2 leading-relaxed font-medium">
                <i className="fas fa-user-shield mt-0.5"></i>
                {t.privacyNotice}
              </p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-3xl p-6 border border-gray-100 shadow-sm flex-1 flex flex-col">
            <h2 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
              {t.step2}
            </h2>
            
            <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {LOCK_MODELS.map(lock => (
                  <button 
                    key={lock.id} 
                    onClick={() => { setSelectedLock(lock); setError(null); }} 
                    className={`p-3 rounded-2xl border-2 transition-all bg-white relative group flex flex-col items-center gap-2 ${selectedLock.id === lock.id ? 'border-blue-600 shadow-md ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}
                  >
                    <div className="h-20 w-full flex items-center justify-center">
                      <img src={lock.imageUrl} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500" alt={lock.name} />
                    </div>
                    <p className="text-[10px] font-black text-gray-700 text-center leading-tight uppercase tracking-tight">{lock.name}</p>
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
              onClick={() => generate(0)} 
              disabled={status === AppStatus.GENERATING} 
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-gray-400 relative overflow-hidden group"
            >
              {status === AppStatus.GENERATING ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-circle-notch animate-spin"></i>
                  {retryCount > 0 ? t.retryBtn : t.generating}
                </span>
              ) : t.generateBtn}
            </button>
            
            {error && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-3">
                  <i className="fas fa-triangle-exclamation text-orange-500 mt-0.5"></i>
                  <p className="text-orange-700 text-[11px] font-bold leading-tight">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="flex flex-col gap-4">
          <div className="bg-gray-900 rounded-[3rem] p-4 lg:p-8 shadow-2xl flex-1 flex flex-col min-h-[500px] border-4 border-gray-800 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
            
            <header className="flex justify-between items-center mb-6 px-4 relative z-10">
              <span className="text-white/30 text-[10px] font-black tracking-[0.2em] uppercase">{t.canvasTitle}</span>
              {status === AppStatus.SUCCESS && (
                <button 
                  onClick={handleDownload}
                  className="bg-white/10 hover:bg-blue-600 text-white py-2 px-5 rounded-full transition-all flex items-center gap-2 border border-white/10"
                >
                   <i className="fas fa-download text-xs"></i>
                   <span className="text-[10px] font-black uppercase tracking-widest">{t.downloadBtn}</span>
                </button>
              )}
            </header>
            
            <div className="flex-1 bg-black rounded-[2rem] overflow-hidden relative border border-white/5 flex items-center justify-center z-10 shadow-inner">
              {resultImage ? (
                <img src={resultImage} className="w-full h-full object-contain animate-in fade-in duration-700" alt="Result" />
              ) : status === AppStatus.GENERATING ? (
                <div className="text-center px-8">
                  <div className="relative w-20 h-20 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-white font-black text-2xl mb-2">{t.generating}</p>
                  <p className="text-blue-400 text-[10px] font-bold tracking-wider animate-pulse uppercase">
                    {t.generatingSub.replace('{n}', (retryCount + 1).toString())}
                  </p>
                </div>
              ) : (
                <div className="text-center p-12 opacity-30">
                  <i className="fas fa-wand-sparkles text-6xl text-white mb-6"></i>
                  <p className="text-white text-[11px] font-black uppercase tracking-[0.2em]">{t.canvasEmpty}</p>
                </div>
              )}
            </div>
            
            <footer className="mt-8 bg-white/5 backdrop-blur-3xl p-5 rounded-3xl border border-white/10 flex gap-4 items-center z-10">
              <i className="fas fa-robot text-blue-400 text-sm"></i>
              <p className="text-[10px] text-white/40 leading-normal italic font-medium">
                {lang === 'cn' ? UI_CONFIG.disclaimer.textCN : lang === 'bm' ? UI_CONFIG.disclaimer.textBM : UI_CONFIG.disclaimer.textEN}
              </p>
            </footer>
          </div>
        </section>
      </main>

      <footer className="mt-auto p-12 text-center text-gray-400">
        <p className="text-[10px] font-black tracking-[0.4em] uppercase mb-4">© 2024 IRIS.MY SMARTLOCK TECHNOLOGY</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default App;
