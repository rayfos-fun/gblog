# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-01-17

### Added
- Migration to Astro framework, replacing Jekyll.
- Dark/Light theme toggle functionality.
- Description field to UI cards for better content summary in list views.
- New web games section including an implementation of *2048* and *Lights out*.
- New technical articles and blog posts.

### Changed
- Complete architecture overhaul to improve build speed and site performance (Lighthouse Performance score: 100).
- Updated deployment workflows to support Astro build process.

### Removed
- Ruby and Gemfile dependencies (for Jekyll).

## [1.0.0] - 2026-01-06

### Added
- **Infrastructure**
    - Initialized project structure based on Jekyll.
    - Configured deployment workflow for Google App Engine (GAE).
    - Implemented multi-language support (en, zh-tw, zh-cn).
- **Features**
    - Integrated Google OAuth for user authentication.
    - Implemented a comment system for articles.
    - Added basic SEO configurations (Sitemap, Robots.txt).
- **Games**
    - Launched initial set of web games: Peg Solitaire, Tower of Hanoi, 4 Color Memory Game... etc.
    - Integrated custom background music and sound effects (SFX) to enhance gameplay experience.
    - Integrated custom-composed background music (BGM) for games.
- **Content**
    - Established category structure for Blog and Novels.
    - Included the initial collection of technical articles and novel chapters.
