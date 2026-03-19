/**
 * EtherealShadow component tests
 * Tests canvas rendering, prop defaults, ResizeObserver cleanup, and the draw loop.
 */
import React from "react";
import { render, act } from "@testing-library/react";
import { EtherealShadow } from "../../../components/ui/ethereal-shadow";

// --- Canvas mock ---
const mockClearRect = jest.fn();
const mockCreateRadialGradient = jest.fn();
const mockFillRect = jest.fn();
const mockGetImageData = jest.fn();
const mockPutImageData = jest.fn();
const mockAddColorStop = jest.fn();

const mockGradient = { addColorStop: mockAddColorStop };

const mockCtx = {
  clearRect: mockClearRect,
  createRadialGradient: mockCreateRadialGradient.mockReturnValue(mockGradient),
  fillRect: mockFillRect,
  getImageData: mockGetImageData.mockReturnValue({
    data: new Uint8ClampedArray(400),
  }),
  putImageData: mockPutImageData,
  fillStyle: "",
};

// --- ResizeObserver mock ---
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

class MockResizeObserver {
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = jest.fn();
}

// Captured RAF callback so we can invoke the draw loop manually
let capturedRafCallback: ((time: number) => void) | null = null;
let rafId = 0;

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockCtx) as typeof HTMLCanvasElement.prototype.getContext;
  global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
});

beforeEach(() => {
  capturedRafCallback = null;
  rafId = 0;
  mockClearRect.mockClear();
  mockCreateRadialGradient.mockClear().mockReturnValue(mockGradient);
  mockGetImageData.mockClear().mockReturnValue({ data: new Uint8ClampedArray(400) });
  mockAddColorStop.mockClear();
  mockFillRect.mockClear();
  mockPutImageData.mockClear();
  mockObserve.mockClear();
  mockDisconnect.mockClear();

  jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    capturedRafCallback = cb as (time: number) => void;
    rafId += 1;
    return rafId;
  });
  jest.spyOn(window, "cancelAnimationFrame").mockImplementation(jest.fn());
});

afterEach(() => {
  jest.restoreAllMocks();
});

/**
 * Helper: render the component and invoke the RAF draw callback so the canvas
 * draw path is exercised.
 */
function renderAndDraw(props: React.ComponentProps<typeof EtherealShadow> = {}) {
  const result = render(<EtherealShadow {...props} />);

  // Give the canvas parent element a non-zero rect so draw proceeds
  const canvas = result.container.querySelector("canvas") as HTMLCanvasElement;
  if (canvas) {
    // Simulate a parent element with dimensions
    Object.defineProperty(canvas, "parentElement", {
      value: {
        getBoundingClientRect: () => ({ width: 800, height: 600 }),
      },
      configurable: true,
    });
    // Set canvas dimensions so the 0-size guard is skipped
    Object.defineProperty(canvas, "width", { value: 800, writable: true, configurable: true });
    Object.defineProperty(canvas, "height", { value: 600, writable: true, configurable: true });
  }

  // Invoke the draw callback if captured
  if (capturedRafCallback) {
    act(() => {
      capturedRafCallback!(16); // 16ms first frame
    });
  }

  return result;
}

describe("EtherealShadow", () => {
  it("renders a canvas element", () => {
    const { container } = renderAndDraw();
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("applies w-full h-full class when sizing is fill", () => {
    const { container } = renderAndDraw({ sizing: "fill" });
    expect(container.querySelector("canvas")?.className).toContain("w-full");
    expect(container.querySelector("canvas")?.className).toContain("h-full");
  });

  it("does not apply fill size classes when sizing is contain", () => {
    const { container } = renderAndDraw({ sizing: "contain" });
    expect(container.querySelector("canvas")?.className).not.toContain("w-full h-full");
  });

  it("has pointer-events-none class", () => {
    const { container } = renderAndDraw();
    expect(container.querySelector("canvas")?.className).toContain("pointer-events-none");
  });

  it("has display:block style", () => {
    const { container } = renderAndDraw();
    expect(container.querySelector("canvas")).toHaveStyle({ display: "block" });
  });

  it("requests animation frame on mount", () => {
    renderAndDraw();
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it("cancels animation frame on unmount", () => {
    const { unmount } = renderAndDraw();
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("calls ResizeObserver.disconnect on unmount", () => {
    const { unmount } = renderAndDraw();
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("calls getContext with '2d'", () => {
    renderAndDraw();
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith("2d");
  });

  it("accepts custom color prop without crashing", () => {
    expect(() => renderAndDraw({ color: "rgba(100, 200, 50, 0.5)" })).not.toThrow();
  });

  it("accepts custom animation scale and speed props without crashing", () => {
    expect(() => renderAndDraw({ animation: { scale: 80, speed: 20 } })).not.toThrow();
  });

  it("accepts zero noise opacity and skips noise overlay path", () => {
    // noise.opacity === 0 means the noise overlay branch is skipped
    expect(() => renderAndDraw({ noise: { opacity: 0, scale: 1 } })).not.toThrow();
  });

  it("exercises the noise overlay code path when opacity > 0", () => {
    // noise.opacity > 0 triggers getImageData + putImageData
    renderAndDraw({ noise: { opacity: 0.5, scale: 1 } });
    // clearRect is called in the draw loop
    expect(mockClearRect).toHaveBeenCalled();
  });

  it("calls clearRect in every draw frame", () => {
    renderAndDraw();
    expect(mockClearRect).toHaveBeenCalled();
  });

  it("creates radial gradients for each blob (4 blobs)", () => {
    renderAndDraw({ noise: { opacity: 0, scale: 1 } });
    // 4 blobs per draw frame
    expect(mockCreateRadialGradient).toHaveBeenCalledTimes(4);
  });

  it("calls addColorStop for each gradient (3 stops × 4 blobs)", () => {
    renderAndDraw({ noise: { opacity: 0, scale: 1 } });
    expect(mockAddColorStop).toHaveBeenCalledTimes(12); // 4 blobs × 3 stops
  });

  it("calls fillRect for each blob", () => {
    renderAndDraw({ noise: { opacity: 0, scale: 1 } });
    expect(mockFillRect).toHaveBeenCalledTimes(4);
  });

  it("replaces color alpha correctly in gradient color stops", () => {
    renderAndDraw({
      color: "rgba(139, 115, 85, 0.4)",
      noise: { opacity: 0, scale: 1 },
    });
    // The mid gradient stop replaces the alpha
    expect(mockAddColorStop).toHaveBeenCalledWith(
      0.5,
      expect.stringMatching(/rgba\(139, 115, 85, 0\.15\)/)
    );
    expect(mockAddColorStop).toHaveBeenCalledWith(1, "transparent");
  });

  it("skips drawing and re-queues RAF when canvas dimensions are zero", () => {
    const result = render(<EtherealShadow />);
    const canvas = result.container.querySelector("canvas") as HTMLCanvasElement;

    // Canvas with zero dimensions — simulate the early return path
    Object.defineProperty(canvas, "width", { value: 0, writable: true, configurable: true });
    Object.defineProperty(canvas, "height", { value: 0, writable: true, configurable: true });

    // Invoke the draw callback with zero-sized canvas
    if (capturedRafCallback) {
      act(() => {
        capturedRafCallback!(16);
      });
    }

    // Should NOT call clearRect because we return early
    expect(mockClearRect).not.toHaveBeenCalled();
    // Should re-queue RAF (called again from the early-return path)
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
  });
});
