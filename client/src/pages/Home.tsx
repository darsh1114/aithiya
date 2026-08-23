import type { CultureCategory, CultureRecord } from "@shared/culture";
import { CultureMap } from "@/components/CultureMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { buildCultureListFilter, categoryPresentation, formatSeason, uniqueRegions } from "@/lib/cultureDiscovery";
import { cn } from "@/lib/utils";
import { ArrowUpRight, CalendarDays, ChevronRight, Compass, ExternalLink, MapPin, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

// The page has one simple source of truth for the visible records: search, category, and region.
const categories: Array<CultureCategory | "all"> = ["all", "festival", "tradition", "food", "story"];

function unpackCultureList(data: CultureRecord[] | { items: CultureRecord[]; total: number } | undefined) {
  return Array.isArray(data) ? { items: data, total: data.length } : data ?? { items: [], total: 0 };
}

function ResultCard({ record, isSelected, onSelect }: { record: CultureRecord; isSelected: boolean; onSelect: () => void }) {
  const category = categoryPresentation[record.category];

  return (
    <article className={cn(
      "group relative rounded-2xl border bg-white p-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-28px_rgba(21,52,43,0.65)]",
      isSelected ? "border-[#b9602c] ring-2 ring-[#e9c0a8]/70" : "border-stone-200",
    )}>
      <button className="absolute inset-0 rounded-2xl" type="button" onClick={onSelect} aria-label={`Focus ${record.title} on the map`} />
      <div className="pointer-events-none relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ring-1", category.tone)}>{category.shortLabel}</span>
            <span className="flex items-center gap-1 text-xs font-medium text-stone-500"><MapPin className="h-3.5 w-3.5" />{record.location.state}</span>
          </div>
          <h3 className="font-serif text-xl leading-tight text-[#15342b]">{record.title}</h3>
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-stone-100 text-[#b9602c] transition group-hover:bg-[#b9602c] group-hover:text-white"><ChevronRight className="h-4 w-4" /></div>
      </div>
      <p className="pointer-events-none relative mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{record.summary}</p>
      <div className="pointer-events-none relative mt-3 flex items-center gap-1.5 text-xs font-medium text-stone-500"><CalendarDays className="h-3.5 w-3.5 text-[#b9602c]" />{formatSeason(record.seasonMonths)}</div>
    </article>
  );
}

function SelectedRecord({ record, onClose }: { record: CultureRecord; onClose: () => void }) {
  const category = categoryPresentation[record.category];

  return (
    <aside className="rounded-2xl border border-[#15342b]/10 bg-[#15342b] p-5 text-white shadow-[0_22px_48px_-32px_rgba(21,52,43,0.9)]" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f4c968]">{category.shortLabel}</span>
          <h2 className="mt-3 font-serif text-2xl leading-tight">{record.title}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/65"><MapPin className="h-3.5 w-3.5" />{record.location.state} · {record.location.region}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full text-white/70 hover:bg-white/10 hover:text-white" onClick={onClose} aria-label="Close selected record"><X className="h-4 w-4" /></Button>
      </div>
      <p className="mt-4 text-sm leading-6 text-white/78">{record.culturalImportance}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-white/10 px-3 py-1.5 text-white/75">{record.bestVisitingTime}</span>
        <a className="inline-flex items-center gap-1 rounded-full bg-[#f4c968] px-3 py-1.5 font-semibold text-[#15342b] transition hover:bg-[#ffe096]" href={record.source.url} target="_blank" rel="noreferrer">Source <ExternalLink className="h-3.5 w-3.5" /></a>
      </div>
    </aside>
  );
}

export default function Home() {
  // 1. Store what the visitor selected.
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<CultureCategory | "all">("all");
  const [region, setRegion] = useState("all");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [visibleLimit, setVisibleLimit] = useState(24);
  const allRecordsQuery = trpc.culture.list.useQuery({ limit: 250 });

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 220);
    return () => window.clearTimeout(timeout);
  }, [search]);

  // 2. Turn the page state into a small API filter object, then load matching records.
  const filterInput = useMemo(() => ({ ...buildCultureListFilter({ search: debouncedSearch, category, region }), limit: 250 }), [category, debouncedSearch, region]);
  const recordsQuery = trpc.culture.list.useQuery(filterInput);
  const allRecordResult = unpackCultureList(allRecordsQuery.data);
  const recordResult = unpackCultureList(recordsQuery.data);
  const allRecords = allRecordResult.items;
  const records = recordResult.items;
  const regions = useMemo(() => uniqueRegions(allRecords), [allRecords]);
  const visibleRecords = useMemo(() => records.slice(0, visibleLimit), [records, visibleLimit]);
  // 3. The map and list share selectedSlug, so either one can select the same record.
  const selectedRecord = useMemo(() => records.find((record) => record.slug === selectedSlug) ?? null, [records, selectedSlug]);

  useEffect(() => {
    if (selectedSlug && !selectedRecord) setSelectedSlug(null);
  }, [selectedRecord, selectedSlug]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setCategory("all");
    setRegion("all");
    setSelectedSlug(null);
    setVisibleLimit(24);
  }, []);

  const isFiltering = Boolean(search) || category !== "all" || region !== "all";
  const recordCount = allRecordResult.total;
  const regionCount = regions.length;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f5ee] text-[#25322c]">
      <header className="border-b border-[#15342b]/10 bg-[#f7f5ee]/90 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-5 py-4 md:px-8">
          <a href="/" className="group flex items-center gap-3" aria-label="India Culture Explorer home">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#15342b] text-[#f4c968] shadow-[0_8px_20px_-10px_rgba(21,52,43,0.9)]"><Compass className="h-5 w-5" /></span>
            <span><span className="block font-serif text-lg leading-none text-[#15342b]">India Culture Explorer</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#b9602c]">Living culture atlas</span></span>
          </a>
          <div className="hidden items-center gap-2 md:flex"><span className="rounded-full border border-[#15342b]/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#15342b]">Curated pilot</span><span className="rounded-full bg-[#15342b] px-3 py-1.5 text-xs font-semibold text-white">{recordCount} records</span></div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 md:px-8 md:pt-12">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#15342b] px-6 py-8 text-white shadow-[0_30px_80px_-42px_rgba(21,52,43,0.9)] md:px-10 md:py-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#f4c968]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#b9602c]/15 blur-3xl" />
          <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#f4c968]"><Sparkles className="h-3.5 w-3.5" />Culture, connected to place</div>
              <h1 className="font-serif text-4xl leading-[1.02] tracking-tight md:text-6xl">Find the stories<br className="hidden md:block" /> behind the places.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 md:text-lg">Search the living traditions, festivals, foods, and performance stories that shape India’s cultural landscape.</p>
            </div>
            <div className="flex gap-7 text-sm"><div><strong className="block font-serif text-3xl text-[#f4c968]">{recordCount}</strong><span className="text-white/60">records</span></div><div><strong className="block font-serif text-3xl text-[#f4c968]">{regionCount}</strong><span className="text-white/60">regions</span></div></div>
          </div>
        </section>

        <section className="relative z-10 -mt-5 rounded-2xl border border-stone-200 bg-white p-3 shadow-[0_20px_45px_-30px_rgba(21,52,43,0.4)] md:p-4" aria-label="Explore cultural records">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.35fr)_auto_auto]">
            <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><label htmlFor="culture-search" className="sr-only">Search cultural records</label><Input id="culture-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search a festival, place, or practice" className="h-12 border-stone-200 bg-stone-50 pl-11 text-sm shadow-none focus-visible:ring-[#b9602c]" /></div>
            <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3"><SlidersHorizontal className="h-4 w-4 text-[#b9602c]" /><label htmlFor="region-filter" className="sr-only">Filter by region</label><select id="region-filter" value={region} onChange={(event) => setRegion(event.target.value)} className="h-10 min-w-[145px] bg-transparent text-sm font-medium text-stone-700 outline-none"><option value="all">All regions</option>{regions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
            <Button variant="outline" onClick={clearFilters} disabled={!isFiltering} className="h-12 border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40"><X className="mr-2 h-4 w-4" />Clear filters</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Filter by category">{categories.map((item) => {
            const isActive = category === item;
            const label = item === "all" ? "All records" : categoryPresentation[item].label;
            return <button key={item} type="button" aria-pressed={isActive} onClick={() => setCategory(item)} className={cn("rounded-full px-3.5 py-2 text-xs font-bold transition", isActive ? "bg-[#15342b] text-white shadow-sm" : "bg-stone-100 text-stone-600 hover:bg-stone-200")}>{label}</button>;
          })}</div>
        </section>

        <section className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1.05fr)_minmax(390px,0.95fr)]">
          <div className="space-y-4 xl:sticky xl:top-5 xl:self-start">
            <CultureMap records={records} selectedSlug={selectedSlug} onSelect={setSelectedSlug} />
            {selectedRecord ? <SelectedRecord record={selectedRecord} onClose={() => setSelectedSlug(null)} /> : <div className="rounded-2xl border border-dashed border-[#15342b]/20 bg-white/55 p-5 text-sm text-stone-500"><span className="font-semibold text-[#15342b]">Explore the map.</span> Select a marker or a result to see cultural context, best visiting time, and its documented source.</div>}
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b9602c]">Search results</p><h2 className="mt-1 font-serif text-3xl text-[#15342b]">{recordsQuery.isLoading ? "Finding records…" : `${records.length} cultural ${records.length === 1 ? "record" : "records"}`}</h2></div><span className="hidden text-sm text-stone-500 sm:block">Map and list stay in sync</span></div>
            {recordsQuery.isLoading ? <div className="grid gap-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl border border-stone-200 bg-white" />)}</div> : recordsQuery.isError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800"><strong>We couldn’t load cultural records.</strong><p className="mt-1 text-sm">Check the Render connection, then refresh this page.</p></div> : records.length ? <><div className="grid gap-3">{visibleRecords.map((record) => <ResultCard key={record.id} record={record} isSelected={record.slug === selectedSlug} onSelect={() => setSelectedSlug(record.slug)} />)}</div>{visibleRecords.length < records.length ? <Button variant="outline" className="mt-4 w-full border-[#15342b]/20 text-[#15342b]" onClick={() => setVisibleLimit((current) => current + 24)}>Load more records ({records.length - visibleRecords.length} remaining)</Button> : null}</> : <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center"><Compass className="mx-auto h-7 w-7 text-[#b9602c]" /><h3 className="mt-4 font-serif text-2xl text-[#15342b]">No records match yet</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">Try a different place, practice, or category—or return to the full cultural atlas.</p><Button onClick={clearFilters} className="mt-5 bg-[#15342b] text-white hover:bg-[#204a3d]"><ArrowUpRight className="mr-2 h-4 w-4" />Show all records</Button></div>}
          </div>
        </section>
      </main>
    </div>
  );
}
