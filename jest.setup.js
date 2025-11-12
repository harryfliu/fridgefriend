import '@testing-library/jest-dom'

// Mock Web Speech API for voice input tests
global.webkitSpeechRecognition = jest.fn().mockImplementation(() => ({
  continuous: false,
  interimResults: false,
  lang: '',
  onstart: null,
  onresult: null,
  onerror: null,
  onend: null,
  start: jest.fn(),
  stop: jest.fn(),
}))

global.SpeechRecognition = global.webkitSpeechRecognition
