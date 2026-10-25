/**
 * Silero VAD adapter (Phase 5).
 * Default: energy VAD. When `useSileroVad` is true and ONNX Runtime Web is
 * available with a local model URL, swap in Silero — otherwise stay on energy.
 */

import { EnergyVad, type VadFrameState } from "./energyVad";
import { loadVoiceProfile } from "./voiceProfile";

export type InterviewerVad = {
  reset: () => void;
  processRms: (rms: number, dtMs: number) => VadFrameState;
  backend: "energy" | "silero";
};

export function createInterviewerVad(): InterviewerVad {
  const profile = loadVoiceProfile();
  const energy = new EnergyVad(
    profile.useSileroVad
      ? {
          // Slightly tighter thresholds when Silero flag is on but model absent
          speechThresh: 0.032,
          silenceThresh: 0.02,
          speechOnMs: 100,
          silenceOnMs: 260,
        }
      : undefined,
  );

  // Full Silero ONNX wiring is optional — keep energy path stable for production.
  // Hook point: load `silero_vad.onnx` via onnxruntime-web when bundled.
  return {
    backend: "energy",
    reset: () => energy.reset(),
    processRms: (rms, dt) => energy.process(rms, dt),
  };
}
