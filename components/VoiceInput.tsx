"use client";

import { useState, useEffect, useRef } from "react";

interface VoiceInputProps {
  onIngredientDetected: (ingredient: string) => void;
}

export default function VoiceInput({ onIngredientDetected }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if the browser supports the Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(interimTranscript || finalTranscript);

        if (finalTranscript) {
          // Process the final transcript to extract ingredients
          // Split on commas or "and" with surrounding spaces, but NOT on all spaces
          const ingredients = finalTranscript
            .toLowerCase()
            .split(/\s*,\s*|\s+and\s+/)
            .map((word) => word.trim())
            .filter((word) => word.length > 2);

          ingredients.forEach((ingredient) => {
            onIngredientDetected(ingredient);
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onIngredientDetected]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500 italic">
        Voice input not supported in this browser
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={toggleListening}
        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
          isListening
            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
        </svg>
        {isListening ? "Listening..." : "Voice Input"}
      </button>

      {transcript && (
        <div className="text-sm text-gray-600 italic">
          Heard: {transcript}
        </div>
      )}

      {isListening && (
        <div className="text-xs text-gray-500">
          Say ingredients separated by commas or "and"
        </div>
      )}
    </div>
  );
}
