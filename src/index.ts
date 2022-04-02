export default class StarkSpeech {
  static instance: StarkSpeech;

  private constructor() {
  }

  public static init(): StarkSpeech { 
    if (!StarkSpeech.instance) {
      StarkSpeech.instance = new StarkSpeech();
    }

    return StarkSpeech.instance;
  }
}
