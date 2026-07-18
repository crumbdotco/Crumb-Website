import { StoreBadges } from "./StoreBadges";

export function CTA() {
  return (
    <section className="cta">
      <div className="cta-media par" data-speed="0.2">
        <img src="/media/food/cta-dark.jpg" alt="" />
      </div>
      <div className="cta-in reveal">
        <h2>
          Your next favourite spot is <em className="s">one tap away</em>.
        </h2>
        <p>Crumbify is out now. Get it, add your friends, and start posting the places you love.</p>
        <StoreBadges />
      </div>
    </section>
  );
}
