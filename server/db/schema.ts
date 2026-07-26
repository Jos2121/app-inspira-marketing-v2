import { pgTable, text, timestamp, numeric, uuid, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role_enum', ['SUPERADMIN', 'ADMIN']);

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const appRoles = pgTable('app_roles', {
  email: text('email').primaryKey(),
  role: roleEnum('role').notNull().default('ADMIN'),
});

export const partners = pgTable('partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  phone: text('phone'),
  email: text('email'),
  status: text('status').notNull().default('Activo'),
  systemRole: text('system_role').notNull().default('ADMIN'),
  accessibleTabs: jsonb('accessible_tabs').notNull().$type<string[]>().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  monthYear: text('month_year').notNull(),
  targetPatients: integer('target_patients').notNull(),
  costPerPatient: numeric('cost_per_patient', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const dailyLogs = pgTable('daily_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  goalId: uuid('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  count: integer('count').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(),
  category: text('category').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  date: text('date').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  startTime: text('start_time').notNull(), 
  endTime: text('end_time').notNull(),
  partnerId: uuid('partner_id').references(() => partners.id, { onDelete: 'set null' }),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('Pendiente'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  activities: jsonb('activities').notNull().$type<string[]>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const complianceRecords = pgTable('compliance_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id').notNull().references(() => plans.id, { onDelete: 'restrict' }),
  monthYear: text('month_year').notNull(),
  checklist: jsonb('checklist').notNull().$type<Record<string, boolean>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const agencyPlans = pgTable('agency_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  benefits: jsonb('benefits').notNull().$type<string[]>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const diagnosticQuestions = pgTable('diagnostic_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: text('question').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const diagnosticRecords = pgTable('diagnostic_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  prospectName: text('prospect_name').notNull(),
  prospectWhatsapp: text('prospect_whatsapp').notNull(),
  dateLimaISO: text('date_lima_iso').notNull(),
  results: jsonb('results').notNull().$type<Record<string, { score: number, observation: string }>>(),
  reportText: text('report_text').notNull(),
  planId: uuid('plan_id').references(() => agencyPlans.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const workflowTasks = pgTable('workflow_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  partnerId: uuid('partner_id').references(() => partners.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// RELACIONES
export const goalsRelations = relations(goals, ({ one, many }) => ({
  client: one(clients, { fields: [goals.clientId], references: [clients.id] }),
  dailyLogs: many(dailyLogs),
}));

export const dailyLogsRelations = relations(dailyLogs, ({ one }) => ({
  goal: one(goals, { fields: [dailyLogs.goalId], references: [goals.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  partner: one(partners, { fields: [tasks.partnerId], references: [partners.id] }),
  client: one(clients, { fields: [tasks.clientId], references: [clients.id] }),
}));

export const complianceRecordsRelations = relations(complianceRecords, ({ one }) => ({
  client: one(clients, { fields: [complianceRecords.clientId], references: [clients.id] }),
  plan: one(plans, { fields: [complianceRecords.planId], references: [plans.id] }),
}));

export const diagnosticRecordsRelations = relations(diagnosticRecords, ({ one }) => ({
  plan: one(agencyPlans, { fields: [diagnosticRecords.planId], references: [agencyPlans.id] }),
}));

export const workflowsRelations = relations(workflows, ({ many }) => ({
  tasks: many(workflowTasks),
}));

export const workflowTasksRelations = relations(workflowTasks, ({ one }) => ({
  workflow: one(workflows, { fields: [workflowTasks.workflowId], references: [workflows.id] }),
  partner: one(partners, { fields: [workflowTasks.partnerId], references: [partners.id] }),
}));