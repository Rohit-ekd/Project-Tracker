# ProjectFlow — Multi-View Project Tracker

This is a project management UI developed as part of the Velozity Global Solutions assessment.

## Features

* **Three Views**: Kanban Board, List View, and Timeline view.
* **Drag and Drop**: Built using Pointer Events (no external libraries used).
* **Virtual Scrolling**: Only visible rows are rendered to improve performance.
* **Collaboration UI**: Shows active users with simple avatar indicators.
* **Filters with URL Sync**: Filters are reflected in the URL.
* **Large Data Support**: Handles 500+ tasks smoothly.
* **Responsive Design**: Works on desktop and tablet.

## Working of Website

* When the app loads, task data is generated and stored in a global state using Zustand.
* Users can switch between **Kanban, List, and Timeline views** based on their preference.
* In the **Kanban view**, tasks can be dragged and dropped between columns to update their status.
* In the **List view**, virtual scrolling ensures only visible tasks are rendered, making it fast even with large data.
* The **Timeline view** shows tasks based on their dates in a simple Gantt-style layout.
* Users can apply filters (like priority, status, etc.), and these filters are also saved in the URL.
* A small collaboration simulation shows active users working on tasks.

## Setup

```bash
pnpm install
pnpm --filter @workspace/project-tracker run dev
pnpm --filter @workspace/project-tracker run build
```

## Tech Stack

* React 18 + TypeScript
* Tailwind CSS
* Zustand (state management)
* Vite

## Why Zustand?

Zustand is simple and fast. It updates only the required components instead of re-rendering everything. This helps a lot when working with large data like 500 tasks.

## Virtual Scrolling

Instead of rendering all tasks, only visible items are shown. This keeps the app fast and smooth even with large data.

## Drag and Drop

Drag and drop is built manually using pointer events. It works on both mouse and touch devices. A placeholder is used to avoid layout shifting.

## Performance

The app performs well because:

* Only required data is rendered
* State updates are optimized
* No heavy libraries are used

## Edge Cases

* Shows "Due Today" for current tasks
* Shows overdue status
* Handles empty states properly

## Folder Structure

* `store/` → state logic
* `views/` → main screens
* `components/` → reusable UI
* `hooks/` → custom hooks
* `utils/` → helper functions

## Future Improvements

* Add keyboard support for drag and drop
* Optimize timeline view
* Improve TypeScript types
