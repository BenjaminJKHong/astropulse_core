import { MainLayout } from "@/components/layout/MainLayout";

export default function Home() {
  return (
    <MainLayout>
      <section className="page-heading" aria-labelledby="page-title">
        <div>
          <h1 id="page-title">Mission Overview</h1>
          <p>Crew health monitoring and mission status at a glance</p>
        </div>
        <span className="simulated-badge">
          <span className="status-dot status-dot-amber" aria-hidden="true" />
          SIMULATED DATA
        </span>
      </section>
    </MainLayout>
  );
}
