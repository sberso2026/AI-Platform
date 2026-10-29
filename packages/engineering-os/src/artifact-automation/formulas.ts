const FORMULA_CELL = /^[A-Z]{1,3}[1-9][0-9]{0,6}$/;
const GOVERNED_FORMULA = /^=?[A-Z]{1,3}[1-9][0-9]{0,6}[+\-/*][A-Z]{1,3}[1-9][0-9]{0,6}$/;

export function isGovernedFormula(formula: string) {
  const trimmed = formula.trim();
  return GOVERNED_FORMULA.test(trimmed);
}

export function normalizeGovernedFormula(formula: string) {
  const trimmed = formula.trim();
  if (!isGovernedFormula(trimmed)) throw new Error("ungoverned_formula");
  return trimmed.startsWith("=") ? trimmed.slice(1) : trimmed;
}

export function isFormulaInjectionRisk(value: string) {
  return /^[=+\-@]/.test(value);
}

export function escapeSpreadsheetText(value: string) {
  if (isFormulaInjectionRisk(value)) return `'${value}`;
  return value;
}

export function assertFormulaCell(cell: string) {
  if (!FORMULA_CELL.test(cell)) throw new Error("invalid_formula_cell");
}
