import { useState, useEffect } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface LanguageToggleProps {
  onLanguageChange: (language: string) => void;
}

// Language configuration with native names and codes
const LANGUAGE_MAP: Record<string, { code: string; native: string; english: string }> = {
  en: { code: 'en', native: 'EN', english: 'English' },
  hi: { code: 'hi', native: 'हिं', english: 'Hindi' },
  mr: { code: 'mr', native: 'मर', english: 'Marathi' },
  ta: { code: 'ta', native: 'த', english: 'Tamil' },
  te: { code: 'te', native: 'తె', english: 'Telugu' },
  bn: { code: 'bn', native: 'বা', english: 'Bengali' },
  gu: { code: 'gu', native: 'ગુ', english: 'Gujarati' },
  kn: { code: 'kn', native: 'ಕ', english: 'Kannada' },
  ml: { code: 'ml', native: 'മ', english: 'Malayalam' },
  pa: { code: 'pa', native: 'ਪੰ', english: 'Punjabi' },
  or: { code: 'or', native: 'ଓ', english: 'Odia' },
  es: { code: 'es', native: 'ES', english: 'Spanish' },
  fr: { code: 'fr', native: 'FR', english: 'French' },
  de: { code: 'de', native: 'DE', english: 'German' },
  zh: { code: 'zh', native: '中', english: 'Chinese' },
  ja: { code: 'ja', native: '日', english: 'Japanese' },
  ko: { code: 'ko', native: '한', english: 'Korean' },
  ar: { code: 'ar', native: 'ع', english: 'Arabic' },
  ru: { code: 'ru', native: 'РУ', english: 'Russian' },
  pt: { code: 'pt', native: 'PT', english: 'Portuguese' },
  it: { code: 'it', native: 'IT', english: 'Italian' }
};

// Indian state to language mapping
const INDIAN_STATE_LANGUAGES: Record<string, string> = {
  'Maharashtra': 'mr',
  'Tamil Nadu': 'ta',
  'Karnataka': 'kn',
  'Kerala': 'ml',
  'Andhra Pradesh': 'te',
  'Telangana': 'te',
  'West Bengal': 'bn',
  'Gujarat': 'gu',
  'Punjab': 'pa',
  'Odisha': 'or',
  'Haryana': 'hi',
  'Uttar Pradesh': 'hi',
  'Madhya Pradesh': 'hi',
  'Rajasthan': 'hi',
  'Bihar': 'hi',
  'Jharkhand': 'hi',
  'Chhattisgarh': 'hi',
  'Uttarakhand': 'hi',
  'Himachal Pradesh': 'hi',
  'Delhi': 'hi',
  'Assam': 'hi', // Assamese not in MyMemory, defaulting to Hindi
  // Default for other states
  'default': 'hi'
};

interface LocationData {
  country: string;
  state: string;
  language: string;
}

// Detect user's location and determine language
const detectLocationLanguage = async (): Promise<string> => {
  try {
    console.log('Detecting location...');
    
    // Try to get user's IP-based location
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }
    
    const data = await response.json();
    console.log('Location data:', data);
    
    const country = data.country_name || data.country || '';
    const state = data.region || '';
    
    // If in India, map to state language
    if (country === 'India' && state) {
      const language = INDIAN_STATE_LANGUAGES[state] || INDIAN_STATE_LANGUAGES['default'];
      console.log(`Detected India, State: ${state}, Language: ${language}`);
      localStorage.setItem('slidemaster-detected-language', language);
      localStorage.setItem('slidemaster-location', JSON.stringify({ country, state, language }));
      return language;
    }
    
    // For other countries, default to Hindi for demo purposes
    console.log('Not in India or state not detected, defaulting to Hindi');
    return 'hi';
    
  } catch (error) {
    console.error('Location detection error:', error);
    // Fallback to browser language or Hindi
    const browserLang = navigator.language.split('-')[0];
    return LANGUAGE_MAP[browserLang] ? browserLang : 'hi';
  }
};

export function LanguageToggle({ onLanguageChange }: LanguageToggleProps) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [regionalLanguage, setRegionalLanguage] = useState<string>('hi');
  const [isToggling, setIsToggling] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    // Detect location and set regional language
    const initLanguage = async () => {
      setIsDetecting(true);
      
      // Check if we have cached location data
      const cachedLocation = localStorage.getItem('slidemaster-location');
      const savedCurrentLang = localStorage.getItem('slidemaster-language');
      
      if (cachedLocation) {
        try {
          const locationData: LocationData = JSON.parse(cachedLocation);
          setRegionalLanguage(locationData.language);
          setCurrentLanguage(savedCurrentLang || 'en');
          console.log('Using cached location:', locationData);
          setIsDetecting(false);
          return;
        } catch (e) {
          console.error('Error parsing cached location:', e);
        }
      }
      
      // Detect location
      const detectedLang = await detectLocationLanguage();
      setRegionalLanguage(detectedLang);
      setCurrentLanguage(savedCurrentLang || 'en');
      setIsDetecting(false);
    };
    
    initLanguage();
  }, []);

  const handleToggle = async () => {
    if (isToggling || isDetecting) return;
    
    setIsToggling(true);
    
    try {
      // Toggle between English and regional language
      const newLang = currentLanguage === 'en' ? regionalLanguage : 'en';
      
      console.log('Switching language from', currentLanguage, 'to', newLang);
      
      setCurrentLanguage(newLang);
      localStorage.setItem('slidemaster-language', newLang);
      
      const langName = LANGUAGE_MAP[newLang]?.english || 'Unknown';
      
      if (newLang !== 'en') {
        toast.info(`Translating to ${langName}...`);
      }
      
      // Trigger translation
      await onLanguageChange(newLang);
      
    } catch (error) {
      console.error('Language toggle error:', error);
      toast.error('Translation failed');
    } finally {
      setTimeout(() => setIsToggling(false), 2000);
    }
  };

  const displayLang = LANGUAGE_MAP[currentLanguage] || LANGUAGE_MAP.en;

  if (isDetecting) {
    return (
      <button
        className="w-11 h-11 rounded-full clay-button border-0 flex items-center justify-center"
        disabled
      >
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="w-11 h-11 rounded-full clay-button border-0 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 relative group"
      aria-label={`Switch to ${currentLanguage === 'en' ? LANGUAGE_MAP[regionalLanguage]?.english : 'English'} language`}
      disabled={isToggling}
    >
      {isToggling ? (
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      ) : (
        <>
          <Languages className="w-5 h-5 text-primary absolute" />
          <span className="text-[10px] font-bold text-primary mt-3">
            {displayLang.native}
          </span>
        </>
      )}
      
      {/* Tooltip */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded text-xs z-50">
        {isToggling 
          ? 'Translating...' 
          : `Switch to ${currentLanguage === 'en' ? LANGUAGE_MAP[regionalLanguage]?.english : 'English'}`
        }
      </div>
    </button>
  );
}
