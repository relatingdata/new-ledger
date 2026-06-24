// Journal entry validation and balancing.

export interface JournalLineInput {
  accountId: string;
  amount: number;
  entityId?: string;
  profitCenterId?: string;
  memo?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateBalancedEntry(
  lines: JournalLineInput[],
  precision: number
): ValidationResult {
  const errors: string[] = [];

  if (lines.length < 2) {
    errors.push("Journal entry must have at least 2 lines");
  }

  const sum = lines.reduce((s, l) => s + l.amount, 0);
  const tolerance = Math.pow(10, -precision);

  if (Math.abs(sum) > tolerance) {
    errors.push(
      `Entry is unbalanced: debits and credits differ by ${sum.toFixed(precision)}`
    );
  }

  const hasDebit = lines.some((l) => l.amount < 0);
  const hasCredit = lines.some((l) => l.amount > 0);
  if (!hasDebit || !hasCredit) {
    errors.push("Entry must have at least one debit and one credit");
  }

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].accountId) {
      errors.push(`Line ${i + 1}: account is required`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validatePeriodOpen(
  transdate: Date,
  closedTo: Date | null
): boolean {
  if (!closedTo) return true;
  return transdate > closedTo;
}

export function validateCashDiscount(
  invoiceDate: Date,
  paymentDate: Date,
  discountTerms: number
): boolean {
  const deadline = new Date(invoiceDate);
  deadline.setDate(deadline.getDate() + discountTerms);
  return paymentDate <= deadline;
}
