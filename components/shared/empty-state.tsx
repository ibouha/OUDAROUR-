import { PackageOpen } from "lucide-react";
export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { return <div className="empty-state"><PackageOpen size={29} strokeWidth={1.6} /><h3>{title}</h3><p style={{ margin:"0 0 18px", maxWidth:420 }}>{description}</p>{action}</div>; }
