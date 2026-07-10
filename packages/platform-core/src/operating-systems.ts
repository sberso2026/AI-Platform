import type { OperatingSystem, OperatingSystemId } from "@rtb/types";

export const OPERATING_SYSTEMS: OperatingSystem[] = [
  {
    id: "platform",
    name: "RTB AI Platform",
    description: "Core platform services and administration",
    icon: "Cpu",
    status: "installed",
    version: "0.2.0",
  },
  {
    id: "business",
    name: "Business Operating System",
    description: "AI-assisted business operations, finance, and strategy",
    icon: "Briefcase",
    status: "coming_soon",
  },
  {
    id: "engineering",
    name: "Engineering Operating System",
    description: "Engineering design, analysis, and project management",
    icon: "Wrench",
    status: "installed",
    version: "0.2.0",
  },
  {
    id: "industrial",
    name: "Industrial Operating System",
    description: "Manufacturing, process control, and industrial automation",
    icon: "Factory",
    status: "coming_soon",
  },
  {
    id: "fleet",
    name: "Fleet Operating System",
    description: "Vehicle fleet management, routing, and maintenance",
    icon: "Truck",
    status: "coming_soon",
  },
  {
    id: "infrastructure",
    name: "Infrastructure Operating System",
    description: "Civil infrastructure monitoring and asset management",
    icon: "Building2",
    status: "coming_soon",
  },
  {
    id: "smart-building",
    name: "Smart Building Operating System",
    description: "Building automation, energy, and occupant experience",
    icon: "Building",
    status: "coming_soon",
  },
  {
    id: "smart-city",
    name: "Smart City Operating System",
    description: "Urban systems integration and civic intelligence",
    icon: "MapPin",
    status: "coming_soon",
  },
  {
    id: "autonomous",
    name: "Autonomous Systems Operating System",
    description: "Robotics, drones, and autonomous vehicle operations",
    icon: "Bot",
    status: "coming_soon",
  },
];

export function getOperatingSystem(id: OperatingSystemId): OperatingSystem | undefined {
  return OPERATING_SYSTEMS.find((os) => os.id === id);
}

export function getInstalledOperatingSystems(): OperatingSystem[] {
  return OPERATING_SYSTEMS.filter((os) => os.status === "installed");
}

export function getAvailableOperatingSystems(): OperatingSystem[] {
  return OPERATING_SYSTEMS.filter((os) => os.status !== "coming_soon");
}
