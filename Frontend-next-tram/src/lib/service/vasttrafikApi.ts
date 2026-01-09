const apiKey = import.meta.env.VITE_API_KEY;
const apiUrl = import.meta.env.VITE_API_URL;
export async function getMusikvägenById() {
	const response = await fetch(apiUrl, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`
		}
	});

	const json = await response.json();
	const data = await json.results;
	if (!response.ok) {
		throw new Error('data not found');
	}
	return data;
}
