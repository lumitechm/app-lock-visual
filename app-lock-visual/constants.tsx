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
    step2: '2. Select Smart Lock',
    generateBtn: 'Generate Preview',
    generating: 'AI Processing...',
    generatingSub: 'Matching perspective & light...',
    canvasTitle: 'Visual Result',
    canvasEmpty: 'Upload and pick a lock to start',
    downloadBtn: 'Save Image',
    error: 'AI Error, try again later.',
    retryBtn: 'Retry Now',
    quotaError: 'The AI is currently overloaded. Please wait 10-15 seconds and try again.',
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
    generatingSub: 'Menyelaras cahaya & perspektif...',
    canvasTitle: 'Hasil Visual',
    canvasEmpty: 'Muat naik dan pilih kunci untuk mula',
    downloadBtn: 'Simpan Gambar',
    error: 'Gangguan AI, cuba lagi.',
    retryBtn: 'Cuba Lagi',
    quotaError: 'AI sedang sibuk. Sila tunggu 10-15 saat dan cuba lagi.',
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
    generatingSub: '正在匹配光影与角度...',
    canvasTitle: '预览效果',
    canvasEmpty: '请先上传照片并选择型号',
    downloadBtn: '下载预览图',
    error: '生成失败，请稍后重试',
    retryBtn: '立即重试',
    quotaError: 'AI 引擎目前负载过高，请等待 10-15 秒后再次尝试。',
    uploadFirst: '请先上传照片',
    privacyNotice: '隐私保护：上传的照片仅用于实时生成，不会被保存。'
  }
};

export const LOCK_MODELS: LockModel[] = [
 {
    id: 'p90-gold',
    name: 'Stanley P90/P50 (Gold)',
    description: 'Aviation-grade aluminum. Full-automatic Vertical Column design. CNC precision finish.',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97772909.png?width=1024&format=webp'
  },
  {
    id: 'p90-black',
    name: 'Stanley P90/P50 (Black)',
    description: 'Aviation-grade aluminum. Full-automatic Vertical Column design. CNC precision finish.',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97772859.png?width=1024&format=webp' 
  },
  {
    id: 's70-copper',
    name: 'Stanley S70 (Copper Orange)',
    description: 'Aviation-grade aluminum. Sleek Vertical Monolith design. No side-extending parts.',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97773693.png?width=1024&format=webp'
  },
  {
    id: 'f50-black',
    name: 'Stanley F50 (Black)',
    description: 'Ultra slim modern design, fully automatic push-pull lock',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97774885.png?width=1024&format=webp'
  },
  {
    id: 'd51-black',
    name: 'Stanley D51 (Black)',
    description: 'Reliable Lever Handle Door Lock',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97777127.png?width=1024&format=webp'
  },
  {
    id: 'dl50-black',
    name: 'Ezviz DL50FVS (Black)',
    description: 'Video Face Recognation modern design, fully automatic push-pull lock',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97778082.png?width=1024&format=webp'
  },
  {
    id: 'dl05-grey',
    name: 'Ezviz DL05 (Grey)',
    description: 'Reliable Lever Handle Door Lock	',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97778436.png?width=1024&format=webp'
  },
  {
    id: 'l2s-black',
    name: 'Ezviz L2S (Black)',
    description: 'Basic Smart Lever Handle Door Lock',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97778545.png?width=1024&format=webp'
  },
  {
    id: 'n100-black',
    name: 'Aqara N100 (Black)',
    description: 'Smart Home Lever Handle Door Lock',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97778828.png?width=1024&format=webp'
  },
  {
    id: 'a100-black',
    name: 'Aqara A100 (Black)',
    description: 'Smart Home Lever Handle Door Lock',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97778899.png?width=1024&format=webp'
  },
  {
    id: 'd100-black',
    name: 'Aqara D100 (Black)',
    description: 'smart home fully automatic push-pull lock',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97779039.png?width=1024&format=webp'
  },
  {
    id: 'd200-black-bronze',
    name: 'Aqara D200i (Black Bronze )',
    description: 'smart home fully automatic push-pull lock',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97779096.png?width=1024&format=webp'
  },
  {
    id: 'by-you-pro-black',
    name: 'Yale-By-You-Pro (Black)',
    description: 'Yale fully automatic push-pull lock',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97779274.png?width=1024&format=webp'
  },
  {
    id: 'kyra-pro-black',
    name: 'Yale-Kyra-Pro (Black)',
    description: 'Yale Slimmest fully automatic push-pull lock',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97779310.png?width=1024&format=webp'
  },
  {
    id: 'luna-pro-elite-black',
    name: 'Yale-Luna-Pro-Elite-Plus (Black)',
    description: 'Yale Flagship Video Face ID fully automatic push-pull lock',
    imageUrl:https://gw-assets.assaabloy.com/is/image/assaabloy/new-luna-eliteplus-front-body-2'
  },
  {
    id: 'luna-pro+-black',
    name: 'Yale-Luna-Pro-Plus (Black Gold)',
    description: 'Yale Flagship Face ID fully automatic push-pull lock',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97779403.png?width=1024&format=webp'
  },
  {
    id: 'luna-pro-black-g',
    name: 'Yale-Kyra-Pro (Black Gold)',
    description: 'Yale Flagship fully automatic push-pull lock',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97779457.png?width=1024&format=webp'
  },
  {
    id: 'zuri-black',
    name: 'Yale-Zuri (Black)',
    description: 'Yale Basic Lever Handle Door Lock',
    imageUrl: 'https://cdn.store-assets.com/s/1002792/i/97779525.png?width=1024&format=webp'
  }
];
