import {
    CircleUser,
    Menu,
    Package2,
    Search,
    Users,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"

const navLinks = [
    {
        name: "Dashboard",
        href: "/",
        icon: Package2,
    },
    {
        name: "Tasks",
        href: "/tasks",
        icon: Package2,
    },
    {
        name: "Workers",
        href: "/workers",
        icon: Package2,
    },
    {
        name: "Brokers",
        href: "#",
        icon: Package2,
        append: <span className="sr-only">Orchid</span>,
    },
    {
        name: "Controls",
        href: "#",
        icon: Package2,
    },
    {
        name: "Analytics",
        href: "/analytics",
        icon: Package2,
    },
    {
        name: "Users",
        href: "#",
        icon: Users,
    },
]

export default function Navbar(
    { pathname }: { pathname?: string }
) {
    return (
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <a
                    href="#"
                    className="flex items-center gap-2 text-lg font-semibold md:text-base"
                >
                    {/* TODO: Add logo */}
                    <span className="sr-only">Orchid</span>
                </a>
                {
                    navLinks.map((link, index) => (
                        <Link
                            key={index}
                            to={link.href}
                            className={`transition-colors hover:text-foreground ${pathname === link.href ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                            {link.name}
                        </Link>
                    ))
                }
            </nav>
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <nav className="grid gap-6 text-lg font-medium">
                        <a
                            href="#"
                            className="flex items-center gap-2 text-lg font-semibold"
                        >
                            <Package2 className="h-6 w-6" />
                            <span className="sr-only">Acme Inc</span>
                        </a>
                        <a href="#" className="hover:text-foreground">
                            Dashboard
                        </a>
                        <a
                            href="#"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Orders
                        </a>
                        <a
                            href="#"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Products
                        </a>
                        <a
                            href="#"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Customers
                        </a>
                        <a
                            href="#"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Analytics
                        </a>
                    </nav>
                </SheetContent>
            </Sheet>
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <form className="ml-auto flex-1 sm:flex-initial">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search products..."
                            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                        />
                    </div>
                </form>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                            <CircleUser className="h-5 w-5" />
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuItem>Support</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
