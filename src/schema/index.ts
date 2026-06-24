// Drizzle ORM schema for new-ledger
// PostgreSQL tables

import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  date,
  numeric,
  integer,
  jsonb,
  primaryKey,
  index,
  unique,
} from "drizzle-orm/pg-core";

// ─── Entity System ───────────────────────────────────────────────

export const entity = pgTable("entity", {
  id: text("id").primaryKey(),
  entityType: varchar("entity_type", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  legalName: varchar("legal_name", { length: 255 }),
  taxId: varchar("tax_id", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const entityRole = pgTable(
  "entity_role",
  {
    id: text("id").primaryKey(),
    entityId: text("entity_id")
      .references(() => entity.id)
      .notNull(),
    role: varchar("role", { length: 30 }).notNull(),
    active: boolean("active").default(true).notNull(),
    since: date("since").notNull(),
    until: date("until"),
  },
  (t) => [index("idx_entity_role_entity").on(t.entityId)]
);

export const entityAddress = pgTable(
  "entity_address",
  {
    id: text("id").primaryKey(),
    entityId: text("entity_id")
      .references(() => entity.id)
      .notNull(),
    addressType: varchar("address_type", { length: 20 }).notNull(),
    street1: varchar("street1", { length: 255 }).notNull(),
    street2: varchar("street2", { length: 255 }),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }),
    postalCode: varchar("postal_code", { length: 20 }),
    country: varchar("country", { length: 2 }).notNull(),
    primary: boolean("is_primary").default(false).notNull(),
  },
  (t) => [index("idx_entity_address_entity").on(t.entityId)]
);

export const entityPhone = pgTable(
  "entity_phone",
  {
    id: text("id").primaryKey(),
    entityId: text("entity_id")
      .references(() => entity.id)
      .notNull(),
    phoneType: varchar("phone_type", { length: 10 }).notNull(),
    number: varchar("number", { length: 30 }).notNull(),
    primary: boolean("is_primary").default(false).notNull(),
  },
  (t) => [index("idx_entity_phone_entity").on(t.entityId)]
);

export const entityContact = pgTable(
  "entity_contact",
  {
    id: text("id").primaryKey(),
    entityId: text("entity_id")
      .references(() => entity.id)
      .notNull(),
    contactType: varchar("contact_type", { length: 20 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phoneId: text("phone_id").references(() => entityPhone.id),
  },
  (t) => [index("idx_entity_contact_entity").on(t.entityId)]
);

export const entityRelationship = pgTable(
  "entity_relationship",
  {
    id: text("id").primaryKey(),
    parentEntityId: text("parent_entity_id")
      .references(() => entity.id)
      .notNull(),
    childEntityId: text("child_entity_id")
      .references(() => entity.id)
      .notNull(),
    relationshipType: varchar("relationship_type", { length: 30 }).notNull(),
    since: date("since").notNull(),
    until: date("until"),
  },
  (t) => [
    index("idx_entity_rel_parent").on(t.parentEntityId),
    index("idx_entity_rel_child").on(t.childEntityId),
  ]
);

// ─── Chart of Accounts ──────────────────────────────────────────

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accno: varchar("accno", { length: 20 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    accountType: varchar("account_type", { length: 20 }).notNull(),
    accountClass: varchar("account_class", { length: 30 }).notNull(),
    contra: boolean("contra").default(false).notNull(),
    active: boolean("active").default(true).notNull(),
    parentId: text("parent_id"),
  },
  (t) => [unique("uq_account_accno").on(t.accno)]
);

// ─── Tax ─────────────────────────────────────────────────────────

export const taxRate = pgTable(
  "tax_rate",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id")
      .references(() => account.id)
      .notNull(),
    rate: numeric("rate", { precision: 10, scale: 6 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    validFrom: date("valid_from").notNull(),
    validTo: date("valid_to"),
    pass: integer("pass").default(1).notNull(),
  },
  (t) => [index("idx_tax_rate_account").on(t.accountId)]
);

// ─── Budgets ─────────────────────────────────────────────────────

export const budget = pgTable("budget", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  fiscalYearStart: date("fiscal_year_start").notNull(),
  fiscalYearEnd: date("fiscal_year_end").notNull(),
  active: boolean("active").default(true).notNull(),
});

// ─── General Ledger ─────────────────────────────────────────────

export const journalEntry = pgTable(
  "journal_entry",
  {
    id: text("id").primaryKey(),
    reference: varchar("reference", { length: 50 }).notNull(),
    description: text("description"),
    transdate: date("transdate").notNull(),
    ledgerType: varchar("ledger_type", { length: 10 }).notNull().default("actual"),
    budgetId: text("budget_id").references(() => budget.id),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    exchangeRate: numeric("exchange_rate", { precision: 15, scale: 8 })
      .notNull()
      .default("1"),
    approved: boolean("approved").default(true).notNull(),
    createdBy: text("created_by")
      .references(() => entity.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("idx_journal_entry_transdate").on(t.transdate),
    index("idx_journal_entry_reference").on(t.reference),
    index("idx_journal_entry_ledger").on(t.ledgerType),
  ]
);

export const journalLine = pgTable(
  "journal_line",
  {
    id: text("id").primaryKey(),
    journalEntryId: text("journal_entry_id")
      .references(() => journalEntry.id)
      .notNull(),
    accountId: text("account_id")
      .references(() => account.id)
      .notNull(),
    amount: numeric("amount", { precision: 20, scale: 8 }).notNull(),
    entityId: text("entity_id").references(() => entity.id),
    profitCenterId: text("profit_center_id").references(() => entity.id),
    memo: text("memo"),
    source: varchar("source", { length: 100 }),
    fxTransaction: boolean("fx_transaction").default(false).notNull(),
    cleared: date("cleared"),
    lineOrder: integer("line_order").notNull(),
  },
  (t) => [
    index("idx_journal_line_entry").on(t.journalEntryId),
    index("idx_journal_line_account").on(t.accountId),
    index("idx_journal_line_entity").on(t.entityId),
    index("idx_journal_line_profit_center").on(t.profitCenterId),
  ]
);

// ─── Transaction Templates ──────────────────────────────────────

export const transactionTemplate = pgTable("transaction_template", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  numberingPrefix: varchar("numbering_prefix", { length: 20 }),
  numberingSequence: varchar("numbering_sequence", { length: 50 }),
  defaultLedgerType: varchar("default_ledger_type", { length: 10 })
    .notNull()
    .default("actual"),
});

export const templateLine = pgTable(
  "template_line",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id")
      .references(() => transactionTemplate.id)
      .notNull(),
    accountId: text("account_id").references(() => account.id),
    accountPrompt: varchar("account_prompt", { length: 100 }),
    debitFormula: varchar("debit_formula", { length: 255 }),
    creditFormula: varchar("credit_formula", { length: 255 }),
    entityRole: varchar("entity_role", { length: 30 }),
    profitCenterPrompt: boolean("profit_center_prompt")
      .default(false)
      .notNull(),
    memo: text("memo"),
    lineOrder: integer("line_order").notNull(),
  },
  (t) => [index("idx_template_line_template").on(t.templateId)]
);

export const templatePrompt = pgTable(
  "template_prompt",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id")
      .references(() => transactionTemplate.id)
      .notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    label: varchar("label", { length: 100 }).notNull(),
    promptType: varchar("prompt_type", { length: 20 }).notNull(),
    required: boolean("required").default(true).notNull(),
    defaultValue: text("default_value"),
    entityRoleFilter: varchar("entity_role_filter", { length: 30 }),
    promptOrder: integer("prompt_order").notNull(),
  },
  (t) => [index("idx_template_prompt_template").on(t.templateId)]
);

// ─── Standing Journals ──────────────────────────────────────────

export const standingJournal = pgTable("standing_journal", {
  id: text("id").primaryKey(),
  templateId: text("template_id")
    .references(() => transactionTemplate.id)
    .notNull(),
  description: text("description"),
  frequency: varchar("frequency", { length: 20 }).notNull(),
  ledgerType: varchar("ledger_type", { length: 10 }).notNull().default("actual"),
  budgetId: text("budget_id").references(() => budget.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  nextRun: date("next_run").notNull(),
  lastRun: date("last_run"),
  active: boolean("active").default(true).notNull(),
  savedPromptValues: jsonb("saved_prompt_values").default({}).notNull(),
});

// ─── Inventory ──────────────────────────────────────────────────

export const inventoryItem = pgTable(
  "inventory_item",
  {
    id: text("id").primaryKey(),
    partNumber: varchar("part_number", { length: 50 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    unit: varchar("unit", { length: 10 }).notNull(),
    incomeAccountId: text("income_account_id")
      .references(() => account.id)
      .notNull(),
    expenseAccountId: text("expense_account_id")
      .references(() => account.id)
      .notNull(),
    inventoryAccountId: text("inventory_account_id").references(
      () => account.id
    ),
    onhand: numeric("onhand", { precision: 20, scale: 5 })
      .notNull()
      .default("0"),
    listPrice: numeric("list_price", { precision: 20, scale: 8 })
      .notNull()
      .default("0"),
    lastCost: numeric("last_cost", { precision: 20, scale: 8 })
      .notNull()
      .default("0"),
  },
  (t) => [unique("uq_inventory_item_part_number").on(t.partNumber)]
);

export const inventoryMovement = pgTable(
  "inventory_movement",
  {
    id: text("id").primaryKey(),
    itemId: text("item_id")
      .references(() => inventoryItem.id)
      .notNull(),
    journalEntryId: text("journal_entry_id")
      .references(() => journalEntry.id)
      .notNull(),
    warehouseEntityId: text("warehouse_entity_id").references(
      () => entity.id
    ),
    qty: numeric("qty", { precision: 20, scale: 5 }).notNull(),
    costPerUnit: numeric("cost_per_unit", { precision: 20, scale: 8 }).notNull(),
    allocated: numeric("allocated", { precision: 20, scale: 5 })
      .notNull()
      .default("0"),
    movementDate: date("movement_date").notNull(),
  },
  (t) => [
    index("idx_inv_movement_item").on(t.itemId),
    index("idx_inv_movement_journal").on(t.journalEntryId),
  ]
);

// ─── Audit Trail ─────────────────────────────────────────────────

export const auditEntry = pgTable(
  "audit_entry",
  {
    id: text("id").primaryKey(),
    tableName: varchar("table_name", { length: 50 }).notNull(),
    recordId: text("record_id").notNull(),
    reference: varchar("reference", { length: 100 }),
    action: varchar("action", { length: 20 }).notNull(),
    employeeEntityId: text("employee_entity_id").references(() => entity.id),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (t) => [
    index("idx_audit_record").on(t.tableName, t.recordId),
    index("idx_audit_timestamp").on(t.timestamp),
  ]
);

// ─── Exchange Rates ──────────────────────────────────────────────

export const exchangeRate = pgTable(
  "exchange_rate",
  {
    id: text("id").primaryKey(),
    currency: varchar("currency", { length: 3 }).notNull(),
    rateDate: date("rate_date").notNull(),
    rate: numeric("rate", { precision: 15, scale: 8 }).notNull(),
  },
  (t) => [
    unique("uq_exchange_rate_currency_date").on(t.currency, t.rateDate),
  ]
);

// ─── Sequences (auto-numbering) ─────────────────────────────────

export const sequence = pgTable("sequence", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  prefix: varchar("prefix", { length: 20 }),
  currentValue: integer("current_value").notNull().default(0),
});

// ─── System Defaults ─────────────────────────────────────────────

export const defaults = pgTable("defaults", {
  key: varchar("key", { length: 50 }).primaryKey(),
  value: text("value"),
});
