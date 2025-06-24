# saga-soa

## Introduction

**saga-soa** is a modern, modular monorepo for building service-oriented architectures (SOA) in educational and experimental environments. It leverages [Turborepo](https://turbo.build/), [pnpm](https://pnpm.io/), and a collection of composable packages to enable scalable, introspectable, and schema-driven APIs. The project is organized into apps (web, docs) and packages (config, db, UI, etc.), supporting both serverless and traditional deployments.

Key features:
- Monorepo powered by Turborepo for fast, incremental builds
- Introspectable, schemaful APIs (type-graphql, tRPC, REST)
- Modular, logically composable microservices
- Flexible deployment: serverless or server
- Strong focus on developer experience and maintainability

## Build Out

This project is under active development. The following packages have some level of build out:

- **@saga-soa/config**: Strongly-typed configuration management using Zod schemas for runtime validation and TypeScript safety. Supports environment variable-based configuration, dependency injection (Inversify), and mock configuration for testing.
- **@saga-soa/db**: Helpers for managing connections to supported databases (MongoDB, SQL/MySQL, Redis). Designed for use with Inversify to manage shared and multiple database instances within the monorepo.

For more details and project tracking, see the [Project Board](https://github.com/orgs/hipponot/projects/22).

## Getting Started

[➡️ See Getting Started & Build Cheatsheet](docs/GETTING-STARTED.md)

## Architecture

![alt text](arc.png)