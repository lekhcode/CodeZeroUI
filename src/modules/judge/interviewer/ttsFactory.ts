import { AudioTtsQueue } from "./audioTtsQueue";
import { BrowserTtsQueue } from "./browserSpeech";
import { loadVoiceProfile, type InterviewTone } from "./voiceProfile";

/** Shared surface for BrowserTtsQueue and AudioTtsQueue. */
export type InterviewerTtsQueue = {
  configure: (handlers: {
    onIdle?: () => void;
    onStart?: () => void;
    onError?: (m: string) => void;
    onFirstAudio?: (ms: number) => void;
  }) => void;
  clear: () => void;
  enqueue: (text: string, tone?: InterviewTone) => void;
  unlock?: () => void;
  beginTurn?: () => void;
};

export function createTtsQueue(): InterviewerTtsQueue {
  const profile = loadVoiceProfile();
  if (profile.ttsEngine === "neural") {
    return new AudioTtsQueue();
  }
  // Adapt BrowserTtsQueue.enqueue(text) to ignore tone.
  const browser = new BrowserTtsQueue();
  return {
    configure: (h) => browser.configure(h),
    clear: () => browser.clear(),
    enqueue: (text: string) => browser.enqueue(text),
  };
}
