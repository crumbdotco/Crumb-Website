const GROUP_ROWS = [
  { image: "ramen.jpg", name: "Maki & Ramen", context: "Soho, Japanese", votes: "3 in" },
  { image: "noodles.jpg", name: "Master Wei", context: "Bloomsbury, Chinese", votes: "2 in" },
  { image: "pizza.jpg", name: "Pizza Union", context: "Kings Cross, Pizza", votes: "1 in" },
];

const FACES = ["canal.jpg", "arena.jpg", "concert.jpg", "mirror.jpg"];

export function Groups() {
  return (
    <section id="groups" className="feed">
      <div className="wrap">
        <div className="feat rev">
          <div className="feat-media reveal">
            <div className="gcard">
              <div className="gh">
                <div className="title">
                  Friday dinner
                  <small>4 friends deciding</small>
                </div>
                <div className="faces">
                  {FACES.map((face) => (
                    <img className="av" src={`/media/people/${face}`} alt="" key={face} />
                  ))}
                </div>
              </div>
              <div className="glist">
                {GROUP_ROWS.map((r) => (
                  <div className="grow" key={r.name}>
                    <div className="pic">
                      <img src={`/media/food/${r.image}`} alt="" />
                    </div>
                    <div className="n">
                      {r.name}
                      <small>{r.context}</small>
                    </div>
                    <div className="votes">{r.votes}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="feat-copy reveal">
            <span className="eyebrow">Groups</span>
            <h2>
              Deciding where to eat, <em className="s">sorted</em>.
            </h2>
            <p>
              Make a shared list with your friends, drop in the places you all want to try, and let
              everyone vote. No more group chat that ends with nobody eating anything.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
