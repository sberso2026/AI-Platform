export default function DigitalTwinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-testid="digital-twin-shell"
      data-module-version="0.11.0-digital-thread"
      data-module-status="digital_thread"
    >
      <nav aria-label="Digital Twin sections">
        <a href="/engineering/apps/digital-twin">Digital Thread</a>
      </nav>
      {children}
    </div>
  );
}
