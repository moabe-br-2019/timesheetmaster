# Deploy Skill

Automate the secure deployment workflow for the Timesheet application.

## Usage

```
/deploy [target]
```

**Arguments:**
- `target` (optional): Where to deploy
  - `preview` - Create a preview deployment from a feature branch (default)
  - `staging` - Deploy to staging (develop branch)
  - `production` - Deploy to production (main branch) with approval
  - `setup` - Initial setup of CI/CD workflow

## Examples

```bash
# Deploy current feature to preview
/deploy

# Deploy to staging
/deploy staging

# Deploy to production (requires approval)
/deploy production

# Setup CI/CD from scratch
/deploy setup
```

## What It Does

### `/deploy` or `/deploy preview`
1. Checks current branch
2. Ensures changes are committed
3. Pushes to remote
4. Creates Pull Request to `develop`
5. Waits for CI checks
6. Shows preview URL when ready

### `/deploy staging`
1. Merges approved feature PR to `develop`
2. Triggers automatic deployment to staging
3. Shows staging URL
4. Monitors deployment status

### `/deploy production`
1. Creates PR from `develop` to `main`
2. Waits for CI checks
3. Waits for manual approval
4. Deploys to production
5. Verifies deployment

### `/deploy setup`
1. Checks for required secrets (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
2. Creates `develop` branch if doesn't exist
3. Sets up GitHub Actions workflow
4. Configures branch protection rules
5. Creates production environment with approvers
6. Runs initial test

## Instructions

You are a deployment automation assistant for a Cloudflare Pages application with a secure CI/CD workflow.

### Context

The application uses:
- **Branches**: `main` (production), `develop` (staging), `feature/*` (development)
- **CI/CD**: GitHub Actions with automated tests and deployments
- **Platform**: Cloudflare Pages
- **Protection**: Branch protection rules, required approvals for production

### When the user invokes `/deploy [target]`

#### 1. Determine the target (default: preview)

#### 2. Check prerequisites:
- Git repository exists
- Working directory is clean (or prompt to commit)
- Required secrets are configured (for setup)
- GitHub CLI is available (optional, fallback to manual steps)

#### 3. Execute workflow based on target:

**For `preview`:**
```bash
# 1. Check current branch
current_branch=$(git branch --show-current)

# 2. Ensure not on main or develop
if [[ "$current_branch" == "main" || "$current_branch" == "develop" ]]; then
  echo "Create a feature branch first"
  read -p "Enter feature name: " feature_name
  git checkout -b "feature/$feature_name"
fi

# 3. Push branch
git push -u origin HEAD

# 4. Create PR to develop (if doesn't exist)
gh pr create --base develop --fill || echo "PR already exists"

# 5. Show PR URL
gh pr view --web
```

**For `staging`:**
```bash
# 1. Ensure on develop or merge from feature
current_branch=$(git branch --show-current)

if [[ "$current_branch" != "develop" ]]; then
  # Check if feature PR is approved
  pr_number=$(gh pr list --head "$current_branch" --base develop --json number -q '.[0].number')

  if [ -z "$pr_number" ]; then
    echo "No PR found. Creating one..."
    gh pr create --base develop --fill
  else
    echo "Checking PR status..."
    # Wait for approval and checks
    gh pr checks "$pr_number" --watch

    # Merge PR
    gh pr merge "$pr_number" --auto --squash
  fi
fi

# 2. Switch to develop and pull
git checkout develop
git pull origin develop

# 3. Monitor deployment
echo "Deployment triggered. Monitoring..."
# Show Actions run
gh run watch
```

**For `production`:**
```bash
# 1. Ensure develop is up to date
git checkout develop
git pull origin develop

# 2. Create PR from develop to main
gh pr create --base main --head develop --fill

# 3. Wait for checks
pr_number=$(gh pr list --head develop --base main --json number -q '.[0].number')
gh pr checks "$pr_number" --watch

# 4. Prompt for approval
echo "PR created: $(gh pr view $pr_number --json url -q .url)"
echo "Approval required. Waiting for manual approval..."
echo "Go to GitHub and approve the deployment in the 'production' environment"
read -p "Press enter when approved..."

# 5. Merge PR
gh pr merge "$pr_number" --auto --squash

# 6. Monitor production deployment
git checkout main
git pull origin main
gh run watch
```

**For `setup`:**
```bash
# 1. Check secrets
echo "Checking for required secrets..."
# Guide user to add secrets if missing

# 2. Create develop branch
git checkout main
git pull origin main
git checkout -b develop || git checkout develop
git push -u origin develop

# 3. Add workflow files (already exist in .github/workflows/deploy.yml)
echo "Workflow files already configured"

# 4. Configure branch protection
echo "Configure branch protection rules:"
echo "1. Go to: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/settings/branches"
echo "2. Follow instructions in SETUP_SEGURO.md"

# 5. Create production environment
echo "Create production environment:"
echo "1. Go to: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/settings/environments"
echo "2. Create 'production' environment"
echo "3. Add required reviewers"

read -p "Press enter when done..."

# 6. Test workflow
echo "Testing workflow with a simple change..."
git checkout -b feature/test-cicd
echo "" >> README.md
git add README.md
git commit -m "test: verify CI/CD setup"
git push -u origin feature/test-cicd
gh pr create --base develop --title "Test CI/CD" --body "Automated test of CI/CD setup"
```

#### 4. Provide status updates:
- Show clear progress indicators
- Display URLs (PRs, deployments)
- Show estimated time when applicable
- Provide next steps

#### 5. Handle errors gracefully:
- If `gh` CLI not available: provide manual steps with URLs
- If secrets missing: guide to add them
- If checks fail: show logs and suggest fixes
- If approval timeout: provide reminder

#### 6. Verify deployment (for production):
```bash
# Check if site is accessible
curl -I https://timesheetmaster.pages.dev

# Show deployment info
gh api repos/:owner/:repo/pages/builds/latest
```

### Important Notes:

- **Always** confirm before merging to main
- **Always** show clear status of what's happening
- **Never** skip approval for production
- **Always** verify deployment succeeded
- **Provide** rollback instructions if something fails

### Rollback Command:

If deployment fails, provide:
```bash
# Via Cloudflare Dashboard
echo "1. Go to https://dash.cloudflare.com"
echo "2. Pages → timesheetmaster → Deployments"
echo "3. Find previous working deployment"
echo "4. Click '...' → Rollback to this deployment"

# Via Git
git revert HEAD
git push origin main
```

### Safety Checks:

Before any deployment:
1. ✅ All tests passing
2. ✅ Branch is up to date
3. ✅ No uncommitted changes (or prompt to commit)
4. ✅ PR approved (for staging/production)
5. ✅ Manual confirmation (for production)

### Output Format:

Use clear, emoji-enhanced output:
- 🚀 Starting deployment
- ⏳ Waiting for checks
- ✅ Checks passed
- 👀 Waiting for approval
- 📦 Deploying
- ✨ Deployment successful
- 🔗 URL: [link]
- ❌ Error: [message]

### Monitoring:

For background deployments, offer to:
- Watch in terminal (gh run watch)
- Open in browser (gh run view --web)
- Check status later (gh run list)
