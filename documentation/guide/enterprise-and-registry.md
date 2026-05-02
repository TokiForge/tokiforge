---
title: Enterprise roadmap | Registry & governance
description: Directional notes for team governance, SSO, and a cloud-hosted token registry—not shipped as product code in open source today.
---

# Enterprise roadmap: registry and governance

This page summarizes **long-term product directions** referenced in the project [ROADMAP](https://github.com/TokiForge/tokiforge/blob/main/ROADMAP.md). It is **documentation only**: TokiForge OSS today focuses on the runtime engine, CLI, adapters, and documentation—**not** a hosted multi-tenant registry or SSO product.

## Problems enterprises hit

- **Multiple teams** editing tokens concurrently need merge policies and audit trails.
- **Compliance** may require SSO (SAML/OIDC), RBAC, and environment separation (prod vs sandbox tokens).
- **Distribution** of canonical tokens across repos and pipelines benefits from a **single source of truth** with versioning APIs.

## Architectural directions

### Token registry (conceptual)

A registry service would:

- Store versioned token JSON/YAML with semver or calendar versioning.
- Expose read APIs (REST/GraphQL/gRPC) for CI and apps.
- Emit webhooks on publish for downstream rebuilds.

Clients could continue to use **`@tokiforge/core`** locally while fetching snapshots from the registry at build time.

### Governance

- **Approval workflows** before a token version is promoted (draft → review → published).
- **Deprecation contracts**: align with [`TokenVersioning`](/api/core#tokenversioning) fields (`deprecated`, `replacedBy`, migration metadata).

### SSO and teams

- Map IdP groups to registry roles (viewer, editor, publisher).
- Audit log of who published which version.

## What exists in OSS today

- **Token versioning & migrations** in core (`TokenVersioning`, CLI `migrate`, `generate:changelog` style tooling).
- **CI validation** via `tokiforge validate` and exit codes.
- **No** cloud dashboard, SSO, or hosted registry in this repository.

## Contributing

If you are building a commercial registry or governance layer on top of TokiForge, consider contributing **integration guides** or **example CI recipes** back to the OSS docs—without coupling proprietary services into the core packages.
