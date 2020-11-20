const stepMarker = document.querySelector(".step-marker");
const currentStepDisplay = document.querySelector(
  ".main-controls .current-step .number"
);
const buttonPlayPause = document.querySelector(".main-controls .play-pause");
const bpmInput = document.querySelector(".main-controls .bpm input");
const keys = document.querySelectorAll(".channel .key");
const btsToggle = document.querySelectorAll(".bt-toggle");

const channels = [
  {
    component: document.querySelector(".channel.am"),
    synthesizer: new Tone.AMSynth({
      oscillator: {
        volume: 5,
        count: 2,
        spread: 2,
        type: "fatsawtooth",
      },
    }),
    tune: 6,
    gain: 0.4,
  },
  {
    component: document.querySelector(".channel.fm"),
    synthesizer: new Tone.FMSynth({
      oscillator: {
        volume: 5,
        count: 5,
        spread: 6,
        type: "fatsawtooth",
      },
    }),
    tune: 5,
    gain: 0.2,
  },
  {
    component: document.querySelector(".channel.synth"),
    synthesizer: new Tone.Synth({
      oscillator: {
        volume: 5,
        count: 4,
        spread: 5,
        type: "fatsawtooth",
      },
    }),
    tune: 5,
    gain: 0.05,
  },
  {
    component: document.querySelector(".channel.metal"),
    synthesizer: new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.1,
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 2,
    }),
    tune: 5,
    gain: 0.5,
  },
  {
    component: document.querySelector(".channel.membrane"),
    synthesizer: new Tone.MembraneSynth({
      envelope: { attack: 0.1, decay: 0.1, sustain: 1, release: 1 },
    }),
    tune: 1,
    gain: 1,
  },
];

const setup = () => {
  for (const channel of channels) {
    channel.synthesizer.connect(new Tone.Gain(channel.gain).toDestination());
  }
  Tone.Transport.scheduleRepeat(repeat, "16n");
  Tone.Transport.bpm.value = 85;
};

const setBPM = (event) => {
  const newBpm = event.target.value <= 200 ? event.target.value : 200;
  Tone.Transport.bpm.value = newBpm;
};

let currentStep = 0;
const repeat = (time) => {
  for (const channel of channels) {
    const keys = channel.component.querySelectorAll(".key");
    const key = keys[currentStep];
    const note = key.querySelector(".note").value;
    const duration = key.querySelector(".duration").value;
    const channelIsActive = channel.component
      .querySelector(".bt-toggle")
      .className.includes("on");
    const keyIsActive = key
      .querySelector(".bt-toggle")
      .className.includes("on");

    setMarkerPosition(keys, currentStep);

    if (channelIsActive && keyIsActive && note.length) {
      channel.synthesizer.triggerAttackRelease(
        note + channel.tune,
        duration + "n",
        time,
        channel.attack
      );

      console.log(`NOTE: ${note} | DURATION: ${duration}`);
    }

    updateCurrentStepDisplay(currentStep);
  }
  if (currentStep == 31) {
    currentStep = 0;
    return;
  }
  currentStep++;
};

const setChannelGain = (event, channel) => {
  channel.gain = event.target.value;
};

const setChannelTune = (event, channel) => {
  channel.tune = event.target.value;
};

let isPlaying = false;
const toggleStartStop = () => {
  if (isPlaying) {
    buttonPlayPause.textContent = "PLAY";
    Tone.Transport.stop();
  } else {
    buttonPlayPause.textContent = "PAUSE";
    Tone.Transport.start();
  }
  isPlaying = !isPlaying;
};

const toggleButton = (button) => {
  const buttonTitle = button.querySelector(".text");
  if (!button.className.includes("on")) {
    button.classList.add("on");
    buttonTitle.textContent = "ON";
  } else {
    button.classList.remove("on");
    buttonTitle.textContent = "OFF";
  }
};

const enumKeys = () => {
  for (const channel of channels) {
    const channelKeys = channel.component.querySelectorAll(".key");

    channelKeys.forEach((channelKey, index) => {
      channelKey.querySelector(".index").textContent = index + 1;
    });
  }
};

const setChannelsValues = () => {
  for (const channel of channels) {
    channel.component.querySelector(".gain").value = channel.gain;
    channel.component.querySelector(".tune").value = channel.tune;
  }
};

const updateCurrentStepDisplay = (currentStep) => {
  currentStepDisplay.textContent = currentStep + 1;
};

const setMarkerPosition = (keys, position) => {
  for (const key of keys) key.classList.remove("on");
  keys[position].classList.add("on");
};

const bindEvents = () => {
  document.documentElement.addEventListener("click", () => {
    if (Tone.context.state !== "running") {
      Tone.context.resume();
      console.clear();
    }
  });

  for (const button of btsToggle) {
    button.addEventListener("click", () => {
      toggleButton(button);
    });
  }

  for (const channel of channels) {
    channel.component
      .querySelector(".controls .gain")
      .addEventListener("input", (event) => {
        setChannelGain(event, channel);
      });
    channel.component
      .querySelector(".controls .tune")
      .addEventListener("input", (event) => {
        setChannelTune(event, channel);
      });
  }

  bpmInput.addEventListener("input", setBPM);

  buttonPlayPause.addEventListener("click", toggleStartStop);
};

const init = () => {
  setChannelsValues();
  enumKeys();
  bindEvents();
  setup();
};

init();
