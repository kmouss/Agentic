import React, { useState, useEffect, useRef } from 'react';
import { PartyConfig, ShoppingItem, BrandTier } from '../types.ts';
import { parseVoiceCommand } from '../utils/voiceCommander.ts';
import { formatCurrency } from '../utils/partyCalculators.ts';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  HelpCircle,
  Radio,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

interface VoiceControllerProps {
  party: PartyConfig;
  items: ShoppingItem[];
  activeTab: 'define' | 'review' | 'refine' | 'calculator' | 'agent';
  onSelectTab: (tab: 'define' | 'review' | 'refine' | 'calculator' | 'agent') => void;
  onUpdateParty: (updated: Partial<PartyConfig>) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'isPurchased'>) => void;
  onDeleteItem: (id: string) => void;
  onAutoTuneBudget: () => void;
  onQuickTrimBudget: (amount: number) => void;
  onApplyBrandStrategy: (strategy: 'basics' | 'balanced' | 'select') => void;
  onCheckout: () => void;
}

const VOICE_CHIP_SUGGESTIONS: Record<string, string[]> = {
  define: [
    'Set budget to 250 dollars',
    'Set guest count to 22 adults',
    'Set duration to 4 hours',
    'Go to review list',
  ],
  review: [
    'Auto tune to budget',
    'Add 3 bags of ice',
    'Trim 25 dollars',
    'What is my total?',
    'Go to checkout',
  ],
  refine: [
    'Switch to Cymbal Basics',
    'Switch to Cymbal Select',
    'Select curbside pickup',
    'Place order',
  ],
  calculator: [
    'What is my total?',
    'Go to review list',
    'Auto tune to budget',
  ],
  agent: [
    'What aisle is ice in?',
    'How do I save 30 dollars?',
    'Go to review list',
  ],
};

export const VoiceController: React.FC<VoiceControllerProps> = ({
  party,
  items,
  activeTab,
  onSelectTab,
  onUpdateParty,
  onAddItem,
  onDeleteItem,
  onAutoTuneBudget,
  onQuickTrimBudget,
  onApplyBrandStrategy,
  onCheckout,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeStepGuide, setActiveStepGuide] = useState(true);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize SpeechSynthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Text-To-Speech audio feedback
  const speakFeedback = (text: string) => {
    if (!voiceFeedbackEnabled || !synthRef.current) return;
    try {
      synthRef.current.cancel(); // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis not available', e);
    }
  };

  // Process any speech command (from microphone OR simulator)
  const executeCommand = (spokenText: string) => {
    if (!spokenText.trim()) return;

    setTranscript(spokenText);
    const result = parseVoiceCommand(spokenText, party, items);
    setLastAction(result.feedbackText);
    speakFeedback(result.feedbackText);

    switch (result.type) {
      case 'NAVIGATE':
        if (result.payload) {
          onSelectTab(result.payload);
        }
        break;

      case 'SET_BUDGET':
        if (typeof result.payload === 'number') {
          onUpdateParty({ targetBudget: result.payload });
        }
        break;

      case 'SET_GUESTS':
        if (result.payload) {
          onUpdateParty({
            adults: result.payload.adults,
            kids: result.payload.kids,
            drinkingAdults: result.payload.adults,
          });
        }
        break;

      case 'SET_DURATION':
        if (typeof result.payload === 'number') {
          onUpdateParty({ durationHours: result.payload });
        }
        break;

      case 'AUTO_TUNE':
        onAutoTuneBudget();
        break;

      case 'TRIM_BUDGET':
        if (typeof result.payload === 'number') {
          onQuickTrimBudget(result.payload);
        }
        break;

      case 'SET_BRAND_STRATEGY':
        if (result.payload) {
          onApplyBrandStrategy(result.payload);
        }
        break;

      case 'ADD_ITEM':
        if (result.payload) {
          onAddItem(result.payload);
        }
        break;

      case 'REMOVE_ITEM':
        if (result.payload) {
          onDeleteItem(result.payload);
        }
        break;

      case 'PLACE_ORDER':
        onSelectTab('refine');
        setTimeout(() => {
          onCheckout();
        }, 500);
        break;

      case 'STATUS_QUERY':
      case 'READ_LIST':
      case 'UNKNOWN':
      default:
        // Feedback already spoken
        break;
    }
  };

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const heard = event.results[current][0].transcript;
      executeCommand(heard);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Auto-restart if customer wants hands-free continuous listening
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {
          // ignore already started
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
    };
  }, [party, items, voiceFeedbackEnabled]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // In case native microphone is restricted in sandbox, toggle expanded simulator HUD
      setIsExpanded(true);
      return;
    }

    if (isListening) {
      setIsListening(false);
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      speakFeedback('Hands-free listening paused.');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setIsExpanded(true);
        speakFeedback('CymbalMart Voice Control active. Complete your party shopping hands-free.');
      } catch (e) {
        setIsListening(true);
        setIsExpanded(true);
      }
    }
  };

  const currentChips = VOICE_CHIP_SUGGESTIONS[activeTab] || VOICE_CHIP_SUGGESTIONS.review;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm sm:max-w-md w-full">
      {/* Voice HUD Card */}
      {isExpanded ? (
        <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden text-white animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-neutral-950 flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  isListening ? 'bg-rose-500 animate-ping' : 'bg-neutral-500'
                }`}
              />
              <div className="text-xs font-bold flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-teal-400" />
                <span>Hands-Free Voice Controller</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setVoiceFeedbackEnabled(!voiceFeedbackEnabled)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  voiceFeedbackEnabled
                    ? 'text-teal-400 hover:bg-neutral-800'
                    : 'text-neutral-500 hover:bg-neutral-800'
                }`}
                title={voiceFeedbackEnabled ? 'Spoken Voice Feedback ON' : 'Spoken Voice Feedback OFF'}
              >
                {voiceFeedbackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3.5 text-xs">
            {/* Live Audio Visualizer Wave */}
            <div className="flex items-center justify-between p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleListening}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all shadow-md ${
                    isListening
                      ? 'bg-rose-600 text-white scale-105 ring-2 ring-rose-400/50'
                      : 'bg-teal-700 hover:bg-teal-600 text-white'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start microphone'}
                >
                  {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
                </button>

                <div>
                  <div className="font-bold text-neutral-200">
                    {isListening ? 'Listening Continuously...' : 'Microphone Ready'}
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    {isListening ? 'Speak any command hands-free' : 'Click to enable voice'}
                  </div>
                </div>
              </div>

              {/* Animated Sound Wave Bars */}
              <div className="flex items-center gap-1 h-6 px-2">
                {[4, 12, 18, 10, 24, 14, 8, 16].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isListening ? 'bg-teal-400 animate-pulse' : 'bg-neutral-700'
                    }`}
                    style={{
                      height: isListening ? `${Math.max(4, (h * Math.random()) + 6)}px` : '4px',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Transcript & Executed Action */}
            <div className="space-y-1.5">
              {transcript && (
                <div className="p-2.5 bg-neutral-800/80 rounded-lg text-neutral-300 font-mono text-[11px]">
                  <span className="text-neutral-500">Heard: </span>
                  <span className="text-white font-semibold">"{transcript}"</span>
                </div>
              )}

              {lastAction && (
                <div className="p-2.5 bg-teal-950/80 border border-teal-800/60 rounded-lg text-teal-200 text-[11px] flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{lastAction}</span>
                </div>
              )}
            </div>

            {/* Hands-Free Voice Command Suggestions */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                <span>Say (or Tap to test):</span>
                <span className="text-teal-400 lowercase font-mono">step: {activeTab}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {currentChips.map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => executeCommand(cmd)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-teal-900/60 hover:text-teal-200 text-neutral-300 text-[11px] transition-colors border border-neutral-700/60 text-left"
                  >
                    "{cmd}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Minimized Voice Pill */
        <button
          onClick={() => {
            setIsExpanded(true);
            if (!isListening) toggleListening();
          }}
          className={`px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-200 hover:scale-105 border ${
            isListening
              ? 'bg-rose-950 text-white border-rose-500 ring-2 ring-rose-500/30'
              : 'bg-neutral-900 text-white border-neutral-700 hover:border-neutral-500'
          }`}
          title="Open Hands-Free Voice Control"
        >
          <div className="relative">
            <span
              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold ${
                isListening ? 'bg-rose-600 text-white' : 'bg-teal-700 text-white'
              }`}
            >
              {isListening ? <Mic className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
            </span>
            {isListening && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-400 rounded-full animate-ping" />
            )}
          </div>

          <div className="text-left">
            <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>Voice Control</span>
              {isListening && (
                <span className="text-[10px] text-rose-400 font-mono">LISTENING</span>
              )}
            </div>
            <div className="text-[10px] text-neutral-400">
              {isListening ? 'Speak command hands-free' : 'Click to enable voice'}
            </div>
          </div>
        </button>
      )}
    </div>
  );
};
