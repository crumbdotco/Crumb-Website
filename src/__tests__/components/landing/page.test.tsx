import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

jest.mock("leaflet", () => ({
  __esModule: true,
  default: {
    map: () => ({
      setView: jest.fn().mockReturnThis(),
      remove: jest.fn(),
      invalidateSize: jest.fn(),
    }),
    tileLayer: () => ({ addTo: jest.fn() }),
    marker: () => ({ addTo: jest.fn() }),
    divIcon: jest.fn(),
  },
}));

jest.mock("leaflet/dist/leaflet.css", () => ({}), { virtual: true });

jest.mock("lenis", () => {
  return jest.fn().mockImplementation(() => ({
    raf: jest.fn(),
    scrollTo: jest.fn(),
    destroy: jest.fn(),
  }));
});

window.matchMedia =
  window.matchMedia ||
  ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }) as unknown as MediaQueryList);

global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver;

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ count: 10, remaining: 90, closed: false }),
  })
) as jest.Mock;

describe("Home page composition", () => {
  it("renders the landing sections without crashing", () => {
    render(<Home />);

    expect(screen.getAllByText("Crumbify").length).toBeGreaterThan(0);
    expect(screen.getByText(/Your city, scored/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /loop/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Founding member/i).length).toBeGreaterThan(0);
  });
});
