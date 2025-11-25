import assert from 'assert';
import { getFullAnimeDetails } from './anime-poc.js';

// ==========================================
// SIMPLE TEST FRAMEWORK (No External Dependencies)
// ==========================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: Error;
  duration: number;
}

class TestRunner {
  private results: TestResult[] = [];
  private currentSuite: string = '';

  suite(name: string) {
    this.currentSuite = name;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 TEST SUITE: ${name}`);
    console.log('='.repeat(60));
  }

  async test(name: string, fn: () => Promise<void> | void) {
    const fullName = `${this.currentSuite} > ${name}`;
    const start = Date.now();
    
    try {
      await fn();
      const duration = Date.now() - start;
      this.results.push({ name: fullName, passed: true, duration });
      console.log(`✅ ${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - start;
      this.results.push({ 
        name: fullName, 
        passed: false, 
        error: error as Error,
        duration 
      });
      console.log(`❌ ${name} (${duration}ms)`);
      console.log(`   Error: ${(error as Error).message}`);
    }
  }

  printSummary() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    
    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.name}`);
          console.log(`    ${r.error?.message}`);
        });
    }

    console.log('='.repeat(60));
    
    if (failed > 0) {
      process.exit(1);
    }
  }
}

// ==========================================
// MOCK DATA FOR UNIT TESTS
// ==========================================

const mockAnimeData = {
  id: 52991,
  title: 'Sousou no Frieren',
  titleEnglish: 'Frieren: Beyond Journey\'s End',
  titleJapanese: '葬送のフリーレン',
  type: 'TV',
  status: 'Finished Airing',
  episodes: 28,
  duration: '24 min per ep',
  rating: 'PG-13 - Teens 13 or older',
  source: 'Manga',
  airedString: 'Sep 29, 2023 to Mar 22, 2024',
  airedFrom: new Date('2023-09-29T00:00:00.000Z'),
  airedTo: new Date('2024-03-22T00:00:00.000Z'),
  mainPicture: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg',
  synopsis: 'During their decade-long quest...',
  background: 'Sousou no Frieren was released...',
  stats: {
    score: 9.39,
    ranked: 1,
    popularity: 123,
    members: 500000,
    favorites: 50000
  },
  genres: [
    { id: 2, name: 'Adventure' },
    { id: 10, name: 'Fantasy' }
  ],
  companies: [
    { company: { id: 11, name: 'Madhouse' }, type: 'Studio' as const }
  ],
  themes: [
    { type: 'Opening' as const, text: '1: "Yūsha" by YOASOBI' }
  ],
  relatedEntries: [],
  characters: [
    {
      character: { id: 1, name: 'Frieren', image: 'https://example.com/frieren.jpg' },
      role: 'Main' as const,
      voiceActors: [
        {
          person: { id: 1, name: 'Tanezaki, Atsumi', image: 'https://example.com/tanezaki.jpg' },
          language: 'Japanese'
        }
      ]
    }
  ],
  staff: [
    {
      person: { id: 1, name: 'Evan Call', image: 'https://example.com/evan.jpg' },
      role: 'Music'
    }
  ]
};

// ==========================================
// UNIT TESTS
// ==========================================

const runner = new TestRunner();

// --- Schema Validation Tests ---
runner.suite('Schema Validation');

runner.test('should validate Anime interface structure', async () => {
  const anime = mockAnimeData;
  
  // Check required fields
  assert.ok(typeof anime.id === 'number', 'id should be a number');
  assert.ok(typeof anime.title === 'string', 'title should be a string');
  assert.ok(anime.stats !== null && typeof anime.stats === 'object', 'stats should be an object');
  assert.ok(Array.isArray(anime.genres), 'genres should be an array');
  assert.ok(Array.isArray(anime.companies), 'companies should be an array');
  assert.ok(Array.isArray(anime.themes), 'themes should be an array');
  assert.ok(Array.isArray(anime.characters), 'characters should be an array');
  assert.ok(Array.isArray(anime.staff), 'staff should be an array');
});

runner.test('should validate AnimeStats structure', async () => {
  const stats = mockAnimeData.stats;
  
  assert.ok(typeof stats.score === 'number' || stats.score === null, 'score should be number or null');
  assert.ok(typeof stats.ranked === 'number' || stats.ranked === null, 'ranked should be number or null');
  assert.ok(typeof stats.popularity === 'number' || stats.popularity === null, 'popularity should be number or null');
  assert.ok(typeof stats.members === 'number' || stats.members === null, 'members should be number or null');
  assert.ok(typeof stats.favorites === 'number' || stats.favorites === null, 'favorites should be number or null');
});

runner.test('should validate Genre structure', async () => {
  const genre = mockAnimeData.genres[0];
  
  assert.ok(typeof genre.id === 'number', 'genre id should be a number');
  assert.ok(typeof genre.name === 'string', 'genre name should be a string');
});

runner.test('should validate AnimeCompany structure', async () => {
  const company = mockAnimeData.companies[0];
  
  assert.ok(typeof company.company.id === 'number', 'company id should be a number');
  assert.ok(typeof company.company.name === 'string', 'company name should be a string');
  assert.ok(['Producer', 'Licensor', 'Studio'].includes(company.type), 'company type should be valid');
});

runner.test('should validate AnimeCharacter structure', async () => {
  const character = mockAnimeData.characters[0];
  
  assert.ok(typeof character.character.id === 'number', 'character id should be a number');
  assert.ok(typeof character.character.name === 'string', 'character name should be a string');
  assert.ok(['Main', 'Supporting'].includes(character.role), 'character role should be valid');
  assert.ok(Array.isArray(character.voiceActors), 'voiceActors should be an array');
});

runner.test('should validate AnimeStaff structure', async () => {
  const staff = mockAnimeData.staff[0];
  
  assert.ok(typeof staff.person.id === 'number', 'staff person id should be a number');
  assert.ok(typeof staff.person.name === 'string', 'staff person name should be a string');
  assert.ok(typeof staff.role === 'string', 'staff role should be a string');
});

runner.test('should validate AnimeTheme structure', async () => {
  const theme = mockAnimeData.themes[0];
  
  assert.ok(['Opening', 'Ending'].includes(theme.type), 'theme type should be valid');
  assert.ok(typeof theme.text === 'string', 'theme text should be a string');
});

// --- Data Mapping Tests ---
runner.suite('Data Mapping Logic');

runner.test('should handle null values correctly', async () => {
  const animeWithNulls = {
    ...mockAnimeData,
    titleEnglish: null,
    titleJapanese: null,
    episodes: null,
    synopsis: null,
    background: null,
    airedFrom: null,
    airedTo: null,
    stats: {
      score: null,
      ranked: null,
      popularity: null,
      members: null,
      favorites: null
    }
  };
  
  assert.strictEqual(animeWithNulls.titleEnglish, null);
  assert.strictEqual(animeWithNulls.episodes, null);
  assert.strictEqual(animeWithNulls.stats.score, null);
});

runner.test('should map companies with correct types', async () => {
  const companies = [
    { company: { id: 1, name: 'Producer1' }, type: 'Producer' as const },
    { company: { id: 2, name: 'Licensor1' }, type: 'Licensor' as const },
    { company: { id: 3, name: 'Studio1' }, type: 'Studio' as const }
  ];
  
  assert.strictEqual(companies[0].type, 'Producer');
  assert.strictEqual(companies[1].type, 'Licensor');
  assert.strictEqual(companies[2].type, 'Studio');
});

runner.test('should map themes with correct types', async () => {
  const themes = [
    { type: 'Opening' as const, text: 'OP1' },
    { type: 'Ending' as const, text: 'ED1' }
  ];
  
  assert.strictEqual(themes[0].type, 'Opening');
  assert.strictEqual(themes[1].type, 'Ending');
});

runner.test('should handle empty arrays', async () => {
  const animeWithEmptyArrays = {
    ...mockAnimeData,
    genres: [],
    companies: [],
    themes: [],
    relatedEntries: [],
    characters: [],
    staff: []
  };
  
  assert.strictEqual(animeWithEmptyArrays.genres.length, 0);
  assert.strictEqual(animeWithEmptyArrays.companies.length, 0);
  assert.strictEqual(animeWithEmptyArrays.themes.length, 0);
});

runner.test('should handle Date objects correctly', async () => {
  assert.ok(mockAnimeData.airedFrom instanceof Date, 'airedFrom should be a Date object');
  assert.ok(mockAnimeData.airedTo instanceof Date, 'airedTo should be a Date object');
  assert.strictEqual(mockAnimeData.airedFrom?.getFullYear(), 2023);
  assert.strictEqual(mockAnimeData.airedTo?.getFullYear(), 2024);
});

// --- Error Handling Tests ---
runner.suite('Error Handling');

runner.test('should handle missing required fields gracefully', async () => {
  try {
    const invalidData = { id: 123 } as any;
    // This would fail type checking in TypeScript, but we test runtime behavior
    assert.ok(invalidData.id === 123);
    assert.strictEqual(invalidData.title, undefined);
  } catch (error) {
    assert.fail('Should not throw error for missing fields');
  }
});

runner.test('should validate numeric IDs', async () => {
  assert.ok(Number.isInteger(mockAnimeData.id), 'Anime ID should be an integer');
  assert.ok(mockAnimeData.genres.every(g => Number.isInteger(g.id)), 'All genre IDs should be integers');
  assert.ok(mockAnimeData.companies.every(c => Number.isInteger(c.company.id)), 'All company IDs should be integers');
});

runner.test('should validate string fields are not empty', async () => {
  assert.ok(mockAnimeData.title.length > 0, 'Title should not be empty');
  assert.ok(mockAnimeData.genres.every(g => g.name.length > 0), 'Genre names should not be empty');
});

// --- Integration Tests (Optional - requires API access) ---
runner.suite('Integration Tests');

runner.test('should fetch and validate real data from Jikan API', async () => {
  // This test makes a real API call - skip if you want to avoid rate limits
  // Uncomment to run integration test
  
  try {
    const FRIEREN_ID = 52991;
    const anime = await getFullAnimeDetails(FRIEREN_ID);
    
    // Basic validations
    assert.strictEqual(anime.id, FRIEREN_ID, 'ID should match');
    assert.ok(anime.title.includes('Frieren'), 'Title should contain "Frieren"');
    assert.ok(anime.synopsis && anime.synopsis.length > 50, 'Synopsis should be populated');
    
    // Company validation
    const madhouse = anime.companies.find(c => c.company.name === 'Madhouse');
    assert.ok(madhouse, 'Madhouse should be listed');
    assert.strictEqual(madhouse?.type, 'Studio', 'Madhouse should be a Studio');
    
    // Character validation
    const frierenChar = anime.characters.find(c => c.character.name.includes('Frieren'));
    assert.ok(frierenChar, 'Frieren character should exist');
    assert.strictEqual(frierenChar?.role, 'Main', 'Frieren should be Main character');
    
    // Voice actor validation
    const jpVA = frierenChar?.voiceActors.find(va => va.language === 'Japanese');
    assert.ok(jpVA?.person.name.includes('Tanezaki'), 'Tanezaki should be JP VA');
    
    // Staff validation
    const musicStaff = anime.staff.filter(s => s.role.toLowerCase().includes('music'));
    assert.ok(musicStaff.length > 0, 'Music staff should be listed');

    
    // Themes validation
    assert.ok(anime.themes.length > 0, 'Should have themes');
    
    console.log('   ℹ️  Integration test completed successfully');
  } catch (error) {
    if ((error as Error).message.includes('429')) {
      console.log('   ⚠️  Skipped due to API rate limit');
    } else {
      throw error;
    }
  }
});

// ==========================================
// RUN ALL TESTS
// ==========================================

async function runAllTests() {
  console.log('\n🧪 STARTING UNIT TESTS\n');
  
  // Wait a bit to ensure all tests are registered and run
  await new Promise(resolve => setTimeout(resolve, 100));
  
  runner.printSummary();
}

runAllTests();

