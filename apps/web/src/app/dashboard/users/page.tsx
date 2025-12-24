"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { User, usersApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Card as CardUI,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trash2, Search, Mail, Flame } from "lucide-react"
import { toast } from "sonner"

export default function UsersPage() {
	const { token } = useAuth()
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")

	const fetchData = async () => {
		if (!token) return
		try {
			const usersData = await usersApi.getAll(token)
			setUsers(usersData)
		} catch (error) {
			console.error("Failed to fetch users:", error)
			// Endpoint might not exist yet
			toast.error("Endpoint /users non disponible. Implémentez-le dans l'API.")
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchData()
	}, [token])

	const handleDelete = async (id: string) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return
		try {
			await usersApi.delete(id, token!)
			toast.success("Utilisateur supprimé")
			fetchData()
		} catch (error) {
			toast.error((error as Error).message ?? "Erreur lors de la suppression")
		}
	}

	const filteredUsers = users.filter(
		(user) =>
			user.username.toLowerCase().includes(search.toLowerCase()) ||
			user.email.toLowerCase().includes(search.toLowerCase())
	)

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-white">Utilisateurs</h1>
					<p className="text-slate-400 mt-1">Gérer les comptes utilisateurs</p>
				</div>
			</div>

			{/* Search */}
			<div className="relative max-w-md">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
				<Input
					placeholder="Rechercher un utilisateur..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10 bg-slate-900 border-slate-800"
				/>
			</div>

			{/* Table */}
			<CardUI className="bg-slate-900 border-slate-800">
				<CardHeader>
					<CardTitle className="text-white">
						Tous les utilisateurs ({filteredUsers.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<p className="text-slate-500">Chargement...</p>
					) : filteredUsers.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-slate-500 mb-2">Aucun utilisateur trouvé.</p>
							<p className="text-slate-600 text-sm">
								L&apos;endpoint GET /users doit être implémenté dans l&apos;API.
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow className="border-slate-800">
									<TableHead className="text-slate-400">Utilisateur</TableHead>
									<TableHead className="text-slate-400">Email</TableHead>
									<TableHead className="text-slate-400">XP</TableHead>
									<TableHead className="text-slate-400">Streak</TableHead>
									<TableHead className="text-slate-400">Intérêts</TableHead>
									<TableHead className="text-slate-400 text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredUsers.map((user) => (
									<TableRow key={user.id} className="border-slate-800">
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarFallback className="bg-emerald-600 text-white text-sm">
														{user.username.charAt(0).toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<span className="text-white font-medium">{user.username}</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2 text-slate-400">
												<Mail className="h-3 w-3" />
												{user.email}
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline" className="border-amber-600 text-amber-500">
												{user.xp} XP
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1 text-orange-500">
												<Flame className="h-4 w-4" />
												{user.streak}j
											</div>
										</TableCell>
										<TableCell className="text-slate-400">
											<div className="flex flex-wrap gap-1">
												{user.interests?.slice(0, 2).map((i) => (
													<Badge key={i} variant="secondary" className="text-xs">
														{i}
													</Badge>
												))}
												{(user.interests?.length ?? 0) > 2 && (
													<Badge variant="secondary" className="text-xs">
														+{(user.interests?.length ?? 0) - 2}
													</Badge>
												)}
											</div>
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="icon"
												className="text-slate-400 hover:text-red-500"
												onClick={() => handleDelete(user.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</CardUI>
		</div>
	)
}
