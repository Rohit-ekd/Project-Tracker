import { Task, Priority, Status } from '../types';

const TASK_TITLES = [
  'Implement user authentication flow',
  'Design onboarding screens',
  'Fix payment gateway timeout',
  'Refactor database schema',
  'Write unit tests for API',
  'Update documentation',
  'Performance optimization pass',
  'Mobile responsive layout',
  'Dark mode implementation',
  'Deploy to staging environment',
  'Code review for feature branch',
  'Set up CI/CD pipeline',
  'Integrate third-party analytics',
  'Bug fix: logout not working',
  'Add search functionality',
  'Build dashboard overview',
  'Migrate legacy components',
  'Setup error monitoring',
  'Create email templates',
  'Implement file upload',
  'Add pagination to list views',
  'Build notification system',
  'Optimize image loading',
  'Add keyboard shortcuts',
  'Implement data export',
  'Build admin panel',
  'Create API rate limiting',
  'Add audit logging',
  'Setup load balancing',
  'Write e2e test suite',
  'Fix cross-browser compatibility',
  'Add internationalization support',
  'Implement caching layer',
  'Create user settings page',
  'Build reporting module',
  'Add two-factor authentication',
  'Implement webhook support',
  'Build CSV import feature',
  'Add drag to reorder',
  'Setup A/B testing framework',
  'Optimize database queries',
  'Create backup system',
  'Implement soft delete',
  'Add activity feed',
  'Build team management',
  'Create billing dashboard',
  'Add custom fields',
  'Implement tags system',
  'Build calendar view',
  'Add timeline visualization',
  'Create project templates',
  'Implement version control',
  'Add comment system',
  'Build mentions feature',
  'Create attachment system',
  'Implement subtasks',
  'Add time tracking',
  'Build resource allocation',
  'Create dependency mapping',
  'Add milestone tracking',
  'Implement burndown charts',
  'Build velocity metrics',
  'Add sprint planning',
  'Create retrospective board',
  'Implement OKR tracking',
  'Build goal setting module',
  'Add risk management',
  'Create stakeholder view',
  'Implement change log',
  'Build release notes generator',
  'Add deployment tracking',
  'Create environment management',
  'Implement feature flags',
  'Build rollback system',
  'Add monitoring dashboard',
  'Create alerting rules',
  'Implement SLA tracking',
  'Build incident management',
  'Add postmortem templates',
  'Create on-call scheduling',
  'Implement status page',
  'Build uptime monitoring',
  'Add performance benchmarks',
  'Create load testing suite',
  'Implement security scanning',
  'Build vulnerability tracker',
  'Add compliance reporting',
  'Create audit reports',
  'Implement GDPR features',
  'Build data retention policy',
  'Add consent management',
  'Create privacy controls',
  'Implement SSO integration',
  'Build role permissions',
  'Add access control lists',
  'Create team hierarchies',
  'Implement org chart',
  'Build directory service',
  'Add provisioning flow',
  'Create deprovisioning workflow',
  'Implement session management',
];

const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];
const STATUSES: Status[] = ['todo', 'in-progress', 'in-review', 'done'];
const USER_IDS = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function generateTasks(count: number = 500): Task[] {
  const tasks: Task[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const titleBase = TASK_TITLES[i % TASK_TITLES.length];
    const suffix = Math.floor(i / TASK_TITLES.length);
    const title = suffix > 0 ? `${titleBase} (${suffix + 1})` : titleBase;

    const dueDateOffset = randomInt(-30, 60);
    const dueDate = addDays(today, dueDateOffset);

    const hasStartDate = Math.random() > 0.15;
    const startDateOffset = randomInt(-15, dueDateOffset - 1);
    const startDate = hasStartDate ? addDays(today, Math.min(startDateOffset, dueDateOffset - 1)) : null;

    const isOverdue = dueDateOffset < 0;
    let status: Status;
    if (isOverdue && Math.random() > 0.3) {
      status = randomChoice(['todo', 'in-progress', 'in-review'] as Status[]);
    } else {
      status = randomChoice(STATUSES);
    }

    let priority: Priority;
    if (isOverdue) {
      priority = randomChoice(['critical', 'high', 'high', 'medium'] as Priority[]);
    } else {
      priority = randomChoice(PRIORITIES);
    }

    tasks.push({
      id: `task-${i + 1}`,
      title,
      status,
      priority,
      assigneeId: randomChoice(USER_IDS),
      startDate: startDate ? formatDate(startDate) : null,
      dueDate: formatDate(dueDate),
      createdAt: formatDate(addDays(today, randomInt(-60, -1))),
    });
  }

  return tasks;
}

export const SEED_TASKS = generateTasks(500);
