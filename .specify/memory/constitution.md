<!--
Sync Impact Report:
- Version change: NEW → 1.0.0
- New constitution created for Standup Roulette project
- Modified principles: N/A (new constitution)
- Added sections: Browser Integration, User Experience, Data Privacy, Cross-Platform Compatibility, Component Architecture, Technical Standards, Development Workflow
- Removed sections: N/A (new constitution)
- Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ compatible (references constitution checks)
  - .specify/templates/spec-template.md: ✅ compatible (no constitution-specific content)
  - .specify/templates/tasks-template.md: ✅ compatible (follows TDD principles)
- Follow-up TODOs: None - all placeholders resolved
-->

# Standup Roulette Constitution

## Core Principles

### I. Browser Integration
All features MUST integrate seamlessly with Azure DevOps without breaking existing functionality. The userscript MUST be non-intrusive, activating only on recognized Azure DevOps sprint taskboard URLs. Integration points require explicit URL pattern matching and defensive DOM manipulation to prevent conflicts with Azure DevOps updates.

**Rationale**: As a userscript enhancement, maintaining compatibility with the host application is critical for user adoption and preventing disruption to existing workflows.

### II. User Experience
The interface MUST be intuitive and require zero configuration for basic functionality. Visual design MUST respect the host application's theme (light/dark mode detection required). All user interactions MUST provide immediate visual feedback, and the roulette animation MUST complete within reasonable time bounds (< 3 seconds).

**Rationale**: Standup meetings are time-sensitive; any tool that slows down or complicates the process defeats its purpose.

### III. Data Privacy (NON-NEGOTIABLE)
All user data MUST remain local to the browser. No external API calls for user information transmission. Team member data and game state MUST use browser localStorage only. Personal information extraction from Azure DevOps MUST be minimal and limited to display names and team assignments.

**Rationale**: Corporate environments require strict data privacy compliance, and any external data transmission could violate security policies.

### IV. Cross-Platform Compatibility
Code MUST work across major browsers (Chrome, Firefox, Edge) and userscript managers (Tampermonkey, Greasemonkey). Browser-specific APIs require feature detection and graceful degradation. The build system MUST produce a single, self-contained userscript file.

**Rationale**: Teams use diverse browser setups; platform-specific dependencies limit adoption and create support burdens.

### V. Component Architecture
React components MUST be self-contained with clear prop interfaces. Redux state management MUST follow established patterns with typed actions and selectors. Each component MUST have a single responsibility and be independently testable. TypeScript MUST be used throughout with strict type checking enabled.

**Rationale**: Maintainability and code quality are essential for a project that integrates with a frequently-updated external platform.

## Technical Standards

Modern development practices are required: Vite for build tooling, Biome for linting/formatting, Vitest for testing. The codebase MUST maintain TypeScript strict mode compliance. CSS Modules MUST be used for styling to prevent conflicts with host application styles. Package updates follow semantic versioning with automated dependency management via Renovate.

## Development Workflow

All changes require type safety verification and linting compliance before integration. Test coverage is expected for core roulette logic and state management. Visual testing is performed against Azure DevOps demo environments. Version bumps follow semantic versioning based on user-facing changes and userscript compatibility.

## Governance

This constitution governs all development decisions and feature additions. Changes to core principles require explicit justification and impact assessment. All pull requests MUST verify compliance with browser integration and data privacy principles. Complex features MUST include implementation plans documenting Azure DevOps compatibility considerations.

**Version**: 1.0.0 | **Ratified**: 2025-09-19 | **Last Amended**: 2025-09-19