/** Frame energy VAD used when Silero is off or unavailable (Phase 5). */

export type VadFrameState = "silence" | "speech";

export class EnergyVad {
  private speechMs = 0;
  private silenceMs = 0;
  private state: VadFrameState = "silence";

  constructor(
    private opts: {
      speechThresh: number;
      silenceThresh: number;
      speechOnMs: number;
      silenceOnMs: number;
    } = {
      speechThresh: 0.035,
      silenceThresh: 0.022,
      speechOnMs: 120,
      silenceOnMs: 280,
    },
  ) {}

  reset(): void {
    this.speechMs = 0;
    this.silenceMs = 0;
    this.state = "silence";
  }

  /** Update with RMS 0..1 and frame duration ms; returns current state. */
  process(rms: number, dtMs: number): VadFrameState {
    if (rms >= this.opts.speechThresh) {
      this.speechMs += dtMs;
      this.silenceMs = 0;
      if (this.speechMs >= this.opts.speechOnMs) this.state = "speech";
    } else if (rms <= this.opts.silenceThresh) {
      this.silenceMs += dtMs;
      this.speechMs = 0;
      if (this.silenceMs >= this.opts.silenceOnMs) this.state = "silence";
    }
    return this.state;
  }

  get current(): VadFrameState {
    return this.state;
  }
}
