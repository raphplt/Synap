/**
 * Feed API
 */
import { FeedResponseDto } from "@synap/shared";
import { getApiBaseUrl } from "./config";

export async function fetchFeed(
	cursor = 0,
	baseUrl = getApiBaseUrl()
): Promise<FeedResponseDto> {
	const response = await fetch(`${baseUrl}/feed?cursor=${cursor}&take=50`);

	if (!response.ok) {
		const message = await response.text();
		throw new Error(`API error (${response.status}): ${message}`);
	}

	return (await response.json()) as FeedResponseDto;
}

export async function ingestRandomWiki(
	count = 20,
	baseUrl = getApiBaseUrl()
): Promise<void> {
	const response = await fetch(`${baseUrl}/wiki/ingest/random`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ count }),
	});

	if (!response.ok) {
		const message = await response.text();
		throw new Error(`API error (${response.status}): ${message}`);
	}
}
