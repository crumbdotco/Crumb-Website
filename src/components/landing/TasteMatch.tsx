const RECOS = [
  { image: "steak.jpg", name: "Blacklock", context: "Soho, Steak", match: "94%" },
  { image: "carbonara.jpg", name: "Bancone", context: "Covent Garden, Italian", match: "91%" },
  { image: "burrata.jpg", name: "Norma", context: "Fitzrovia, Italian", match: "88%" },
];

export function TasteMatch() {
  return (
    <section id="discover">
      <div className="wrap">
        <div className="feat">
          <div className="feat-copy reveal">
            <span className="eyebrow">Taste match</span>
            <h2>
              Find the people who <em className="s">eat like you</em>.
            </h2>
            <p>
              Every friend gets a taste match score. The higher it is, the more likely you will agree on
              where to eat. Discover ranks new spots the same way, so your next favourite is picked for
              the way you actually eat.
            </p>
          </div>
          <div className="feat-media reveal">
            <div className="match-card">
              <div className="match-top">
                <img className="av" src="/media/people/arena.jpg" alt="" style={{ width: 62, height: 62 }} />
                <div className="match-line" />
                <img className="av" src="/media/people/canal.jpg" alt="" style={{ width: 62, height: 62 }} />
              </div>
              <div className="match-pct">
                87%
                <small>You and Zayn, matched</small>
              </div>
              <div className="reco">
                {RECOS.map((r) => (
                  <div className="r" key={r.name}>
                    <div className="pic">
                      <img src={`/media/food/${r.image}`} alt="" />
                    </div>
                    <div className="n">
                      {r.name}
                      <small>{r.context}</small>
                    </div>
                    <div className="m">{r.match}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
