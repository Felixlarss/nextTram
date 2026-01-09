<script lang="ts">
	import { onMount } from 'svelte';
	import { getMusikvägenById } from '$lib/service/vasttrafikApi';
	import dayjs from 'dayjs';
	import AdvancedFormat from 'dayjs/plugin/advancedFormat';
	import type { Departure } from '$lib/types';

	let departures: Departure[] = [];
	let groupedDepartures: Record<string, Departure[]> = {};

	dayjs.extend(AdvancedFormat);

	const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

	function groupDepartures(dep: Departure[]) {
		const groups: Record<string, Departure[]> = {};

		dep.forEach((d) => {
			// use line number + direction as key
			if (!d.serviceJourney) throw new Error('No depatrue found');
			const key: string = `${d.serviceJourney.line.shortName}-${d.serviceJourney.direction}`;

			if (!groups[key]) groups[key] = [];
			groups[key].push(d);
		});

		return groups;
	}

	function isFutureDeparture(d: Departure) {
		const diff = dayjs(d.estimatedTime).diff(dayjs(), 'minute');
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
<div
	class="flex
         h-screen
	       flex-col
	       items-center
	       justify-center bg-black pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] font-mono text-4xl
            text-yellow-200 mix-blend-overlay brightness-110 contrast-200 saturate-200 filter"
>
	<p class="pb-6 text-5xl font-extrabold">AVGÅNGAR</p>

	<table class="w-4/5 table-fixed">
		<tbody>
			{#each Object.entries(groupedDepartures) as [key, group] (key)}
				<tr class="border-b border-yellow-400/40">
					<td class="w-10 font-bold text-white">
						{group[0].serviceJourney.line.shortName}
					</td>
					<td class="truncate px-4 text-left leading-tight text-yellow-200">
						{group[0].serviceJourney.direction}
					</td>
					<td class="w-48 text-right text-yellow-200">
						{#each group as d, i (d.detailsReference)}
							{#if d.isCancelled}
								<span class="animate-pulse text-red-500">INST</span>
							{:else}
								<span class:font-bold={i === 0}>
									{dayjs(d.plannedTime).diff(dayjs(), 'minute')}m
								</span>
							{/if}
							{i < group.length - 1 ? '  ' : ''}
						{/each}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	body {
		background-color: black;
	}
</style>
