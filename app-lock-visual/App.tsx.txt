
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LOCK_MODELS, TRANSLATIONS, UI_CONFIG } from './constants';
import { AppStatus, LockModel } from './types';

const App: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'bm' | 'cn'>('cn');
  const [selectedLock, setSelectedLock] = useState<LockModel>(LOCK_MODELS[0]);
  const [doorImage, setDoorImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang];

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
    if (!doorImage) { setError(t.uploadFirst); return; }
    setStatus(AppStatus.GENERATING);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const lockResp = await fetch(selectedLock.imageUrl);
      const lockBlob = await lockResp.blob();
      const lockB64 = await new Promise<string>(res => {
        const r = new FileReader();
        r.onload = () => res((r.result as string).split(',')[1]);
        r.readAsDataURL(lockBlob);
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: doorImage.split(',')[1], mimeType: 'image/png' } },
            { inlineData: { data: lockB64, mimeType: 'image/png' } },
            { text: "Replace the original handle/lock in the door image with the smart lock image provided. Match perspective and lighting. Return ONLY the edited image." }
          ]
        }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setResultImage(`data:image/png;base64,${part.inlineData.data}`);
        setStatus(AppStatus.SUCCESS);
      }
    } catch (err: any) {
      setError(err.message.includes('429') ? t.quotaError : t.error);
      setStatus(AppStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <nav className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-50">
        <h1 className="font-black text-xl tracking-tighter">IRIS.MY <span className="text-blue-600">AI</span></h1>
        <div className="flex gap-2">
          {(['cn', 'en', 'bm'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-full text-xs font-bold ${lang === l ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto w-full p-4 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6 border">
            <h2 className="font-bold mb-4">{t.step1}</h2>
            <div onClick={() => fileInputRef.current?.click()} className="h-48 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer bg-white hover:bg-blue-50 transition-colors">
              {doorImage ? <img src={doorImage} className="h-full w-full object-contain" /> : <p className="text-gray-400 text-sm">{t.step1Hint}</p>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border">
            <h2 className="font-bold mb-4">{t.step2}</h2>
            <div className="grid grid-cols-3 gap-2">
              {LOCK_MODELS.map(lock => (
                <button key={lock.id} onClick={() => setSelectedLock(lock)} className={`p-2 rounded-lg border-2 transition-all bg-white ${selectedLock.id === lock.id ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent'}`}>
                  <img src={lock.imageUrl} className="h-12 w-full object-contain mx-auto" />
                  <p className="text-[10px] text-center mt-1 font-bold truncate">{lock.name}</p>
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={status === AppStatus.GENERATING} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 disabled:bg-gray-300">
            {status === AppStatus.GENERATING ? t.generating : t.generateBtn}
          </button>
          {error && <p className="text-red-500 text-center text-sm font-bold">{error}</p>}
        </div>

        <div className="bg-black rounded-3xl overflow-hidden min-h-[400px] flex items-center justify-center relative shadow-2xl">
          {resultImage ? (
            <img src={resultImage} className="w-full h-full object-contain" />
          ) : status === AppStatus.GENERATING ? (
            <div className="text-center text-white">
              <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-bold">{t.generating}</p>
              <p className="text-xs text-white/50">{t.generatingSub}</p>
            </div>
          ) : (
            <div className="text-center text-white/20 p-8">
              <i className="fas fa-wand-magic-sparkles text-5xl mb-4"></i>
              <p className="text-sm font-bold">{t.canvasEmpty}</p>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
            <p className="text-[10px] text-white/80 leading-relaxed italic">
              {lang === 'cn' ? UI_CONFIG.disclaimer.textCN : lang === 'bm' ? UI_CONFIG.disclaimer.textBM : UI_CONFIG.disclaimer.textEN}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
