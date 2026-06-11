---
title: GitLab 19.0 moves the secrets manager into the pipeline
date: 2026-06-11
tag: Tools
excerpt: 'GitLab 19.0 bundles OpenBao as a native secrets store, so you stop running a standalone Vault just to feed your pipelines.'
readMins: 5
hashtags: [GitLab, CICD, DevSecOps, SecretsManagement, DevOps]
preview:
  - ['$', 'cat gitlab-native-secrets-manager.md']
  - ['#', '# GitLab native secrets manager']
  - [' ', '']
  - [' ', 'GitLab 19.0 ships a secrets manager']
  - [' ', 'built on OpenBao, the Vault fork.']
  - [' ', '']
  - [' ', 'You store a credential against a project']
  - [' ', 'and a job reads it only when you name']
  - [' ', 'it. One access model, one audit log...']
---

```yaml title=".gitlab-ci.yml"
deploy:
  stage: deploy
  secrets:
    DEPLOY_TOKEN:
      gitlab_secrets_manager:
        name: prod-deploy-token
  script:
    - ./deploy --token "$DEPLOY_TOKEN"
```

GitLab [released 19.0 on May 21](https://docs.gitlab.com/releases/19/gitlab-19-0-released/), and the headline CI/CD feature is a native secrets manager. You store a credential inside GitLab, name it in the job that needs it, and the job reads it at runtime. No second system holds your pipeline credentials. The [GitLab Secrets Manager](https://docs.gitlab.com/ci/secrets/secrets_manager/) sits in open beta for Premium and Ultimate on both GitLab.com and Self-Managed.

## What runs underneath

GitLab built the manager on [OpenBao](https://handbook.gitlab.com/handbook/engineering/architecture/design-documents/secret_manager/decisions/007_openbao/), the open-source fork of HashiCorp Vault, and bundles it into the platform. The Rails backend and the runners talk to the OpenBao API through a load balancer, and OpenBao persists secrets in PostgreSQL. You never provision or patch that service yourself. GitLab ships and operates it as part of the install.

A project or group Owner stores a secret and scopes it to that project or group. A pipeline job reads the secret only when it requests the secret by name, so a job that never names `prod-deploy-token` never sees it.

## Scoping limits the blast radius

GitLab decides which jobs can pull a given secret from the job's own attributes: the environment it targets, the branch it runs on, and whether that branch carries protection. A credential scoped to a protected production branch stays out of reach of a job running on an unmerged feature branch.

```yaml title=".gitlab-ci.yml"
secrets:
  DEPLOY_TOKEN:
    gitlab_secrets_manager:
      name: prod-deploy-token
  environment: production
  token: $CI_JOB_JWT
```

Leak a feature-branch token and you have not handed over the production deploy. The scope rules draw that boundary before a job ever starts, so a compromised low-trust branch cannot reach a high-trust secret. [The New Stack walks through](https://thenewstack.io/gitlab-19-secrets-manager/) how those job attributes map to read permissions.

## One access model instead of two

Teams have pulled CI secrets out of `.gitlab-ci.yml` for years by standing up a HashiCorp Vault next to GitLab. That keeps secrets out of the config file and adds a standing operational tax. You authenticate against a second service, you keep a second access model in sync with your GitLab roles, and you correlate a second audit stream at 2 a.m. when a credential leaks.

The native manager collapses that work. GitLab translates its own roles into OpenBao policies for you, so you reason about a single permission model. Grant a developer the Maintainer role and GitLab writes the matching OpenBao policy behind the scenes. The audit log lands in the same UI as the pipeline that pulled the secret, so an incident review reads one timeline rather than two.

> Run a standalone Vault only to feed GitLab pipelines, and you pay an operational tax the platform now absorbs. Weigh that cost against what you get inside GitLab.

## Adoption stays incremental

The manager runs alongside your existing integrations with HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, and Google Cloud Secret Manager, so you migrate one pipeline at a time rather than cutting over in a single change. [Help Net Security notes](https://www.helpnetsecurity.com/2026/05/22/gitlab-19-0-adds-ai-workflows-secrets-management-and-self-hosted-model-support/) that the beta covers Premium and Ultimate across SaaS and self-managed installs, and [GitLab's own beta announcement](https://about.gitlab.com/blog/secrets-manager-in-public-beta/) lays out the rollout.

If you run a dedicated Vault cluster for an organization that already standardized on it, that investment still pays. The native manager changes the math for the smaller case: the team that stood up Vault only to keep three tokens out of a pipeline config. That team carries a whole service for a job the platform now does.

## Where this fits in 19.0

The release carries more than secrets. Pipeline inputs accept multiple dropdown values combined into an array, Components Analytics surfaces which CI/CD Catalog components run across an org, and Dependency Scanning gains a default profile. [SecurityBrief's roundup](https://securitybrief.news/story/gitlab-19-0-adds-secrets-manager-ai-workflow-tools) covers the AI workflow additions alongside the secrets work. The secrets manager is the piece that removes a system from your stack rather than adding a feature to it.

Check whether you run a Vault that exists only to hand secrets to GitLab. If you do, the 19.0 beta gives you a path to retire it and reason about one access model, one audit log, and one service to operate.

I first shared this [on LinkedIn](https://www.linkedin.com/feed/update/urn:li:share:7470969449622212608).
