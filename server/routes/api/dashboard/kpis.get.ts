import { defineHandler } from 'nitro';
import { createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { transactions, tasks, clients, partners, diagnosticRecords } from '../../../db/schema';
import { sql as drizzleSql, eq, and, gte, lt } from 'drizzle-orm';

export default defineHandler(async (event) => {
  try {
    const userId = event.context.userId;
    if (!userId) {
      throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Lima',
      year: 'numeric', month: 'numeric', day: 'numeric',
    });
    
    const parts = formatter.formatToParts(now);
    const getPart = (type: string) => parseInt(parts.find(p => p.type === type)!.value, 10);
    
    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');

    const startMonthStr = `${year}-${month.toString().padStart(2, '0')}-01`;
    const nextMonthYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextMonthStr = `${nextMonthYear}-${nextMonth.toString().padStart(2, '0')}-01`;

    const monthConditionTx = and(
      gte(transactions.date, startMonthStr),
      lt(transactions.date, nextMonthStr)
    );

    const [incomeResult] = await db
      .select({ total: drizzleSql<number>`coalesce(sum(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(monthConditionTx, eq(transactions.type, 'Ingreso')));

    const [expenseResult] = await db
      .select({ total: drizzleSql<number>`coalesce(sum(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(monthConditionTx, eq(transactions.type, 'Gasto')));

    const incomes = Number(incomeResult?.total || 0);
    const expenses = Number(expenseResult?.total || 0);
    const balance = incomes - expenses;

    const todayStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    const allTasks = await db.select({ status: tasks.status, startTime: tasks.startTime }).from(tasks);
    const todayTasks = allTasks.filter(t => t.startTime.startsWith(todayStr));
    
    const todayTasksTotal = todayTasks.length;
    const todayTasksCompleted = todayTasks.filter(t => t.status === 'Completada').length;

    const allClients = await db.select({ id: clients.id }).from(clients);
    const totalClientsCount = allClients.length;

    const allPartners = await db.select({ id: partners.id }).from(partners);
    const totalPartnersCount = allPartners.length;

    const allDiagnostics = await db.select({ id: diagnosticRecords.id }).from(diagnosticRecords);
    const totalDiagnosticsCount = allDiagnostics.length;

    return {
      incomes,
      expenses,
      balance,
      todayTasksTotal,
      todayTasksCompleted,
      totalClients: totalClientsCount,
      totalPartners: totalPartnersCount,
      totalDiagnostics: totalDiagnosticsCount,
    };
  } catch (error: any) {
    console.error("Error en API de Dashboard:", error);
    throw createError({ statusCode: 500, message: error.message || "Error interno al calcular KPIs" });
  }
});