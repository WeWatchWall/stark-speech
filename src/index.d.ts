declare module 'stark-speech' {
  export default class StarkSpeech { 
    static init(
      delay?: number,
      baseUrl?: string,
      accuracy?: number,
      overlap?: number
    ): StarkSpeech;
    
    speak(arg?: string): Promise<void>;
    listen(): Promise<string>;
    listenBackground(): Promise<void>;
  }
}