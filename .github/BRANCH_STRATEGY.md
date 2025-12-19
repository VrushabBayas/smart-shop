# Branching Strategy for Shop-Smart

## Branch Overview

| Branch | Purpose | Deploys To | Merge From |
|--------|---------|------------|------------|
| `main` | Production-ready code | Production | `uat` |
| `uat` | User acceptance testing | UAT environment | `staging` |
| `staging` | QA/Pre-release testing | Staging environment | `develop` |
| `develop` | Active development | Dev environment | Feature branches |

## Workflow

```
Feature Branch → develop → staging → uat → main
```

### Feature Development
1. Create feature branch from `develop`: `git checkout -b feature/my-feature develop`
2. Develop and commit changes
3. Open PR to `develop`
4. Merge after code review and CI passes

### Release Flow
1. `develop` → `staging`: After features are complete, merge to staging for QA
2. `staging` → `uat`: After QA approval, merge to UAT for user testing
3. `uat` → `main`: After UAT approval, merge to main for production release

## Branch Protection (Recommended)

Configure in GitHub Settings → Branches:

- **Require pull requests** before merging
- **Require status checks** to pass
- **Require approvals** (1-2 reviewers)
- **Restrict who can push** to protected branches

## Hotfix Process

For urgent production fixes:
1. Create `hotfix/` branch from `main`
2. Fix and test
3. Merge to `main` AND back-merge to `develop`
