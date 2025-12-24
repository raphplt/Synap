"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import {
	LayoutDashboard,
	Users,
	Layers,
	FolderTree,
	Settings,
	LogOut,
	Menu,
	Brain,
	CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ name: "Utilisateurs", href: "/dashboard/users", icon: Users },
	{ name: "Cartes", href: "/dashboard/cards", icon: CreditCard },
	{ name: "Decks", href: "/dashboard/decks", icon: Layers },
	{ name: "Catégories", href: "/dashboard/categories", icon: FolderTree },
	{ name: "Paramètres", href: "/dashboard/settings", icon: Settings },
]

function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
	const { user, logout } = useAuth()
	const router = useRouter()

	const handleLogout = () => {
		logout()
		router.push("/login")
	}

	return (
		<div className="flex h-full flex-col bg-slate-900 border-r border-slate-800">
			{/* Logo */}
			<div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
				<Brain className="h-8 w-8 text-emerald-500" />
				<span className="text-xl font-bold text-white">SYNAP</span>
				<span className="text-xs text-slate-500 ml-1">Admin</span>
			</div>

			{/* Navigation */}
			<ScrollArea className="flex-1 px-3 py-4">
				<nav className="space-y-1">
					{navigation.map((item) => (
						<Link
							key={item.name}
							href={item.href}
							onClick={onClose}
							className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
						>
							<item.icon className="h-5 w-5" />
							<span>{item.name}</span>
						</Link>
					))}
				</nav>
			</ScrollArea>

			<Separator className="bg-slate-800" />

			{/* User section */}
			<div className="p-4">
				<div className="flex items-center gap-3 mb-3">
					<Avatar className="h-9 w-9">
						<AvatarFallback className="bg-emerald-600">
							{user?.username?.charAt(0).toUpperCase() ?? "A"}
						</AvatarFallback>
					</Avatar>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-white truncate">
							{user?.username ?? "Admin"}
						</p>
						<p className="text-xs text-slate-500 truncate">{user?.email}</p>
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="w-full border-slate-700 hover:bg-slate-800"
					onClick={handleLogout}
				>
					<LogOut className="h-4 w-4 mr-2" />
					Déconnexion
				</Button>
			</div>
		</div>
	)
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const { isAuthenticated, isLoading } = useAuth()
	const router = useRouter()
	const [mobileOpen, setMobileOpen] = useState(false)

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.replace("/login")
		}
	}, [isAuthenticated, isLoading, router])

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-950">
				<div className="animate-pulse text-slate-400">Chargement...</div>
			</div>
		)
	}

	if (!isAuthenticated) {
		return null
	}

	return (
		<div className="flex min-h-screen bg-slate-950">
			{/* Desktop sidebar */}
			<div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
				<Sidebar />
			</div>

			{/* Mobile header */}
			<div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-900 px-4 lg:hidden">
				<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon" className="text-slate-400">
							<Menu className="h-6 w-6" />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-64 p-0 border-slate-800">
						<Sidebar mobile onClose={() => setMobileOpen(false)} />
					</SheetContent>
				</Sheet>
				<div className="flex items-center gap-2">
					<Brain className="h-6 w-6 text-emerald-500" />
					<span className="font-bold text-white">SYNAP</span>
				</div>
			</div>

			{/* Main content */}
			<main className="flex-1 lg:pl-64">
				<div className="p-6 lg:p-8">{children}</div>
			</main>
		</div>
	)
}
