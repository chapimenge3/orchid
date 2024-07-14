/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'

// Create Virtual Routes

const TasksLazyImport = createFileRoute('/tasks')()
const AboutLazyImport = createFileRoute('/about')()
const IndexLazyImport = createFileRoute('/')()
const TaskDetailsTaskIdLazyImport = createFileRoute('/task-details/$taskId')()

// Create/Update Routes

const TasksLazyRoute = TasksLazyImport.update({
  path: '/tasks',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/tasks.lazy').then((d) => d.Route))

const AboutLazyRoute = AboutLazyImport.update({
  path: '/about',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/about.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const TaskDetailsTaskIdLazyRoute = TaskDetailsTaskIdLazyImport.update({
  path: '/task-details/$taskId',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/task-details.$taskId.lazy').then((d) => d.Route),
)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/about': {
      id: '/about'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutLazyImport
      parentRoute: typeof rootRoute
    }
    '/tasks': {
      id: '/tasks'
      path: '/tasks'
      fullPath: '/tasks'
      preLoaderRoute: typeof TasksLazyImport
      parentRoute: typeof rootRoute
    }
    '/task-details/$taskId': {
      id: '/task-details/$taskId'
      path: '/task-details/$taskId'
      fullPath: '/task-details/$taskId'
      preLoaderRoute: typeof TaskDetailsTaskIdLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexLazyRoute,
  AboutLazyRoute,
  TasksLazyRoute,
  TaskDetailsTaskIdLazyRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/about",
        "/tasks",
        "/task-details/$taskId"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/about": {
      "filePath": "about.lazy.tsx"
    },
    "/tasks": {
      "filePath": "tasks.lazy.tsx"
    },
    "/task-details/$taskId": {
      "filePath": "task-details.$taskId.lazy.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
