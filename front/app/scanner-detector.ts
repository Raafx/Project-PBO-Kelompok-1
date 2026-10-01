export const SCANNER_MAX_GAP_MS = 40;
export const SCANNER_MIN_LENGTH = 6;

export type ScannerDetectorResult =
  | { type: "manual" }
  | { type: "burst"; started: boolean }
  | { type: "scan"; value: string }
  | { type: "ignored" };

type ScannerDetectorOptions = {
  maxGapMs?: number;
  minLength?: number;
};

export class ScannerDetector {
  private readonly maxGapMs: number;
  private readonly minLength: number;
  private buffer = "";
  private lastAt: number | null = null;
  private burst = false;

  constructor(options: ScannerDetectorOptions = {}) {
    this.maxGapMs = options.maxGapMs ?? SCANNER_MAX_GAP_MS;
    this.minLength = options.minLength ?? SCANNER_MIN_LENGTH;
  }

  push(key: string, at: number): ScannerDetectorResult {
    if (key === "Enter") {
      const value = this.buffer;
      const enterContinuesBurst = this.lastAt !== null && at - this.lastAt < this.maxGapMs;
      const isScan = this.burst && enterContinuesBurst && value.length >= this.minLength;
      this.reset();
      return isScan ? { type: "scan", value } : { type: "manual" };
    }

    if (key.length !== 1) return { type: "ignored" };

    const continuesBurst = this.lastAt !== null && at - this.lastAt < this.maxGapMs;
    if (!continuesBurst) {
      this.buffer = key;
      this.lastAt = at;
      this.burst = false;
      return { type: "manual" };
    }

    this.buffer += key;
    this.lastAt = at;
    const started = !this.burst;
    this.burst = true;
    return { type: "burst", started };
  }

  reset() {
    this.buffer = "";
    this.lastAt = null;
    this.burst = false;
  }
}
