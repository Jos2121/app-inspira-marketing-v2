import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { workflows, workflowTasks } from '../../../db/schema';
import { desc, asc } from 'drizzle-orm';

export default defineHandler(async () => {
  return await db.query.workflows.findMany({
    with: {
      tasks: {
        orderBy: [asc(workflowTasks.orderIndex)]
      }
    },
    orderBy: [desc(workflows.createdAt)]
  });
});