"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { authApi, User } from "@/lib/api"

interface AuthContextType {
	user: User | null
	token: string | null
	isLoading: boolean
	isAuthenticated: boolean
	login: (email: string, password: string) => Promise<void>
	logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = "synap_admin_token"
const USER_KEY = "synap_admin_user"

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [token, setToken] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const storedToken = localStorage.getItem(TOKEN_KEY)
		const storedUser = localStorage.getItem(USER_KEY)

		if (storedToken && storedUser) {
			setToken(storedToken)
			setUser(JSON.parse(storedUser))
		}
		setIsLoading(false)
	}, [])

	const login = async (email: string, password: string) => {
		const response = await authApi.login({ email, password })
		
		localStorage.setItem(TOKEN_KEY, response.accessToken)
		localStorage.setItem(USER_KEY, JSON.stringify(response.user))
		
		setToken(response.accessToken)
		setUser(response.user)
	}

	const logout = () => {
		localStorage.removeItem(TOKEN_KEY)
		localStorage.removeItem(USER_KEY)
		setToken(null)
		setUser(null)
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				isLoading,
				isAuthenticated: !!token,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}
