/**
 * Users API
 */
import { UserResponseDto } from "@synap/shared";
import { getApiBaseUrl, handleApiError } from "./config";

export async function updateUserInterests(
	userId: string,
	interests: string[],
	token: string,
	baseUrl = getApiBaseUrl()
): Promise<UserResponseDto> {
	const response = await fetch(`${baseUrl}/users/${userId}`, {
		method: "PATCH",
		headers: {
			"content-type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ interests }),
	});

	if (!response.ok) {
		await handleApiError(response);
	}

	return response.json();
}
