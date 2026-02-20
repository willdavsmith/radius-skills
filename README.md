# Radius Skills

Infrastructure and platform engineering skills for AI coding assistants. Each skill lives in its own sub-directory under `skills/` and helps developers and platform engineers work smarter with cloud infrastructure.

## Installation

### skills.sh

```bash
npx skills add radius-skills
```

See [skills.sh](https://skills.sh) for more info.

### Cursor plugin

In Cursor chat, add this repository as a plugin:

```bash
/add-plugin radius-skills
```

## Available Skills

### platform-constitution

Define your organization's platform engineering standards by generating a `Platform-Engineering-Constitution.md`. Walks through an interactive workflow to capture cloud providers, compute platforms, IaC tooling, approved modules, and infrastructure policies.

### app-audit *(coming soon)*

Audit applications against your platform engineering constitution. Validate that code, configurations, and deployments align with organizational standards.

### cloud-architecture *(coming soon)*

Design optimal cloud architecture based on your platform engineering requirements. Generate architecture recommendations aligned with your constitution.

## Repo Structure

```
radius-skills/
├── .cursor-plugin/
│   └── plugin.json
├── README.md
├── LICENSE
└── skills/
    ├── platform-constitution/
    │   ├── SKILL.md
    │   └── references/
    ├── app-audit/
    │   ├── SKILL.md
    │   └── references/
    └── cloud-architecture/
        ├── SKILL.md
        └── references/
```

Each skill is a sub-directory under `skills/` containing:

- **SKILL.md** — Required. Instructions, triggers, and workflow for the skill.
- **references/** — Optional. Supporting documents loaded into context as needed.

## Contributing

1. Fork this repo
2. Create a new skill directory under `skills/`
3. Add a `SKILL.md` and optional `references/`
4. Submit a PR
