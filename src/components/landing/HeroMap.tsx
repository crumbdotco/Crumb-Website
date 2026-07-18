"use client";

import { useEffect, useRef } from "react";
import { HERE_POSITION, MAP_CENTER, MAP_ZOOM, scoreColor, spots } from "./data";
import type LeafletType from "leaflet";

export function HeroMap() {
  const mapRef = useRef<InstanceType<typeof LeafletType.Map> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await import("leaflet/dist/leaflet.css");
        const L = (await import("leaflet")).default;
        if (cancelled) return;

        const container = document.getElementById("lmap");
        if (!container) return;

        const map = L.map("lmap", {
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          touchZoom: false,
          // `tap` is a valid Leaflet.Map option (mobile tap-delay workaround)
          // but missing from @types/leaflet's MapOptions.
          ...({ tap: false } as object),
        }).setView(MAP_CENTER, MAP_ZOOM);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          maxZoom: 20,
          detectRetina: true,
          subdomains: "abcd",
        }).addTo(map);

        L.marker(HERE_POSITION, {
          icon: L.divIcon({
            className: "here-di",
            html: '<div class="here2"><div class="r"></div><div class="d"></div></div>',
          }),
          interactive: false,
        }).addTo(map);

        spots.forEach((s, i) => {
          const html = `<div class="pinwrap floaty" style="animation-delay:${(i * 0.5).toFixed(
            1
          )}s"><div class="puck" style="background:${scoreColor(s.score)}"><b>${
            s.score
          }</b></div><div class="lab"><div class="n">${s.name}</div><div class="c">${
            s.context
          }</div></div></div>`;
          L.marker([s.lat, s.lng], {
            icon: L.divIcon({ className: "pin-di", html, iconSize: [0, 0], iconAnchor: [0, 0] }),
            interactive: false,
          }).addTo(map);
        });

        mapRef.current = map;
        window.setTimeout(() => map.invalidateSize(), 200);

        const onResize = () => map.invalidateSize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
      } catch {
        const el = document.getElementById("lmap");
        if (el) el.style.background = "linear-gradient(rgba(233,222,205,.5),rgba(233,222,205,.5)),#EFE5D6";
      }
    }

    const cleanupPromise = init();

    return () => {
      cancelled = true;
      cleanupPromise.then((cleanup) => cleanup?.());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div id="lmap" aria-hidden="true" />;
}
