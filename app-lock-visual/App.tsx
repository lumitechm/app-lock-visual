import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LOCK_MODELS, TRANSLATIONS, UI_CONFIG } from './constants';
import { AppStatus, LockModel } from './types';

const App: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'bm' | 'cn'>('en'); // Default to English
  const [selectedLock, setSelectedLock] = useState<LockModel>(LOCK_MODELS[0]);
  const [doorImage, setDoorImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang];

  const compressImage = (base64Str: string, maxWidth: number = 1024): Promise<string> => {
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
        ctx?.drawImage(img, 0, 0, width, height);
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
      };
      reader.readAsDataURL(file);
    }
  };

  const generate = async () => {
    if (!doorImage) {
      setError(t.uploadFirst);
      return;
    }
    setStatus(AppStatus.GENERATING);
    setError(null);
    try {
      const compressedDoorB64 = await compressImage(doorImage);
      const lockResp = await fetch(selectedLock.imageUrl);
      const lockBlob = await lockResp.blob();
      const lockOriginalB64 = await new Promise<string>(res => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(lockBlob);
      });
      const compressedLockB64 = await compressImage(lockOriginalB64, 512);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: compressedDoorB64, mimeType: 'image/jpeg' } },
            { inlineData: { data: compressedLockB64, mimeType: 'image/jpeg' } },
            { text: "Replace the existing door handle/lock in the first image with the smart lock shown in the second image. Match the lighting, perspective, and scale perfectly. Return ONLY the edited image." }
          ]
        }
      });
      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setResultImage(`data:image/jpeg;base64,${part.inlineData.data}`);
        setStatus(AppStatus.SUCCESS);
      } else {
        throw new Error("No image data received from AI");
      }
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      if (err.message?.includes('429')) {
        setError(t.quotaError);
      } else {
        setError(`${t.error} (${err.message?.substring(0, 50)}...)`);
      }
      setStatus(AppStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <nav className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-50">
        <h1 className="font-black text-xl tracking-tighter">IRIS.MY <span className="text-blue-600">AI</span></h1>
        <div className="flex gap-2">
          {(['en', 'bm', 'cn'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${lang === l ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200 text-gray-400'}`}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h2 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
              {t.step1}
            </h2>
            <div onClick={() => fileInputRef.current?.click()} className="group relative h-56 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all overflow-hidden">
              {doorImage ? (
                <>
                  <img src={doorImage} className="h-full w-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-sm font-bold">
                    {t.changePhoto}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <i className="fas fa-camera text-3xl text-gray-300 mb-2"></i>
                  <p className="text-gray-400 text-sm px-4 font-medium">{t.step1Hint}</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
            
            <p className="mt-3 text-[10px] text-gray-400 flex items-center gap-2 px-1">
              <i className="fas fa-shield-halved text-blue-400"></i>
              {t.privacyNotice}
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h2 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                 <i className="fas fa-lock text-[8px]"></i>
              </span>
              {t.step2}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {LOCK_MODELS.map(lock => (
                <button 
                  key={lock.id} 
                  onClick={() => setSelectedLock(lock)} 
                  className={`p-2 rounded-xl border-2 transition-all bg-white relative group ${selectedLock.id === lock.id ? 'border-blue-600 shadow-md ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  <img src={lock.imageUrl} className="h-16 w-full object-contain mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-[9px] text-center font-bold text-gray-600 truncate">{lock.name}</p>
                  {selectedLock.id === lock.id && (
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      <i className="fas fa-check text-[8px]"></i>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={generate} 
            disabled={status === AppStatus.GENERATING} 
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-gray-300 disabled:shadow-none"
          >
            {status === AppStatus.GENERATING ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-circle-notch animate-spin"></i>
                {t.generating}
              </span>
            ) : t.generateBtn}
          </button>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
              <i className="fas fa-exclamation-circle text-red-500"></i>
              <p className="text-red-600 text-xs font-bold flex-1">{error}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 rounded-[2.5rem] p-4 lg:p-6 shadow-2xl flex-1 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-white/40 text-[10px] font-bold tracking-widest uppercase">{t.canvasTitle}</span>
              {status === AppStatus.SUCCESS && (
                <button className="text-white/60 hover:text-white transition-colors">
                   <i className="fas fa-download"></i>
                </button>
              )}
            </div>
            
            <div className="flex-1 bg-black rounded-3xl overflow-hidden relative border border-white/5 flex items-center justify-center group">
              {resultImage ? (
                <img src={resultImage} className="w-full h-full object-contain animate-in fade-in zoom-in duration-500" />
              ) : status === AppStatus.GENERATING ? (
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-white font-black text-xl mb-2 tracking-tight">{t.generating}</p>
                  <p className="text-blue-400 text-xs font-medium animate-pulse">{t.generatingSub}</p>
                </div>
              ) : (
                <div className="text-center p-12 transition-transform group-hover:scale-105 duration-700">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <i className="fas fa-wand-magic-sparkles text-4xl text-white/20"></i>
                  </div>
                  <p className="text-white/30 text-sm font-bold max-w-[200px] mx-auto leading-relaxed">{t.canvasEmpty}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
              <div className="flex gap-3 items-start">
                <i className="fas fa-robot text-blue-400 mt-1 text-xs"></i>
                <p className="text-[10px] text-white/60 leading-relaxed italic font-medium">
                  {lang === 'cn' ? UI_CONFIG.disclaimer.textCN : lang === 'bm' ? UI_CONFIG.disclaimer.textBM : UI_CONFIG.disclaimer.textEN}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto p-8 text-center border-t border-gray-100">
        <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-2">© 2024 IRIS.MY SMARTLOCK TECHNOLOGY</p>
        <div className="flex justify-center gap-4 text-[9px] text-gray-300 font-bold">
           <span className="hover:text-blue-600 cursor-pointer">TERMS</span>
           <span className="hover:text-blue-600 cursor-pointer uppercase">Privacy Policy</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
