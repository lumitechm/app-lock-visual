import { LockModel } from './types';

export const UI_CONFIG = {
  disclaimer: {
    textCN: 'AI 正在处理光影匹配，若生成失败请重试。建议上传光线充足的大门正面照。',
    textEN: 'AI is matching light and shadows. If it fails, please retry. Best results with front-facing, well-lit photos.',
    textBM: 'AI sedang menyelaraskan cahaya. Jika gagal, sila cuba lagi. Keputusan terbaik dengan foto depan yang terang.'
  }
};

export const TRANSLATIONS = {
  en: {
    title: 'SmartLock AI Visualizer',
    step1: '1. Upload Door',
    step1Hint: 'Upload your door photo',
    changePhoto: 'Change',
    step2: '2. Select Smart Lock',
    generateBtn: 'Generate Preview',
    generating: 'AI Processing...',
    generatingSub: 'Step {n}: Optimizing image...',
    canvasTitle: 'Visual Result',
    canvasEmpty: 'Upload and pick a lock to start',
    downloadBtn: 'Save Image',
    error: 'AI Error, please try again.',
    retryBtn: 'Auto-retrying...',
    quotaError: 'Server busy. Auto-retrying in a moment...',
    uploadFirst: 'Please upload photo first',
    privacyNotice: 'Privacy: Photos are processed in real-time and NOT stored.'
  },
  bm: {
    title: 'Visualizer AI Pintu',
    step1: '1. Muat Naik Pintu',
    step1Hint: 'Muat naik foto pintu anda',
    changePhoto: 'Tukar',
    step2: '2. Pilih Kunci Pintar',
    generateBtn: 'Jana Visual',
    generating: 'Sedang Menjana...',
    generatingSub: 'Langkah {n}: Mengoptimumkan imej...',
    canvasTitle: 'Hasil Visual',
    canvasEmpty: 'Muat naik dan pilih kunci untuk mula',
    downloadBtn: 'Simpan Gambar',
    error: 'Gangguan AI, cuba lagi.',
    retryBtn: 'Cuba lagi...',
    quotaError: 'AI sibuk. Sedang mencuba semula...',
    uploadFirst: 'Muat naik foto dahulu',
    privacyNotice: 'Privasi: Foto diproses secara masa nyata dan TIDAK disimpan.'
  },
  cn: {
    title: '智能锁 AI 预览',
    step1: '1. 上传大门',
    step1Hint: '点击上传您的大门正面照',
    changePhoto: '更换照片',
    step2: '2. 选择智能锁款式',
    generateBtn: '立即生成',
    generating: 'AI 正在处理...',
    generatingSub: '第 {n} 步：正在优化图像并匹配...',
    canvasTitle: '预览效果',
    canvasEmpty: '请先上传照片并选择型号',
    downloadBtn: '下载预览图',
    error: '生成失败，请稍后重试',
    retryBtn: '正在尝试重连...',
    quotaError: 'AI 通道繁忙，正在为您自动重试...',
    uploadFirst: '请先上传照片',
    privacyNotice: '隐私保护：上传的照片仅用于实时生成，不会被保存。'
  }
};

export const LOCK_MODELS: LockModel[] = [
  { id: 'p90-gold', name: 'Stanley P90 Gold', description: '', imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97772909.png?width=1024&format=webp' },
  { id: 'p90-black', name: 'Stanley P90 Black', description: '', imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97772859.png?width=1024&format=webp' },
  { id: 's70-copper', name: 'Stanley S70 Copper', description: '', imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97773693.png?width=1024&format=webp' },
  { id: 'f50-black', name: 'Stanley F50 Black', description: '', imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97774885.png?width=1024&format=webp' },
  { id: 'dl50-black', name: 'Ezviz DL50FVS', description: '', imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97778082.png?width=1024&format=webp' },
  { id: 'd100-black', name: 'Aqara D100', description: '', imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97779039.png?width=1024&format=webp' }
];
