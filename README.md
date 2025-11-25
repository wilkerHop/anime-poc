# Anime PoC - Jikan API Integration

<!-- Uncomment after pushing to GitHub and replace USERNAME with your GitHub username:
[![CI](https://github.com/USERNAME/anime-poc/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/anime-poc/actions/workflows/ci.yml)
-->

A TypeScript Proof-of-Concept demonstrating how to fetch and validate anime data from the [Jikan API](https://jikan.moe/) (MyAnimeList scraper).

<!-- Uncomment after enabling GitHub Pages and replace USERNAME with your GitHub username:
**🌐 [View Live Demo](https://USERNAME.github.io/anime-poc/)**
-->


## Features

- ✅ **Strict TypeScript Interfaces** - Complete schema definitions for anime data
- ✅ **Jikan API Integration** - Fetches live data from MyAnimeList via Jikan v4
- ✅ **Data Mapping** - Transforms raw API responses to structured schema
- ✅ **Built-in Tests** - Integrated test runner with assertions
- ✅ **Unit Tests** - Comprehensive test suite without external dependencies
- ✅ **Zero External Test Libraries** - Custom test framework included

## Project Structure

```
anime-poc/
├── src/
│   ├── anime-poc.ts       # Main PoC with fetcher and integrated tests
│   └── anime-poc.test.ts  # Comprehensive unit tests
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
npm install
```

## Usage

### Run the PoC (with live API integration test)

```bash
npm start
```

This will:
1. Fetch data for "Sousou no Frieren" (MAL ID: 52991)
2. Map the data to the schema
3. Run assertions to verify data integrity
4. Display results

### Run Unit Tests

```bash
npm test
```

This runs comprehensive unit tests covering:
- Schema validation
- Data mapping logic
- Error handling
- Integration tests (optional)

### Build TypeScript

```bash
npm run build
```

## Schema Overview

The PoC defines the following main interfaces:

- **Anime** - Main aggregate root with all anime data
- **AnimeStats** - Score, ranking, popularity metrics
- **Genre** - Genre information
- **Company** - Production companies (studios, producers, licensors)
- **Character** - Character information with voice actors
- **Person** - Staff and voice actor details
- **AnimeTheme** - Opening and ending themes

## API Integration

The PoC uses the Jikan API v4:
- Base URL: `https://api.jikan.moe/v4`
- Endpoints used:
  - `/anime/{id}/full` - Complete anime metadata
  - `/anime/{id}/characters` - Character and voice actor data
  - `/anime/{id}/staff` - Staff information

Rate limiting is handled with a 1-second delay between requests.

## Test Coverage

### Unit Tests
- ✅ Schema structure validation
- ✅ Data type validation
- ✅ Null value handling
- ✅ Array mapping
- ✅ Date object handling
- ✅ Error handling

### Integration Test
- ✅ Live API fetch and validation
- ✅ Real data integrity checks

## Example Output

```
--- STARTING POC TEST FOR ID: 52991 ---

[FETCHER] Requesting: /anime/52991/full
[FETCHER] Requesting: /anime/52991/characters
[FETCHER] Requesting: /anime/52991/staff

--- FETCH COMPLETE (3245ms) ---
Title: Sousou no Frieren (葬送のフリーレン)
Score: 9.39 (Ranked #1)

--- RUNNING ASSERTIONS ---
✅ Metadata Verified
✅ Company/Studio Verified
✅ Character Data Verified
✅ Voice Actor Data Verified
✅ Staff Data Verified
✅ Themes Verified

[SUCCESS] All checks passed for: Sousou no Frieren
```

## Technologies

- **TypeScript** 5.9+
- **tsx** - TypeScript execution
- **Node.js** 18+
- **Jikan API v4** - MyAnimeList data source

## CI/CD & Deployment

This project uses GitHub Actions for continuous integration and deployment:

- **CI Workflow** - Automatically runs on every push to `main`:
  - TypeScript build verification
  - Unit test execution (16 tests)
  - PoC integration test
  
- **GitHub Pages** - Automated deployment:
  - Neo-brutalist design showcase
  - Live test results
  - Deployed from `/docs` directory

View the live site at: **[USERNAME.github.io/anime-poc](https://USERNAME.github.io/anime-poc/)**

## License

ISC

