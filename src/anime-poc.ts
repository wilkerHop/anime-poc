import assert from 'assert';

// ==========================================
// 1. SCHEMA INTERFACES (Models)
// ==========================================

// Core Enums/Types
type RelationType = 'Sequel' | 'Prequel' | 'Side story' | 'Summary' | 'Alternative version' | 'Other';
type RoleType = 'Main' | 'Supporting';

// --- Database Models ---

interface UserProfile {
  id: string;
  username: string;
  lastUpdated: Date;
  // animeList: Anime[]; // Circular reference omitted for PoC
}

interface Genre {
  id: number;
  name: string;
}

interface Company {
  id: number;
  name: string;
}

interface Person {
  id: number;
  name: string;
  image: string | null;
}

interface Character {
  id: number;
  name: string;
  image: string | null;
}

interface AnimeStats {
  score: number | null;
  ranked: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
}

interface RelatedEntry {
  relationType: string;
  relatedAnimeId: number;
  relatedAnimeTitle: string;
}

interface AnimeTheme {
  type: 'Opening' | 'Ending';
  text: string;
}

interface VoiceActorAssignment {
  person: Person;
  language: string;
}

interface AnimeCharacter {
  character: Character;
  role: RoleType;
  voiceActors: VoiceActorAssignment[];
}

interface AnimeStaff {
  person: Person;
  role: string;
}

interface AnimeCompany {
  company: Company;
  type: 'Producer' | 'Licensor' | 'Studio';
}

// The Main Aggregate Root
interface Anime {
  id: number;
  // Titles
  title: string;
  titleEnglish: string | null;
  titleJapanese: string | null;
  
  // Media Details
  type: string | null;
  status: string | null;
  episodes: number | null;
  duration: string | null;
  rating: string | null;
  source: string | null;
  
  // Dates
  airedString: string | null;
  airedFrom: Date | null;
  airedTo: Date | null;
  
  // Content
  mainPicture: string | null;
  synopsis: string | null;
  background: string | null;

  // Relations (Nested Objects for PoC)
  stats: AnimeStats;
  genres: Genre[];
  companies: AnimeCompany[]; // Combined list for Producers/Studios
  themes: AnimeTheme[];
  relatedEntries: RelatedEntry[];
  
  // Complex Relations
  characters: AnimeCharacter[];
  staff: AnimeStaff[];
}


// ==========================================
// 2. JIKAN API TYPES (Raw Response)
// ==========================================

interface JikanResponse<T> {
  data: T;
}

interface JikanMeta {
  mal_id: number;
  name: string;
  type: string;
}

interface JikanImage {
  jpg: { image_url: string; large_image_url?: string };
}

interface JikanAnimeRaw {
  mal_id: number;
  title: string;
  title_english: string;
  title_japanese: string;
  images: JikanImage;
  type: string;
  status: string;
  episodes: number;
  duration: string;
  rating: string;
  source: string;
  synopsis: string;
  background: string;
  aired: { string: string; from: string; to: string };
  score: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  genres: JikanMeta[];
  theme: { openings: string[]; endings: string[] };
  relations: { relation: string; entry: JikanMeta[] }[];
  producers: JikanMeta[];
  licensors: JikanMeta[];
  studios: JikanMeta[];
}

interface JikanCharacterRaw {
  character: { mal_id: number; name: string; images: JikanImage };
  role: string;
  voice_actors: { person: { mal_id: number; name: string; images: JikanImage }; language: string }[];
}

interface JikanStaffRaw {
  person: { mal_id: number; name: string; images: JikanImage };
  positions: string[]; // Jikan returns array of roles like ["Director", "Storyboard"]
}


// ==========================================
// 3. FETCHER & MAPPER LOGIC
// ==========================================

const BASE_URL = 'https://api.jikan.moe/v4';
const DELAY_MS = 1000; // Jikan Rate limit protection

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchJikan<T>(endpoint: string): Promise<T> {
  console.log(`[FETCHER] Requesting: ${endpoint}`);
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`Jikan API Error ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return json.data;
}

export async function getFullAnimeDetails(malId: number): Promise<Anime> {
  // 1. Fetch Basic Metadata
  const rawAnime = await fetchJikan<JikanAnimeRaw>(`/anime/${malId}/full`);
  await sleep(DELAY_MS);

  // 2. Fetch Characters
  const rawChars = await fetchJikan<JikanCharacterRaw[]>(`/anime/${malId}/characters`);
  await sleep(DELAY_MS);

  // 3. Fetch Staff
  const rawStaff = await fetchJikan<JikanStaffRaw[]>(`/anime/${malId}/staff`);

  // --- MAPPING LOGIC ---
  
  // Map Companies
  const companies: AnimeCompany[] = [
    ...rawAnime.producers.map(p => ({ company: { id: p.mal_id, name: p.name }, type: 'Producer' as const })),
    ...rawAnime.licensors.map(p => ({ company: { id: p.mal_id, name: p.name }, type: 'Licensor' as const })),
    ...rawAnime.studios.map(p => ({ company: { id: p.mal_id, name: p.name }, type: 'Studio' as const })),
  ];

  // Map Themes
  const themes: AnimeTheme[] = [
    ...(rawAnime.theme?.openings || []).map(t => ({ type: 'Opening' as const, text: t })),
    ...(rawAnime.theme?.endings || []).map(t => ({ type: 'Ending' as const, text: t })),
  ];

  // Map Relations
  const relatedEntries: RelatedEntry[] = rawAnime.relations?.flatMap(rel => 
    rel.entry.filter(e => e.type === 'anime').map(entry => ({
      relationType: rel.relation,
      relatedAnimeId: entry.mal_id,
      relatedAnimeTitle: entry.name
    }))
  ) || [];

  // Map Characters & Voice Actors
  const characters: AnimeCharacter[] = rawChars.map(c => ({
    role: c.role as RoleType,
    character: {
      id: c.character.mal_id,
      name: c.character.name,
      image: c.character.images?.jpg?.image_url || null
    },
    voiceActors: c.voice_actors.map(va => ({
      language: va.language,
      person: {
        id: va.person.mal_id,
        name: va.person.name,
        image: va.person.images?.jpg?.image_url || null
      }
    }))
  }));

  // Map Staff
  // Flattening positions: One person might have multiple roles, creating multiple entries or strict role strings
  const staff: AnimeStaff[] = rawStaff.flatMap(s => 
    s.positions.map(role => ({
      role: role,
      person: {
        id: s.person.mal_id,
        name: s.person.name,
        image: s.person.images?.jpg?.image_url || null
      }
    }))
  );

  return {
    id: rawAnime.mal_id,
    title: rawAnime.title,
    titleEnglish: rawAnime.title_english,
    titleJapanese: rawAnime.title_japanese,
    type: rawAnime.type,
    status: rawAnime.status,
    episodes: rawAnime.episodes,
    duration: rawAnime.duration,
    rating: rawAnime.rating,
    source: rawAnime.source,
    airedString: rawAnime.aired?.string,
    airedFrom: rawAnime.aired?.from ? new Date(rawAnime.aired.from) : null,
    airedTo: rawAnime.aired?.to ? new Date(rawAnime.aired.to) : null,
    mainPicture: rawAnime.images?.jpg?.large_image_url || rawAnime.images?.jpg?.image_url,
    synopsis: rawAnime.synopsis,
    background: rawAnime.background,
    
    stats: {
      score: rawAnime.score,
      ranked: rawAnime.rank,
      popularity: rawAnime.popularity,
      members: rawAnime.members,
      favorites: rawAnime.favorites
    },
    
    genres: rawAnime.genres.map(g => ({ id: g.mal_id, name: g.name })),
    companies,
    themes,
    relatedEntries,
    characters,
    staff
  };
}


// ==========================================
// 4. TEST RUNNER (PoC Verification)
// ==========================================

async function runTest() {
  const FRIEREN_ID = 52991; // "Sousou no Frieren"

  console.log(`\n--- STARTING POC TEST FOR ID: ${FRIEREN_ID} ---\n`);
  
  try {
    const start = Date.now();
    const anime = await getFullAnimeDetails(FRIEREN_ID);
    const duration = Date.now() - start;

    console.log(`\n--- FETCH COMPLETE (${duration}ms) ---`);
    console.log(`Title: ${anime.title} (${anime.titleJapanese})`);
    console.log(`Score: ${anime.stats.score} (Ranked #${anime.stats.ranked})`);
    
    // --- ASSERTIONS ---
    console.log('\n--- RUNNING ASSERTIONS ---');

    // 1. Basic Metadata Check
    assert.strictEqual(anime.id, FRIEREN_ID, 'ID mismatch');
    assert.ok(anime.title.includes('Frieren'), 'Title should contain "Frieren"');
    assert.ok(anime.synopsis && anime.synopsis.length > 50, 'Synopsis should be populated');
    console.log('✅ Metadata Verified');

    // 2. Relations Check (Madhouse produced it)
    const madhouse = anime.companies.find(c => c.company.name === 'Madhouse');
    assert.ok(madhouse, 'Madhouse should be listed as a company');
    assert.strictEqual(madhouse?.type, 'Studio', 'Madhouse should be a Studio');
    console.log('✅ Company/Studio Verified');

    // 3. Character Check (Frieren is Main)
    const frierenChar = anime.characters.find(c => c.character.name.includes('Frieren'));
    assert.ok(frierenChar, 'Character "Frieren" should exist');
    assert.strictEqual(frierenChar?.role, 'Main', 'Frieren should be a Main character');
    console.log('✅ Character Data Verified');

    // 4. Voice Actor Check (Atsumi Tanezaki is the JP VA)
    const jpVA = frierenChar?.voiceActors.find(va => va.language === 'Japanese');
    assert.ok(jpVA?.person.name.includes('Tanezaki'), 'Atsumi Tanezaki should be the JP VA');
    console.log('✅ Voice Actor Data Verified');

    // 5. Staff Check (Evan Call did the music)
    const composer = anime.staff.find(s => s.role === 'Music' && s.person.name === 'Evan Call');
    assert.ok(composer, 'Evan Call should be listed for Music');
    console.log('✅ Staff Data Verified');

    // 6. Theme Check
    assert.ok(anime.themes.length > 0, 'Themes (OP/ED) should be present');
    console.log('✅ Themes Verified');

    console.log(`\n[SUCCESS] All checks passed for: ${anime.title}`);
    
  } catch (error) {
    console.error('\n[FAILED] Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Execute
runTest();
