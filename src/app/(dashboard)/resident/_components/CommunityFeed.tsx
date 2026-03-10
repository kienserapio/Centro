type PostMeta = { icon: string; label: string };

type Post = {
  id: number;
  iconBg: string;
  icon: string;
  iconColor: string;
  badgeLabel: string;
  badgeClass: string;
  timeAgo: string;
  title: string;
  body: string;
  meta?: PostMeta[];
  hasActions?: boolean;
};

const POSTS: Post[] = [
  {
    id: 1,
    iconBg: "bg-secondary/10",
    icon: "groups",
    iconColor: "text-secondary",
    badgeLabel: "HOA MEETING",
    badgeClass: "bg-secondary/10 text-secondary",
    timeAgo: "2 hours ago",
    title: "General Assembly for Phase 1 & 2",
    body: "Discussion on the new security measures and playground renovation projects. Your presence is highly encouraged to reach a quorum.",
    meta: [
      { icon: "schedule", label: "Saturday, 10:00 AM" },
      { icon: "place", label: "Clubhouse" },
    ],
    hasActions: true,
  },
  {
    id: 2,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    icon: "cleaning_services",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeLabel: "MAINTENANCE",
    badgeClass:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    timeAgo: "Yesterday",
    title: "Scheduled Water Interruption",
    body: "Please be advised of a temporary water service interruption on Wednesday from 1 PM to 4 PM for pump maintenance.",
  },
];

export function CommunityFeed() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[24px] font-semibold text-[#111827]">Community Wall</h2>
        <button className="text-sm text-secondary font-semibold hover:underline">
          View All Posts
        </button>
      </div>

      {POSTS.map((post) => (
        <article
          key={post.id}
          className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-md hover:border-secondary/30 transition-all"
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-full ${post.iconBg} flex items-center justify-center shrink-0`}
            >
              <span className={`material-icons-round ${post.iconColor}`}>
                {post.icon}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${post.badgeClass}`}
                >
                  {post.badgeLabel}
                </span>
                <span className="text-xs text-slate-400">• {post.timeAgo}</span>
              </div>

              <h3 className="text-xl font-bold mb-3">{post.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {post.body}
              </p>

              {post.meta && (
                <div className="flex items-center gap-4 py-3 border-t border-[#E5E7EB]">
                  {post.meta.map((m) => (
                    <div
                      key={m.label}
                      className="flex items-center gap-1.5 text-[#6B7280] text-sm"
                    >
                      <span className="material-icons-round text-sm">
                        {m.icon}
                      </span>
                      {m.label}
                    </div>
                  ))}
                </div>
              )}

              {post.hasActions && (
                <div className="flex gap-2 pt-2">
                  <button className="px-5 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-secondary/90 transition-all">
                    I&apos;m Going
                  </button>
                  <button className="px-5 py-2 border border-secondary text-secondary rounded-lg font-medium hover:bg-secondary/5 transition-all">
                    Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
