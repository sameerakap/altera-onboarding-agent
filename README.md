# Altera Onboarding Agent

A Cursor AI skill that guides new Altera employees through their entire first-day setup — step by step, like a knowledgeable colleague sitting next to you.

## What it does

The agent walks new hires through every onboarding task in the right order:

- **Workday** — direct deposit, profile photo, I-9, required documents
- **Microsoft Teams & Outlook** — confirm accounts are working
- **Confluence access** — ServiceNow request for wiki spaces
- **Jira access** — Microsoft MyAccess request
- **GitHub Copilot** — account setup, access request, Git install
- **Altera Enclave & UNIX account** — AGS request, password reset, account creation, group access (psgeng + team-specific groups)
- **ION Sessions Manager & VNC** — install, create session, connect
- **VSCode remote SSH** — keygen, SSH config, proxy setup, remote connection
- **Cursor remote setup** — symlinks, proxy config, SSO login, SSH extension

It handles approval wait times intelligently — submitting requests back-to-back without making you sit and wait, then cycling back when approvals arrive.

## How to use it

### 1. Clone or download this repo

```bash
git clone https://github.com/sameerakap/altera-onboarding-agent.git
```

### 2. Open the folder in Cursor

File → Open Folder → select the `altera-onboarding-agent` folder.

### 3. Start a chat and say anything like:

> "Start my onboarding"
> "Help me get set up as a new Altera employee"
> "Walk me through Workday"

The agent will automatically activate the onboarding skill and guide you through everything from the beginning.

## Requirements

- [Cursor](https://cursor.com) — free or paid tier both work
- An Altera employee account (the steps inside assume you're a new Altera hire)

## Notes

- Some steps (Enclave, UNIX account) require the **Intel office WiFi or Intel VPN** and your **Intel laptop**
- The I-9 verification must be completed within **3 business days** of your start date
- psgeng approval takes **3–4 business days** — the ION/VNC/VSCode/Cursor setup is blocked until it arrives

## Useful references

- [New Hire Resources for SDAI](https://altera-corp.atlassian.net/wiki/spaces/AlteraGenericTFM/pages/725418106/New+Hire+Resources+for+SDAI) — Confluence page that walks through a lot of the same setup steps. Requires Altera SSO + Confluence access.
- [SWIP New Hire Portal](https://altera-corp.atlassian.net/wiki/spaces/psgswip/pages/55575032/New+Hire+Portal+-+SWIP) — additional reference shared after Confluence access is approved
- [VSCode + GitHub Copilot setup guide](https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/283457430/Start+Here+-+VSCode+and+Github+Copilot) — requires Altera SSO + Confluence access
- [Cursor IDE setup guide](https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/880771080/Cursor+IDE) — requires Altera SSO + Confluence access

## Updating the skill

All agent behavior, tone, step order, and gate logic lives in `.cursor/skills/altera-onboarding/SKILL.md`. Edit that file directly — changes take effect immediately with no restart needed.
