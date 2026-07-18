import { posts } from "./data";
import { FeedCard } from "./FeedCard";

export function FeedMarquee() {
  const setA = posts.slice(0, 4);
  const setB = posts.slice(4).concat(posts.slice(0, 1));

  return (
    <section id="feed" className="feed">
      <div className="wrap">
        <div className="shead reveal">
          <span className="eyebrow">The feed</span>
          <h2>
            See what your friends are <em className="s">actually</em> eating.
          </h2>
          <p>No influencers, no ads dressed up as reviews. Just real takes from the people you know.</p>
        </div>
      </div>
      <div className="marquee reveal">
        <div className="mtrack a">
          {setA.concat(setA).map((post, i) => (
            <FeedCard key={`a-${i}-${post.place}`} post={post} />
          ))}
        </div>
      </div>
      <div className="marquee reveal" style={{ marginTop: 20 }}>
        <div className="mtrack b">
          {setB.concat(setB).map((post, i) => (
            <FeedCard key={`b-${i}-${post.place}`} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
