import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from "@/components/ui/toaster"

export const Route = createRootRoute({
    component: () => (
        <>
            <Toaster />
            <Outlet />
            <TanStackRouterDevtools />
        </>
    ),
})
