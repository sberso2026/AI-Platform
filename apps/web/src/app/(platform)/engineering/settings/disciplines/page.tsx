"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";

type Capability = { key: string; declaredStatus: string; effectiveStatus: string };
type Row = {
  code: string;
  name: string;
  enabled: boolean;
  ownerId: string | null;
  readiness: string;
  capabilities: Capability[];
  toolBindings: Array<{ toolCode: string }>;
  standards: Array<{ standardCode: string }>;
};

export default function DisciplineSettingsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/engineering/discipline-intelligence")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setRows((json.data as Row[]) ?? []);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <Header
        title="Disciplines"
        description="Multidiscipline Intelligence Foundation. One canonical registry. SPACE GASS absence blocks certified Structural Analysis without disabling document/interface review."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Governed foundation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>LLMs must not replace deterministic engineering solvers.</p>
            <p>Discipline intelligence cannot independently approve design or certify compliance.</p>
            <p>SPACE GASS: NOT_CONFIGURED. STRUCTURAL LINEAR_STRUCTURAL_ANALYSIS: BLOCKED.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Canonical disciplines</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-2 pr-3">Discipline</th>
                  <th className="py-2 pr-3">Enabled</th>
                  <th className="py-2 pr-3">Owner</th>
                  <th className="py-2 pr-3">Readiness</th>
                  <th className="py-2 pr-3">Tools</th>
                  <th className="py-2 pr-3">Standards</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.code} className="border-b">
                    <td className="py-2 pr-3">
                      <Link className="font-medium underline-offset-2 hover:underline" href={`/engineering/settings/disciplines/${row.code}`}>
                        {row.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">{row.enabled ? "yes" : "no"}</td>
                    <td className="py-2 pr-3">{row.ownerId ?? "—"}</td>
                    <td className="py-2 pr-3">
                      <Badge variant="secondary">{row.readiness}</Badge>
                    </td>
                    <td className="py-2 pr-3">{row.toolBindings.map((t) => t.toolCode).join(", ") || "—"}</td>
                    <td className="py-2 pr-3">{row.standards.map((s) => s.standardCode).join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
