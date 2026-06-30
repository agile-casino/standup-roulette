# merge-mentor Integration Plan: standup-roulette

This document outlines the steps to configure **merge-mentor** to automatically review pull requests in the **standup-roulette** repository using GitHub Actions and the **OpenCode Go** AI provider.

---

## 1. Objectives

To introduce automated AI-driven pull request review reviews into the CI pipeline of **standup-roulette** to:

- Catch errors, security gaps, or structural problems automatically on PR creation or updates.
- Optimize developer iteration speed using budget-friendly open-source models via the **OpenCode Go** API.
- Post structured inline review comments on the pull request.

---

## 2. Secrets & Permissions Setup

To allow the workflow to query code changes and write inline comments, the following permissions and secrets are required:

### Step 2.1: GitHub Repository Permissions

Ensure the workflow has write permissions to post comments to Pull Requests. This is configured in the workflow YAML under:

```yaml
permissions:
  contents: read
  pull-requests: write
```

### Step 2.2: Add Repository Secrets

In your GitHub repository settings, navigate to **Settings ➡️ Secrets and variables ➡️ Actions** and add the following secret:

- **`OPENCODE_API_KEY`**: Your personal OpenCode Go API key obtained from your OpenCode dashboard.

---

## 3. Workflow Design

We will create a new GitHub Actions workflow file: [review.yml](file:///root/standup-roulette/.github/workflows/review.yml).

### Workflow Content:

```yaml
name: AI Pull Request Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    runs-on: ubuntu-latest
    if: github.actor != 'dependabot[bot]' # Avoid reviewing dependabot PRs

    steps:
      - name: Checkout Code
        uses: actions/checkout@v5
        with:
          fetch-depth: 0 # Required for git diff comparison

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Enable Corepack & Install dependencies
        run: |
          npm i -g corepack@latest
          corepack enable
          pnpm install

      - name: Run AI Code Review
        run: |
          npx merge-mentor review \
            --pr ${{ github.event.number }} \
            --provider opencode-sdk \
            --write
        env:
          # Platform variables
          MM_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          MM_GITHUB_REPO_OWNER: ${{ github.repository_owner }}
          MM_GITHUB_REPO_NAME: ${{ github.event.repository.name }}
          # AI provider credentials
          OPENCODE_API_KEY: ${{ secrets.OPENCODE_API_KEY }}
```

---

## 4. Customizing Review Strategies (Optional)

The `merge-mentor` CLI supports extra options to tailor reviews to the project's codebase:

- **deep mode:** Add `--strategy deep` for deeper reasoning, or omit for `--strategy fast` (lower cost, faster feedback loop).
- **focused passes:** Add `--pass database` or `--pass testing` to focus feedback on those domains.

---

## 5. Verification

1. **Submit a Test PR:** Open a draft pull request containing a simple bug (e.g. an unused import or an unhandled promise rejection).
2. **Verify Execution:** Go to the repository's **Actions** tab, check the "AI Pull Request Review" workflow log, and verify it executes without error.
3. **Verify Feedback:** Confirm that `merge-mentor` successfully posts inline suggestions to the PR code diff.
