declare module 'stark-speech' {
  export default class StarkSpeech { 
    static init(
      delay?: number,
      accuracy?: number,
      overlap?: number,
      baseUrl?: string
    ): StarkSpeech;
    
    speak(arg?: string): Promise<void>;
    listen(): Promise<string>;
    listenBackground(): Promise<void>;
  }
}