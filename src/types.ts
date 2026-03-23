export type Priority = "critical" | "high" | "medium" | "low";
export type Status = "todo" | "in-progress" | "in-review" | "done";

export interface User {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  assigneeId: string;
  startDate: string | null;
  dueDate: string;
  createdAt: string;
}

export interface Filters {
  status: Status[];
  priority: Priority[];
  assignee: string[];
  dueDateFrom: string;
  dueDateTo: string;
}

export type SortField = "title" | "priority" | "dueDate";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export type ViewMode = "kanban" | "list" | "timeline";

export interface CollabUser {
  id: string;
  name: string;
  color: string;
  taskId: string | null;
}
