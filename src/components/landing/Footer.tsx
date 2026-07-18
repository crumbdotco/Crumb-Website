import { CookieMark } from "./CookieMark";

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div className="footer-brand">
            <div className="brand" style={{ display: "flex", alignItems: "center", gap: 11, fontFamily: "var(--disp)", fontWeight: 700 }}>
              <CookieMark bite="#1A1208" />
              Crumbify
            </div>
            <p>Every bite tells a story.</p>
          </div>
          <div className="fcol">
            <h4>App</h4>
            <a href="#how">How it works</a>
            <a href="#feed">The feed</a>
            <a href="#discover">Discover</a>
            <a href="#groups">Groups</a>
          </div>
          <div className="fcol">
            <h4>Company</h4>
            <a href="/support">Support</a>
            <a href="mailto:contact@crumbify.co.uk">contact@crumbify.co.uk</a>
            <a href="https://x.com/crumbifyco">X @crumbifyco</a>
          </div>
          <div className="fcol">
            <h4>Legal</h4>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/delete-account">Delete account</a>
          </div>
        </div>
        <div className="fbot">
          <span>&copy; Crumbify LTD</span>
          <span className="credit">Map data &copy; OpenStreetMap contributors, tiles &copy; CARTO</span>
          <span>Made warm, in the UK.</span>
        </div>
      </div>
    </footer>
  );
}
