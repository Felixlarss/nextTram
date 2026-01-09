<script lang="ts">
	import { onMount } from 'svelte';
	import { getMusikvägenById } from '$lib/service/vasttrafikApi';
	import dayjs from 'dayjs';
	import AdvancedFormat from 'dayjs/plugin/advancedFormat';
	import type { Departure } from '$lib/types';

	let departures: Departure[] = [];
	let groupedDepartures: Record<string, Departure[]> = {};
	let platformA: Departure[] = [];
	let platformB: Departure[] = [];

	dayjs.extend(AdvancedFormat);

	const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

	function groupDepartures(dep: Departure[]) {
		const groups: Record<string, Departure[]> = {};

		dep.forEach((departures) => {
			// use line number + direction as key
			if (!departures.serviceJourney) throw new Error('No depatrue found');
			const key: string = `${departures.serviceJourney.line.shortName}-${departures.serviceJourney.direction}`;

			if (!groups[key]) groups[key] = [];
			groups[key].push(departures);
		});

		return groups;
	}

	function isFutureDeparture(departures: Departure) {
		const diff = dayjs(departures.estimatedTime).diff(dayjs(), 'minute');
		return diff >= 0 && diff <= 45;
	}

	onMount(async () => {
		while (true) {
			const data = await getMusikvägenById();

			departures = data.filter(isFutureDeparture);

			groupedDepartures = groupDepartures(departures);
			await delay(10000);
		}
	});
</script>

<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<p class="bg-black pt-10 pb-5 text-center text-5xl font-extrabold text-white">AVGÅNGAR</p>
<div class="flex h-screen flex-row items-start justify-center bg-black">
	<div
		class="flex
           flex-col
           items-center
           justify-center
           bg-black p-2 pl-15 font-mono text-3xl
            text-yellow-200 saturate-200"
	>
		<p class="font-bold text-white">Läge A</p>
		<table class="w-full table-fixed">
			<tbody>
				{#each Object.entries(groupedDepartures) as [key, group] (key)}
					{#if group[0].stopPoint.platform === 'A'}
						<tr class="border-b border-yellow-400/40">
							<td class="w-7 font-bold text-white">
								{group[0].serviceJourney.line.shortName}
							</td>
							<td class="truncate text-left leading-tight text-yellow-200">
								{group[0].serviceJourney.direction}
							</td>
							<td
								class=" flex w-38 flex-row justify-end gap-5 text-end whitespace-nowrap text-yellow-200"
							>
								{#each group as d, i (d.detailsReference)}
									{#if d.isCancelled}
										<span class="animate-pulse text-red-500">INST</span>
									{:else}
										<span class:font-bold={i === 0} class="flex w-13 flex-row justify-end text-end">
											{dayjs(d.plannedTime).diff(dayjs(), 'minute')}m
										</span>
									{/if}
									{i < group.length - 1 ? '' : ''}
								{/each}
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
	<div
		class="flex
           flex-col
           items-center
           justify-center
           bg-black p-2 pr-15 font-mono text-3xl
            text-yellow-200 saturate-200"
	>
		<p class="font-bold text-white">Läge B</p>
		<table class="w-full table-fixed">
			<tbody>
				{#each Object.entries(groupedDepartures) as [key, group] (key)}
					{#if group[0].stopPoint.platform === 'B'}
						<tr class="border-b border-yellow-400/40">
							<td class="w-7 font-bold text-white">
								{group[0].serviceJourney.line.shortName}
							</td>
							<td class="text-left leading-tight wrap-normal text-yellow-200">
								{group[0].serviceJourney.direction}
							</td>
							<td
								class=" flex w-38 flex-row justify-end gap-5 text-end whitespace-nowrap text-yellow-200"
							>
								{#each group as d, i (d.detailsReference)}
									{#if d.isCancelled}
										<span class="animate-pulse text-red-500">INST</span>
									{:else}
										<span class:font-bold={i === 0} class="flex w-13 flex-row justify-end text-end">
											{dayjs(d.plannedTime).diff(dayjs(), 'minute')}m
										</span>
									{/if}
									{i < group.length - 1 ? '  ' : ''}
								{/each}
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
</div>
