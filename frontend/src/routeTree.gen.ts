/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'

// Create Virtual Routes

const TestLazyImport = createFileRoute('/test')()
const AnalyticsLazyImport = createFileRoute('/analytics')()
const AboutLazyImport = createFileRoute('/about')()
const IndexLazyImport = createFileRoute('/')()
const WorkersIndexLazyImport = createFileRoute('/workers/')()
const TasksIndexLazyImport = createFileRoute('/tasks/')()
const TasksTaskIdLazyImport = createFileRoute('/tasks/$taskId')()

// Create/Update Routes

const TestLazyRoute = TestLazyImport.update({
  path: '/test',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/test.lazy').then((d) => d.Route))

const AnalyticsLazyRoute = AnalyticsLazyImport.update({
  path: '/analytics',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/analytics.lazy').then((d) => d.Route))

const AboutLazyRoute = AboutLazyImport.update({
  path: '/about',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/about.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const WorkersIndexLazyRoute = WorkersIndexLazyImport.update({
  path: '/workers/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/workers/index.lazy').then((d) => d.Route))

const TasksIndexLazyRoute = TasksIndexLazyImport.update({
  path: '/tasks/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/tasks/index.lazy').then((d) => d.Route))

const TasksTaskIdLazyRoute = TasksTaskIdLazyImport.update({
  path: '/tasks/$taskId',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/tasks/$taskId.lazy').then((d) => d.Route))

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
    '/analytics': {
      id: '/analytics'
      path: '/analytics'
      fullPath: '/analytics'
      preLoaderRoute: typeof AnalyticsLazyImport
      parentRoute: typeof rootRoute
    }
    '/test': {
      id: '/test'
      path: '/test'
      fullPath: '/test'
      preLoaderRoute: typeof TestLazyImport
      parentRoute: typeof rootRoute
    }
    '/tasks/$taskId': {
      id: '/tasks/$taskId'
      path: '/tasks/$taskId'
      fullPath: '/tasks/$taskId'
      preLoaderRoute: typeof TasksTaskIdLazyImport
      parentRoute: typeof rootRoute
    }
    '/tasks/': {
      id: '/tasks/'
      path: '/tasks'
      fullPath: '/tasks'
      preLoaderRoute: typeof TasksIndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/workers/': {
      id: '/workers/'
      path: '/workers'
      fullPath: '/workers'
      preLoaderRoute: typeof WorkersIndexLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexLazyRoute,
  AboutLazyRoute,
  AnalyticsLazyRoute,
  TestLazyRoute,
  TasksTaskIdLazyRoute,
  TasksIndexLazyRoute,
  WorkersIndexLazyRoute,
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
        "/analytics",
        "/test",
        "/tasks/$taskId",
        "/tasks/",
        "/workers/"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/about": {
      "filePath": "about.lazy.tsx"
    },
    "/analytics": {
      "filePath": "analytics.lazy.tsx"
    },
    "/test": {
      "filePath": "test.lazy.tsx"
    },
    "/tasks/$taskId": {
      "filePath": "tasks/$taskId.lazy.tsx"
    },
    "/tasks/": {
      "filePath": "tasks/index.lazy.tsx"
    },
    "/workers/": {
      "filePath": "workers/index.lazy.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
