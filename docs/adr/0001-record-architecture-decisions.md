# 1. Record architecture decisions

## Status
Accepted

## Context
Hotela's masterplan describes a large target architecture (microservices,
7 databases, Kubernetes). Decisions about what to actually build, and when,
need a durable record separate from that aspirational document so future
contributors (or a future second engineer) can see why the codebase departs
from the masterplan at any given point.

## Decision
Use Architecture Decision Records (ADRs) in this folder, one per significant
decision, numbered sequentially. Follow the format: Status, Context,
Decision, Consequences.

## Consequences
Anyone changing a foundational choice (e.g. "split the monolith into
services," "add MongoDB") should add an ADR here rather than only updating
code comments or Slack history.
