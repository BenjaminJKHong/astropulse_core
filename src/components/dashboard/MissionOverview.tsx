"use client";

import Link from "next/link";
import { PageHeading } from "@/components/ui/PageHeading";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { WarningDemoControl } from "@/components/warnings/WarningDemoControl";
import { CriticalWarningBanner } from "@/components/warnings/CriticalWarningBanner";
import { useWarningState } from "@/components/warnings/WarningStateProvider";
import { missionTelemetry } from "@/data/telemetry";
import { simulatedCrewStreamCount } from "@/data/crew-streams";
import { TelemetryChart } from "./TelemetryChart";
import { RadiationWidget } from "./RadiationWidget";
import { AlertsPanel } from "./AlertsPanel";
import { AnalysisPreview } from "./AnalysisPreview";
import { CrewStreams } from "./CrewStreams";

export function MissionOverview() {
  const { state } = useWarningState();
  const critical = state === "CRITICAL";
  const trendsHref = "/biometric-trends";

  return <>
    <div className="dashboard-heading-row">
      <PageHeading
        title="Mission Overview"
        description="Crew health, live stream state and incoming medical alerts at a glance"
        badge={critical ? "CRITICAL MODE" : "WAITING FOR TELEMETRY"}
      />
      <WarningDemoControl />
      <div className="dashboard-meta" aria-label="Telemetry reporting status">
        <span><i className="status-dot status-dot-amber" aria-hidden="true" />WEBSOCKET · UNKNOWN</span>
        <span>LAST UPDATED · NOT REPORTED</span>
        <span>DEMO STREAMS · {simulatedCrewStreamCount} SIMULATED</span>
        <Link href={trendsHref}>VIEW ALL TRENDS →</Link>
      </div>
    </div>
    <CriticalWarningBanner />
    <div className="summary-grid">
      <SummaryCard label="CREW STREAMS" value="—" detail="NOT REPORTED" note="Waiting for telemetry" />
      <SummaryCard label="HEART RATE" value="—" detail={critical ? "CRITICAL · DEMO" : "BPM · WAITING"} note={critical ? "Value not reported · demo state" : "No measurement received"} tone={critical ? "red" : "green"} critical={critical} />
      <SummaryCard label="SpO₂" value="—" detail={critical ? "CRITICAL · DEMO" : "% · WAITING"} note={critical ? "Value not reported · demo state" : "No measurement received"} tone={critical ? "red" : "amber"} critical={critical} />
      <SummaryCard label="BLOOD PRESSURE" value="—" detail={critical ? "CRITICAL · DEMO" : "mmHg · WAITING"} note={critical ? "Value not reported · demo state" : "No measurement received"} tone={critical ? "red" : "amber"} critical={critical} />
    </div>
    <div className="overview-chart-grid">
      <Link className="chart-navigation-link" href={`${trendsHref}?metric=heartRate`} aria-label="Open heart rate biometric trends">
        <TelemetryChart title="HEART RATE" unit="BPM" data={missionTelemetry.heartRate} sourceState={missionTelemetry.sourceState} color="#35d07f" critical={critical} />
      </Link>
      <Link className="chart-navigation-link" href={`${trendsHref}?metric=spo2`} aria-label="Open SpO₂ biometric trends">
        <TelemetryChart title="SpO₂" unit="%" data={missionTelemetry.spo2} sourceState={missionTelemetry.sourceState} color="#f5b942" critical={critical} />
      </Link>
      <RadiationWidget critical={critical} />
    </div>
    <div className="overview-info-grid">
      <AlertsPanel critical={critical} />
      <AnalysisPreview />
    </div>
    <CrewStreams />
  </>;
}
