import tf from '@tensorflow/tfjs'; // eslint-disable-line no-unused-vars
import { create } from '@tensorflow-models/speech-commands';
import annyang from "annyang";

import FlatPromise from 'flat-promise';

// Delay in ms between local and remote recognition.
const SWITCH_DELAY_DEFAULT = 800;
// Accuracy in % for keyword detection.
const DETECT_ACCURACY_DEFAULT = 0.93
// Overlap factor default.
const OVERLAP_DEFAULT = 0.75;
// Page's URL
const URL_DEFAULT = location.href;

export default class StarkSpeech {
  static instance: StarkSpeech;

  private arg: any;

  private recognizer: any;

  private isRemoteInit: boolean;
  private remotePromise: FlatPromise;
  private remoteResult: any;

  private isLocalInit: boolean;

  private constructor(
    delay = SWITCH_DELAY_DEFAULT,
    accuracy = DETECT_ACCURACY_DEFAULT,
    overlap = OVERLAP_DEFAULT,
    baseUrl = URL_DEFAULT
  ) {
    this.arg = { accuracy, delay, overlap, baseUrl };

    this.isRemoteInit = false;
    this.remotePromise = new FlatPromise();

    this.recognizer = create(
      "BROWSER_FFT", // fourier transform type, not useful to change
      undefined, // speech commands vocabulary feature, not useful for your models
      `${this.arg.baseUrl}/model.json`,
      `${this.arg.baseUrl}/metadata.json`
    );
  }

  public static init(
    delay?: number,
    accuracy?: number,
    overlap?: number,
    baseUrl?: string
  ): StarkSpeech { 
    if (!StarkSpeech.instance) {
      StarkSpeech.instance = new StarkSpeech(accuracy, delay, overlap, baseUrl);
    }

    return StarkSpeech.instance;
  }


  public async speak (arg?: string)  {
    let utterance = new SpeechSynthesisUtterance(arg);
    var flatPromise = new FlatPromise();

    utterance.onend = function() {
      flatPromise.resolve();
    };
    speechSynthesis.speak(utterance);

    await flatPromise.promise;
  };

  public async listen () {
    // Setup the first time.
    if (!this.isRemoteInit) {
      this.isRemoteInit = true;

      annyang!.addCallback(
        "result", 
        (result: string[]) => {
          this.remoteResult = result[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
        }
      );

      annyang!.addCallback(
        "error", 
        (error: any) => {
          if (error.type == 'error' && error.error == 'no-speech') {
            return;
          }

          // Pull down the global vars.
          var localPromise = this.remotePromise;
          this.remotePromise = new FlatPromise();
          this.remoteResult = null;

          localPromise.reject(error);
        }
      );

      annyang!.addCallback(
        "end", 
        () => {
          // Pull down the global vars.
          var localPromise = this.remotePromise;
          var localResult = this.remoteResult;
          this.remotePromise = new FlatPromise();
          this.remoteResult = null;

          setTimeout(() => {
            localPromise.resolve(localResult);
          }, this.arg.delay);
        }
      );
    }

    // Start listening.
    annyang!.start({ autoRestart: false, continuous: false });

    // Wait and return the result.
    let result = await this.remotePromise.promise;
    return result;
  };

  public async listenBackground () {
    var resultPromise = new FlatPromise();

    if (!this.isLocalInit) {
      this.isLocalInit = true;

      await this.recognizer.ensureModelLoaded();
    }

    this.recognizer.listen(async (result): Promise<void> => {
      let results = result.scores;
      if (results[1] > this.arg.accuracy) {            
        await this.recognizer.stopListening();

        setTimeout(
          () => {
            resultPromise.resolve();
          },
          this.arg.delay
        );
      }
    }, {
      includeSpectrogram: false, // in case listen should return result.spectrogram
      probabilityThreshold: 0.75,
      invokeCallbackOnNoiseAndUnknown: false,
      overlapFactor: this.arg.overlap // probably want between 0.5 and 0.75. More info in README
    });

    // returns when it's called out.
    await resultPromise.promise;
    return;
  }
}
