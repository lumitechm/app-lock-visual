
import { LockModel } from './types';

export const UI_CONFIG = {
  disclaimer: {
    textCN: 'AI模型处于试用阶段，可能会生成不完美照片，重新生成即可优化效果。',
    textEN: 'AI in Beta. Results may vary. Re-generate to optimize quality.',
    textBM: 'Model AI dalam Beta. Keputusan mungkin berbeza. Jana semula untuk kualiti lebih baik.'
  }
};

export const TRANSLATIONS = {
  en: {
    title: 'SmartLock AI Visualizer',
    step1: '1. Upload Door',
    step1Hint: 'Upload your door photo',
    changePhoto: 'Change',
    step2: '2. Pick Model',
    generateBtn: 'Generate Preview',
    generating: 'AI Processing...',
    generatingSub: 'Matching perspective & light...',
    canvasTitle: 'Visual Result',
    canvasEmpty: 'Upload and pick a lock to start',
    downloadBtn: 'Save Image',
    error: 'AI Error, try again later.',
    quotaError: 'AI is busy. Please wait 60s.',
    uploadFirst: 'Please upload photo first'
  },
  bm: {
    title: 'Visualizer AI Pintu',
    step1: '1. Muat Naik Pintu',
    step1Hint: 'Muat naik foto pintu anda',
    changePhoto: 'Tukar',
    step2: '2. Pilih Model',
    generateBtn: 'Jana Visual',
    generating: 'Sedang Menjana...',
    generatingSub: 'Menyelaras cahaya & perspektif...',
    canvasTitle: 'Hasil Visual',
    canvasEmpty: 'Muat naik dan pilih kunci untuk mula',
    downloadBtn: 'Simpan Gambar',
    error: 'Gangguan AI, cuba lagi.',
    quotaError: 'AI sibuk. Tunggu 60 saat.',
    uploadFirst: 'Muat naik foto dahulu'
  },
  cn: {
    title: '智能锁 AI 预览',
    step1: '1. 上传大门',
    step1Hint: '点击上传您的大门正面照',
    changePhoto: '更换照片',
    step2: '2. 选择型号',
    generateBtn: '立即生成',
    generating: 'AI 正在处理...',
    generatingSub: '正在匹配光影与角度...',
    canvasTitle: '预览效果',
    canvasEmpty: '请先上传照片并选择型号',
    downloadBtn: '下载预览图',
    error: '生成失败，请稍后重试',
    quotaError: 'AI 通道繁忙，请稍等 60 秒。',
    uploadFirst: '请先上传照片'
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
