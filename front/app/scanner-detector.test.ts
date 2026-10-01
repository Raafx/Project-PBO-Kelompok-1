import { describe, expect, it } from "vitest";
import { ScannerDetector } from "./scanner-detector";

describe("ScannerDetector", () => {
  it("mengklasifikasikan burst cepat panjang minimal enam sebagai scan", () => {
    const detector = new ScannerDetector();
    const keys = [..."12*8998866200224"];
    const results = keys.map((key, index) => detector.push(key, index * 10));
    const completed = detector.push("Enter", keys.length * 10);

    expect(results[0]).toEqual({ type: "manual" });
    expect(results[1]).toEqual({ type: "burst", started: true });
    expect(completed).toEqual({ type: "scan", value: "12*8998866200224" });
  });

  it("membiarkan ketikan manual dengan jeda normal", () => {
    const detector = new ScannerDetector();
    const results = [..."8998866"].map((key, index) => detector.push(key, index * 60));
    const completed = detector.push("Enter", 7 * 60);

    expect(results.every((result) => result.type === "manual")).toBe(true);
    expect(completed).toEqual({ type: "manual" });
  });

  it("mengharuskan Enter masih berada dalam ambang burst", () => {
    const detector = new ScannerDetector();
    [..."8998866"].forEach((key, index) => detector.push(key, index * 10));
    expect(detector.push("Enter", 200)).toEqual({ type: "manual" });
  });
});
