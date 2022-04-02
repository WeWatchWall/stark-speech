# Stark-speech

[![NPM version](https://img.shields.io/npm/v/stark-speech.svg)](https://www.npmjs.com/package/stark-speech)
Easy to integrate speech functions for browsers.

## Install

```bash
npm i stark-speech

```

Your page depends on the hotword detection model, that has three assets.
They load via HTTP at runtime and need to be copied to your project.

The assets are called:

```bash
{base_url}/model.json
{base_url}/metadata.json
{base_url}/weights.bin
```

[An example model is here.](https://github.com/WeWatchWall/stark-speech/tree/main/assets)
The example verbally responds to "Stark" and, by coincidence, "Jarvis".
Other models can be trained on the [TeachableMachine site](https://teachablemachine.withgoogle.com/).

## API Reference

### 1. Initialize

```typescript
import StarkSpeech from 'stark-speech';

async function Main () {
  let starkSpeech = StarkSpeech.init(
    1e3, // Default = 8e2  Wait time before returning a result.
    0.9, // Default = 0.93 Accuracy of prediction for hotword detection.
    0.5, // Default = 0.75 Inverse times hotword is checked per second. 1/0.5 = 2 times/second.
    "https://myWebpage.org" // Default = { location.href } Base URL where the hotword model is located.
  );
}
Main();
```

This library follows the singleton pattern due to issues with re-use of the microphone.
Subsequent calls to StarkSpeech.init() will return the first instance and the new arguments are ignored.  

### 2. API Reference

a. Speak

```typescript
import StarkSpeech from 'stark-speech';

async function Main () {
  // ... initialize

  await starkSpeech.speak("Hello world!!");
}
Main();
```

b. Listen With Browser Engine (Online)

```typescript
import StarkSpeech from 'stark-speech';

async function Main () {
  // ... initialize

  let userMonologues = await starkSpeech.listen();
}
Main();
```

Obviously this method will not usually work without without a network connection.
Further, at least for mobile, the screen needs to be on.

c. Listen for Hotword (Offline)

```typescript
import StarkSpeech from 'stark-speech';

async function Main () {
  // ... initialize

  await starkSpeech.listenBackground();
  console.log("Hotword detected!");
}
Main();
```

The first time this method is invoked, the offline detection engine is initialized.
That can take one or more seconds.

### 3. Usage

This library is about the automation of speech in the browser.
Communication patterns are now simple to implement, for example this parrot loop:

```typescript
import StarkSpeech from 'stark-speech';

async function Main () {
  // ... initialize

  while(true) {
    await starkSpeech.speak("What's my name?");
    await starkSpeech.listenBackground();
    await starkSpeech.speak("Got a cracker?");
    await starkSpeech.speak(`You said ${await starkSpeech.listen();}`);
  }
}
Main();
```

### TODO

- Offline hotword detection on a WebWorker
- Voiceprint training & validation through transfer learning