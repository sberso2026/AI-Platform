import {
  DEFAULT_DEFLECTION_LIMIT_GUESSED,
  SPAN_RATIO_DENOMINATOR_GUESSED,
  VIBRATION_DESIGN_IMPLEMENTED,
} from "@rtb/types";
import { rejectUnknownCodeParameter } from "../au-tension/authority";

export function requestDefaultDeflectionLimit(): never {
  if (DEFAULT_DEFLECTION_LIMIT_GUESSED) throw new Error("default deflection limit must not be guessed");
  return rejectUnknownCodeParameter("defaultDeflectionLimitLn");
}

export function requestGuessedSpanRatioDenominator(): never {
  if (SPAN_RATIO_DENOMINATOR_GUESSED) throw new Error("span-ratio denominator must not be guessed");
  return rejectUnknownCodeParameter("spanRatioDenominator");
}

export function requestVibrationDesign(): never {
  if (VIBRATION_DESIGN_IMPLEMENTED) throw new Error("vibration design must not be implemented in AU-6");
  return rejectUnknownCodeParameter("vibrationDesign");
}
