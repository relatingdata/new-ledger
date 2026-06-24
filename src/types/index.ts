// Core domain types for new-ledger

// ─── Entity System ───────────────────────────────────────────────

export type EntityType =
  | "person"
  | "company"
  | "partnership"
  | "trust";

export type EntityRole =
  | "customer"
  | "vendor"
  | "employee"
  | "profit_center"
  | "department"
  | "warehouse"
  | "bank"
  | "tax_authority";

export type AddressType =
  | "billing"
  | "shipping"
  | "mailing"
  | "physical";

export type PhoneType =
  | "work"
  | "mobile"
  | "fax"
  | "home";

export type ContactType =
  | "primary"
  | "billing"
  | "technical"
  | "shipping";

export type RelationshipType =
  | "employment"
  | "subsidiary"
  | "partnership"
  | "director"
  | "parent_center"
  | "reports_to";

export interface Entity {
  id: string;
  entityType: EntityType;
  name: string;
  legalName?: string;
  taxId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntityRoleAssignment {
  id: string;
  entityId: string;
  role: EntityRole;
  active: boolean;
  since: Date;
  until?: Date;
}

export interface EntityAddress {
  id: string;
  entityId: string;
  addressType: AddressType;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  primary: boolean;
}

export interface EntityPhone {
  id: string;
  entityId: string;
  phoneType: PhoneType;
  number: string;
  primary: boolean;
}

export interface EntityContact {
  id: string;
  entityId: string;
  contactType: ContactType;
  name: string;
  email?: string;
  phoneId?: string;
}

export interface EntityRelationship {
  id: string;
  parentEntityId: string;
  childEntityId: string;
  relationshipType: RelationshipType;
  since: Date;
  until?: Date;
}

// ─── Chart of Accounts ──────────────────────────────────────────

export type AccountType =
  | "asset"
  | "liability"
  | "equity"
  | "income"
  | "expense";

export type AccountClass =
  | "ar"
  | "ap"
  | "bank"
  | "cash"
  | "tax"
  | "wages"
  | "retained_earnings"
  | "inventory"
  | "cogs"
  | "revenue"
  | "fx_gain_loss"
  | "discount"
  | "general";

export interface Account {
  id: string;
  accno: string;
  description: string;
  accountType: AccountType;
  accountClass: AccountClass;
  contra: boolean;
  active: boolean;
  parentId?: string;
}

// ─── Tax ─────────────────────────────────────────────────────────

export interface TaxRate {
  id: string;
  accountId: string;
  rate: number;
  description: string;
  validFrom: Date;
  validTo?: Date;
  pass: number;
}

// ─── General Ledger ─────────────────────────────────────────────

export type LedgerType = "actual" | "budget";

export interface JournalEntry {
  id: string;
  reference: string;
  description: string;
  transdate: Date;
  ledgerType: LedgerType;
  budgetId?: string;
  currency: string;
  exchangeRate: number;
  approved: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface JournalLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  amount: number;
  entityId?: string;
  profitCenterId?: string;
  memo?: string;
  source?: string;
  fxTransaction: boolean;
  cleared?: Date;
  projectId?: string;
  lineOrder: number;
}

// ─── Budgets ─────────────────────────────────────────────────────

export interface Budget {
  id: string;
  name: string;
  description?: string;
  fiscalYearStart: Date;
  fiscalYearEnd: Date;
  active: boolean;
}

// ─── Transaction Templates ("Canned" Journals) ─────────────────

export type PromptType =
  | "entity"
  | "amount"
  | "date"
  | "account"
  | "text"
  | "line_items";

export interface TransactionTemplate {
  id: string;
  name: string;
  description?: string;
  lines: TemplateLine[];
  prompts: TemplatePrompt[];
  numberingPrefix?: string;
  numberingSequence?: string;
  defaultLedgerType: LedgerType;
}

export interface TemplateLine {
  id: string;
  templateId: string;
  accountId?: string;
  accountPrompt?: string;
  debitFormula?: string;
  creditFormula?: string;
  entityRole?: EntityRole;
  profitCenterPrompt: boolean;
  memo?: string;
  lineOrder: number;
}

export interface TemplatePrompt {
  id: string;
  templateId: string;
  name: string;
  label: string;
  promptType: PromptType;
  required: boolean;
  defaultValue?: string;
  entityRoleFilter?: EntityRole;
  promptOrder: number;
}

// ─── Standing Journals (Recurring) ──────────────────────────────

export type Frequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface StandingJournal {
  id: string;
  templateId: string;
  description: string;
  frequency: Frequency;
  ledgerType: LedgerType;
  budgetId?: string;
  startDate: Date;
  endDate?: Date;
  nextRun: Date;
  lastRun?: Date;
  active: boolean;
  savedPromptValues: Record<string, unknown>;
}

// ─── Inventory ──────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  partNumber: string;
  description: string;
  unit: string;
  incomeAccountId: string;
  expenseAccountId: string;
  inventoryAccountId?: string;
  onhand: number;
  listPrice: number;
  lastCost: number;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  journalEntryId: string;
  warehouseEntityId?: string;
  qty: number;
  costPerUnit: number;
  allocated: number;
  movementDate: Date;
}

// ─── Audit ──────────────────────────────────────────────────────

export type AuditAction =
  | "posted"
  | "saved"
  | "deleted"
  | "voided"
  | "printed"
  | "emailed";

export interface AuditEntry {
  id: string;
  tableName: string;
  recordId: string;
  reference: string;
  action: AuditAction;
  employeeEntityId: string;
  timestamp: Date;
}
