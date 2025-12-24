"use client"

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context"
import { User, usersApi, PaginatedResponse } from "@/lib/api";
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
import {
	Trash2,
	Search,
	Mail,
	Flame,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { toast } from "sonner"

export default function UsersPage() {
	const { token } = useAuth()
	const [data, setData] = useState<PaginatedResponse<User> | null>(null);
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1);
	const limit = 20;

	const fetchData = useCallback(async () => {
		if (!token) return;
		setLoading(true);
		try {
			const response = await usersApi.getAll(token, page, limit, search);
			setData(response);
		} catch (error) {
			console.error("Failed to fetch users:", error);
			toast.error("Erreur lors du chargement des utilisateurs");
		} finally {
			setLoading(false);
		}
	}, [token, page, search]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setPage(1); // Reset to page 1 on search
		}, 300);
		return () => clearTimeout(timer);
	}, [search]);

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

	const users = data?.items ?? [];
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

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
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="text-white">
						Tous les utilisateurs ({total})
					</CardTitle>
					{/* Pagination */}
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="border-slate-700"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="text-slate-400 text-sm">
							{page} / {totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page >= totalPages}
							className="border-slate-700"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{loading ? (
						<p className="text-slate-500">Chargement...</p>
					) : users.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-slate-500 mb-2">Aucun utilisateur trouvé.</p>
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
								{users.map((user) => (
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
	);
}
