export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <header className="page-header"><div><h1 className="page-title">{title}</h1>{description && <p className="page-subtitle">{description}</p>}</div>{action}</header>;
}
