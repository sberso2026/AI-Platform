import type {
  ControlImplementationReference,
  ControlLifecycle,
  SecurityControl,
} from "../contracts";
import { SEED_CONTROLS, SEED_IMPLEMENTATIONS } from "./seed-controls";

const LIFECYCLE_ORDER: ControlLifecycle[] = [
  "draft",
  "active",
  "deprecated",
  "retired",
];

function assertLifecycleTransition(
  from: ControlLifecycle,
  to: ControlLifecycle,
): void {
  const fi = LIFECYCLE_ORDER.indexOf(from);
  const ti = LIFECYCLE_ORDER.indexOf(to);
  if (ti < fi) {
    throw new Error(`Invalid control lifecycle transition ${from} → ${to}`);
  }
}

export class SecurityControlRegistry {
  readonly kind = "security_control_registry" as const;
  private controls = new Map<string, SecurityControl>();
  private implementations = new Map<string, ControlImplementationReference>();

  constructor(
    seedControls: SecurityControl[] = SEED_CONTROLS,
    seedImpls: ControlImplementationReference[] = SEED_IMPLEMENTATIONS,
  ) {
    for (const c of seedControls) this.registerControl(c);
    for (const i of seedImpls) this.registerImplementation(i);
  }

  registerControl(control: SecurityControl): void {
    if (!control.controlId || !control.title || !control.category) {
      throw new Error("Invalid SecurityControl schema");
    }
    this.controls.set(control.controlId, control);
  }

  registerImplementation(impl: ControlImplementationReference): void {
    if (!impl.authoritative) {
      throw new Error("Implementation refs must be authoritative Platform pointers");
    }
    if (!this.controls.has(impl.controlId)) {
      throw new Error(`Unknown control for implementation: ${impl.controlId}`);
    }
    this.implementations.set(impl.implementationId, impl);
  }

  transitionLifecycle(controlId: string, to: ControlLifecycle): SecurityControl {
    const current = this.require(controlId);
    assertLifecycleTransition(current.lifecycle, to);
    const next = { ...current, lifecycle: to };
    this.controls.set(controlId, next);
    return next;
  }

  require(controlId: string): SecurityControl {
    const c = this.controls.get(controlId);
    if (!c) throw new Error(`Unknown control: ${controlId}`);
    return c;
  }

  list(lifecycle?: ControlLifecycle): SecurityControl[] {
    const all = [...this.controls.values()];
    return lifecycle ? all.filter((c) => c.lifecycle === lifecycle) : all;
  }

  listImplementations(controlId?: string): ControlImplementationReference[] {
    const all = [...this.implementations.values()];
    return controlId ? all.filter((i) => i.controlId === controlId) : all;
  }

  /** control defined ≠ control implemented */
  isImplemented(controlId: string): boolean {
    return this.listImplementations(controlId).length > 0;
  }
}
