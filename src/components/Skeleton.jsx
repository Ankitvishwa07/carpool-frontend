export function SkeletonText({ className = "w-full h-4" }) {
  return <div className={`skeleton-box rounded-lg ${className}`} />;
}

export function SkeletonCard({ className = "h-40" }) {
  return (
    <div className={`glass-card rounded-2xl p-6 border border-emerald-100 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full skeleton-box shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="w-1/3 h-4 skeleton-box rounded" />
          <div className="w-1/4 h-3 skeleton-box rounded" />
        </div>
      </div>
      <div className="w-full h-12 skeleton-box rounded-xl" />
      <div className="flex justify-between items-center">
        <div className="w-24 h-4 skeleton-box rounded" />
        <div className="w-20 h-8 skeleton-box rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr className="border-b border-emerald-50">
      <td className="px-4 py-4"><div className="w-32 h-4 skeleton-box rounded" /></td>
      <td className="px-4 py-4"><div className="w-40 h-4 skeleton-box rounded" /></td>
      <td className="px-4 py-4"><div className="w-16 h-5 skeleton-box rounded-full" /></td>
      <td className="px-4 py-4"><div className="w-16 h-4 skeleton-box rounded" /></td>
      <td className="px-4 py-4"><div className="w-20 h-5 skeleton-box rounded-full" /></td>
      <td className="px-4 py-4 text-right"><div className="w-24 h-8 skeleton-box rounded-xl ml-auto" /></td>
    </tr>
  );
}

export function SkeletonStat() {
  return (
    <div className="glass-card rounded-2xl p-4 border border-emerald-100 space-y-2">
      <div className="w-20 h-3 skeleton-box rounded" />
      <div className="w-16 h-8 skeleton-box rounded" />
    </div>
  );
}

