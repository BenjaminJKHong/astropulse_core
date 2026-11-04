import Link from "next/link";

const navigationItems = [
  { label: "Mission Overview", icon: "◇", href: "/", current: true },
  { label: "Crew Monitoring", icon: "◉" },
  { label: "Health Analytics", icon: "⌁" },
  { label: "AI Flight Surgeon", icon: "✳" },
  { label: "Alert Center", icon: "⚑", alerts: "2" },
  { label: "Radiation Monitoring", icon: "○" },
  { label: "System Settings", icon: "⚙" },
];

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Mission navigation">
      <div className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">A</span>
        <span className="brand-copy">
          <span className="brand-name">ASTROGUARD</span>
          <span className="brand-caption">MISSION CONTROL</span>
        </span>
      </div>
      <div className="sidebar-rule" />
      <nav className="sidebar-navigation" aria-label="Operations">
        <p className="navigation-heading">OPERATIONS</p>
        <ul className="navigation-list">
          {navigationItems.map((item) => (
            <li key={item.label}>
              {item.current ? (
                <Link className="navigation-item navigation-item-current" href={item.href!} aria-current="page">
                  <span className="navigation-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className="navigation-item navigation-item-unavailable" aria-disabled="true" title={`${item.label} will be available in a later phase`}>
                  <span className="navigation-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.alerts ? <span className="navigation-count" aria-label={`${item.alerts} alerts`}>{item.alerts}</span> : null}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="connection-pill"><span className="status-dot status-dot-green" aria-hidden="true" />CONNECTED</div>
        <p className="sync-caption">DATA SYNC · 4s ago</p>
        <div className="operator-profile">
          <span className="operator-avatar" aria-hidden="true">MC</span>
          <span>MC · FLIGHT SURGEON</span>
        </div>
      </div>
    </aside>
  );
}
