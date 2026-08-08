/**
 * Phase 12G — TwinSimulationCalibration reserved stub only.
 * automaticSimulationCalibrationEnabled=false; shmSimulationCalibrationImplemented=false.
 */

export type TwinSimulationCalibration = {
  calibrationId: string;
  twinId: string;
  status: "reserved";
  implemented: false;
  automaticEnabled: false;
  shmCalibrationImplemented: false;
  notes: "Reserved for future calibration governance — not implemented in Phase 12G";
};

export function createTwinSimulationCalibrationStub(input: {
  calibrationId: string;
  twinId: string;
}): TwinSimulationCalibration {
  return {
    calibrationId: input.calibrationId,
    twinId: input.twinId,
    status: "reserved",
    implemented: false,
    automaticEnabled: false,
    shmCalibrationImplemented: false,
    notes: "Reserved for future calibration governance — not implemented in Phase 12G",
  };
}

export function assertCalibrationReserved(calibration: TwinSimulationCalibration): void {
  if (calibration.implemented || calibration.automaticEnabled) {
    throw new Error("simulation_calibration_must_remain_reserved");
  }
}
