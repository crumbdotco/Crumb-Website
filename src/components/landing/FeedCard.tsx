import { Post } from "./data";
import { ScorePuck } from "./ScorePuck";

interface FeedCardProps {
  post: Post;
}

export function FeedCard({ post }: FeedCardProps) {
  return (
    <div className="fcard">
      <div className="top">
        <img className="av" src={`/media/people/${post.person}`} alt="" />
        <div style={{ flex: 1 }}>
          <div className="n">{post.name}</div>
          <div className="t">posted a place</div>
        </div>
      </div>
      <div className="pic">
        <img src={`/media/food/${post.food}`} alt={post.place} loading="lazy" />
        <span className="tag">{post.place}</span>
      </div>
      <div className="body">
        <div className="row1">
          <div className="place">
            {post.place}
            <small>{post.context}</small>
          </div>
          <ScorePuck score={post.score} />
        </div>
        <div className="tk">&quot;{post.take}&quot;</div>
        <div className="rx">
          {post.reactions.map(([emoji, count]) => (
            <span key={emoji}>
              {emoji} {count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
