const apiKey = import.meta.env.VITE_API_KEY;
export async function getMusikvägenById() {
	const response = await fetch(
		`https://ext-api.vasttrafik.se/pr/v4/stop-areas/9021014004870000/departures`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`
			}
		}
	);

	const json = await response.json();
	const data = await json.results;
	if (!response.ok) {
		throw new Error('data not found');
	}
	return data;
}
