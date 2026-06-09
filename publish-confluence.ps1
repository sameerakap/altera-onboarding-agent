$Email = "sameera.kapur@altera.com"
$Token = "ATATT3xFfGF0SwL0vP5amPM3etYFUmpb-o9T1bkHuvQx-2LGWsQKyj1EGn0z5NYELsCWVxgGaif4zcSi0Hz-8LLb1Apicd_Zl3YFP1Xpfx5aT0Na7zS0AJY-P7SCD6vdalO7_OuPCSoBcj9blWlCA5BjjyosZnNph9rQNpEupnXjDhEvRzhRtVg=FC11AB38"
$BaseUrl = "https://altera-corp.atlassian.net/wiki"
$SpaceKey = "psgonboarding"
$Proxy = "http://proxy-dmz.altera.com:912"

$Bytes = [System.Text.Encoding]::UTF8.GetBytes("${Email}:${Token}")
$Auth = [Convert]::ToBase64String($Bytes)
$Headers = @{ "Authorization" = "Basic $Auth"; "Content-Type" = "application/json"; "Accept" = "application/json" }

function New-Page($Title, $Content) {
    Write-Host "Creating page: $Title ..."
    $Body = @{
        type  = "page"
        title = $Title
        space = @{ key = $SpaceKey }
        body  = @{ storage = @{ value = $Content; representation = "storage" } }
    } | ConvertTo-Json -Depth 10 -Compress
    try {
        $Result = Invoke-RestMethod -Uri "$BaseUrl/rest/api/content" -Method POST -Headers $Headers -Body ([System.Text.Encoding]::UTF8.GetBytes($Body)) -Proxy $Proxy -ProxyUseDefaultCredentials
        $Link = "https://altera-corp.atlassian.net/wiki$($Result._links.webui)"
        Write-Host "  Created: $($Result.title)"
        Write-Host "  -> $Link"
        return $Result
    } catch {
        $Reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $Reader.BaseStream.Position = 0
        $ErrorBody = $Reader.ReadToEnd()
        Write-Host "  ERROR $($_.Exception.Response.StatusCode): $ErrorBody"
    }
}

# Verify space exists
Write-Host "Verifying space '$SpaceKey' ..."
try {
    Invoke-RestMethod -Uri "$BaseUrl/rest/api/space/$SpaceKey" -Headers $Headers -Proxy $Proxy -ProxyUseDefaultCredentials | Out-Null
    Write-Host "  Space found."
} catch {
    Write-Host "  Space not found or auth failed: $_"
    exit 1
}

$NewHireContent = @'
<ac:structured-macro ac:name="info"><ac:parameter ac:name="title">Welcome to Altera!</ac:parameter><ac:rich-text-body><p>This guide walks you through every setup task for your first days. Follow the steps in order — some are blocked until earlier ones are approved.</p></ac:rich-text-body></ac:structured-macro>
<ac:structured-macro ac:name="warning"><ac:parameter ac:name="title">VPN / WiFi requirement</ac:parameter><ac:rich-text-body><p>Tasks like creating your UNIX account must be done on Intel office WiFi or through the Intel VPN.</p></ac:rich-text-body></ac:structured-macro>
<ac:structured-macro ac:name="note"><ac:parameter ac:name="title">Equipment check</ac:parameter><ac:rich-text-body><p>You need: (1) Intel badge and Intel laptop from 2200 Mission College Blvd, Santa Clara, CA 95054, and (2) Altera laptop from IT in building 3.</p></ac:rich-text-body></ac:structured-macro>
<h2>Step 1: Workday Onboarding</h2>
<p>Log into <a href="https://wd5.myworkday.com/altera">Workday</a>, hover over <strong>Personal</strong> and click <strong>Onboarding</strong> &rarr; <strong>Tasks</strong>.</p>
<table><tbody><tr><th>Task</th><th>Notes</th></tr><tr><td>Set Up Direct Deposit</td><td>Enter bank info for payroll</td></tr><tr><td>Upload a Profile Photo</td><td>Helps teammates</td></tr><tr><td>Upload Required Documents</td><td>Docs from offer/hire process</td></tr><tr><td><strong>I-9 Identity Verification</strong></td><td><strong>Within 3 business days &middot; Mon&ndash;Fri 7:00 AM&ndash;7:00 PM CST only</strong></td></tr></tbody></table>
<p>After Workday, confirm access to <a href="https://teams.cloud.microsoft/">Microsoft Teams</a> and <a href="https://outlook.cloud.microsoft/mail/">Outlook</a>.</p>
<h2>Step 2: Confluence Access</h2>
<ac:structured-macro ac:name="info"><ac:parameter ac:name="title">SSO required</ac:parameter><ac:rich-text-body><p>Confluence only works when signed in with Altera SSO.</p></ac:rich-text-body></ac:structured-macro>
<p>Submit a ServiceNow request for <strong>PSG Onboarding</strong> and <strong>AI Assisted Development</strong> spaces.</p>
<ul><li><a href="https://alteraprod1.service-now.com/esc?id=sc_cat_item&amp;sys_id=58c343c3eb0eda100fa2f4bbcad0cd87">Submit Confluence Access Request</a></li><li><a href="https://alteraprod1.service-now.com/esc?id=ec_home">View Active Requests</a></li></ul>
<h2>Step 3: Jira Access</h2>
<ac:structured-macro ac:name="info"><ac:parameter ac:name="title">SSO required</ac:parameter><ac:rich-text-body><p>Jira only works when signed in with Altera SSO.</p></ac:rich-text-body></ac:structured-macro>
<p>Request via MyAccess. Business reason: <em>New intern/employee requesting Jira access for project tracking.</em></p>
<ul><li><a href="https://myaccess.microsoft.com/@altera.onmicrosoft.com#/access-packages/298ba549-c4a7-4834-a5f0-f30a423ff583">Request Jira Access</a></li><li><a href="https://myaccess.microsoft.com/@altera.onmicrosoft.com#/request-history">View Request History</a></li></ul>
<h2>Step 4: GitHub Copilot Setup</h2>
<h3>Part A &mdash; GitHub account</h3>
<ul><li>No account: sign up at <a href="https://github.com/signup">github.com/signup</a> with @altera.com email</li><li>Existing account: add @altera.com at <a href="https://github.com/settings/emails">Settings &rarr; Emails</a></li></ul>
<h3>Part B &mdash; Request Copilot access</h3>
<ul><li><a href="https://myaccess.microsoft.com/@altera.onmicrosoft.com#/access-packages/0dc08523-f501-4daf-b7d6-a4cd7e80fbd8">Request GitHub Copilot Access</a></li></ul>
<h3>Part C &mdash; Install Git</h3>
<ol><li>Download from <a href="https://git-scm.com/download/windows">git-scm.com/download/windows</a> &mdash; accept all defaults</li><li>Open Git Bash and run:<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">bash</ac:parameter><ac:rich-text-body>git config --global user.name "Your Name"
git config --global user.email "your@altera.com"</ac:rich-text-body></ac:structured-macro></li><li>Generate a token at <a href="https://github.com/settings/tokens">github.com/settings/tokens</a> (repo + workflow scopes) and use it as your password</li></ol>
<p>Reference: <a href="https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/283457430/Start+Here+-+VSCode+and+Github+Copilot">Start Here &mdash; VSCode and GitHub Copilot (requires Altera SSO)</a></p>
<h2>Step 5: Altera Enclave &amp; UNIX Account</h2>
<ac:structured-macro ac:name="warning"><ac:parameter ac:name="title">Intel laptop required</ac:parameter><ac:rich-text-body><p>Must be done on your Intel computer, signed into Intel Microsoft account, on Intel WiFi or VPN.</p></ac:rich-text-body></ac:structured-macro>
<table><tbody><tr><th>Phase</th><th>Action</th><th>Wait for</th></tr><tr><td>1</td><td>Request Altera Enclave via <a href="https://ags.intel.com/identityiq/home.jsf">AGS portal</a></td><td>Approval email (up to 24 hrs)</td></tr><tr><td>2</td><td>Reset Altera password at <a href="https://passreset.altera.com/">passreset.altera.com</a></td><td>10 minutes after reset</td></tr><tr><td>3</td><td>Create UNIX account via <a href="https://autoops.intel.com/domains/Accounts/flows/create_unix_account">AutoOps</a></td><td>Confirmation</td></tr><tr><td>3b</td><td>Apply for psgeng + additional groups via AGS</td><td>psgeng approval (3&ndash;4 business days)</td></tr></tbody></table>
<ac:structured-macro ac:name="warning"><ac:parameter ac:name="title">psgeng takes 3&ndash;4 business days</ac:parameter><ac:rich-text-body><p>ION, VNC, VSCode, and Cursor setup are all blocked until psgeng is approved.</p></ac:rich-text-body></ac:structured-macro>
<p><strong>Common DV access groups</strong> (ask your manager which apply): <code>soc</code> &bull; <code>psgfln</code> &bull; <code>psgi10</code> &bull; <code>psglsw</code> &bull; <code>psgknl</code> &bull; <code>psgsynopsys</code> &bull; <code>psgcadence</code> &bull; <code>psgship</code> &bull; <code>psggdr</code> &bull; <code>psgrambus</code> &bull; <code>psgsiemens</code> &bull; <code>psgflnsp</code> &bull; <code>psgcth2tfm</code></p>
<h2>Step 6: ION, VNC, VSCode &amp; Cursor Setup</h2>
<ac:structured-macro ac:name="info"><ac:parameter ac:name="title">Only begin after psgeng approval</ac:parameter><ac:rich-text-body><p>Do not start until you receive the psgeng approval email.</p></ac:rich-text-body></ac:structured-macro>
<h3>Phase 1 &mdash; Install software</h3>
<p>Via <strong>Company Portal</strong> on your Intel laptop: install <strong>ION Sessions Manager</strong> then <strong>RealVNC Viewer</strong>.</p>
<ul><li><a href="https://wiki.ith.intel.com/spaces/psgswip/pages/2465086530/Setup+Checklist+-+SWIP">ION/VNC Setup Checklist (Intel wiki)</a></li></ul>
<h3>Phase 2 &mdash; Create ION VNC session</h3>
<ol><li>Open <strong>ION Sessions Manager</strong> &rarr; <strong>New</strong> &rarr; <strong>New VNC</strong></li><li>Site: <strong>Santa Clara Altera</strong> &middot; Group: <strong>psgeng</strong> &middot; OS: <strong>SLES 15+</strong></li><li>Launch session and connect with <strong>RealVNC Viewer</strong></li><li>Also create an <strong>ION Tool Session</strong>; run <code>hostname -f</code> and note the full hostname for SSH</li></ol>
<h3>Phase 3 &mdash; Create symlinks</h3>
<p>Run the automated script (replace <code>&lt;workspace&gt;</code> with your actual path):</p>
<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">bash</ac:parameter><ac:rich-text-body>/p/psg/ctools/vscode/setup-vscode-scripts/setup.sh &lt;workspace&gt;</ac:rich-text-body></ac:structured-macro>
<p>Or manually:</p>
<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">bash</ac:parameter><ac:rich-text-body>mkdir &lt;workspace&gt;/vscode-server &amp;&amp; mkdir &lt;workspace&gt;/vscode &amp;&amp; mkdir -p &lt;workspace&gt;/config/Code &amp;&amp; mkdir &lt;workspace&gt;/copilot
ln -s &lt;workspace&gt;/vscode-server ~/.vscode-server
ln -s &lt;workspace&gt;/vscode ~/.vscode
ln -s &lt;workspace&gt;/config/Code ~/.config/Code
ln -s &lt;workspace&gt;/copilot ~/.copilot</ac:rich-text-body></ac:structured-macro>
<h3>Phase 4 &mdash; VSCode SSH setup</h3>
<ol><li>Install VSCode from <a href="https://code.visualstudio.com/">code.visualstudio.com</a> + <strong>Remote Development</strong> extension</li><li>In PowerShell (Admin): <code>ssh-keygen -t rsa -b 4096</code></li><li>Copy public key (<code>type $HOME\.ssh\id_rsa.pub</code>) into Linux <code>~/.ssh/authorized_keys</code></li><li>Add SSH config block in VSCode with your hostname and proxy <code>http://proxy-dmz.altera.com:912</code></li><li>Connect via <strong>Open a Remote Window</strong> &rarr; <strong>LinuxSC</strong></li></ol>
<ul><li><a href="https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/283457430/Start+Here+-+VSCode+and+Github+Copilot">VSCode and Copilot Setup Guide (requires Altera SSO)</a></li></ul>
<h3>Phase 5 &mdash; Cursor setup</h3>
<p>Create symlinks, then:</p>
<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">bash</ac:parameter><ac:rich-text-body>mkdir &lt;workspace&gt;/cursor &amp;&amp; mkdir &lt;workspace&gt;/cursor-server
ln -s &lt;workspace&gt;/cursor ~/.cursor
ln -s &lt;workspace&gt;/cursor-server ~/.cursor-server
setenv http_proxy http://proxy-dmz.altera.com:912
arc shell cursor
cursor</ac:rich-text-body></ac:structured-macro>
<p>Click <strong>Login</strong>, sign in with Altera SSO, import settings from VSCode, install <strong>Remote - SSH by Anysphere</strong>.</p>
<ac:structured-macro ac:name="expand"><ac:parameter ac:name="title">Troubleshooting &mdash; Cursor server errors</ac:parameter><ac:rich-text-body><table><tbody><tr><th>Check</th><th>Fix</th></tr><tr><td>Symlink</td><td><code>ls -la ~/.cursor-server</code> must show symlink. If folder: <code>rm -rf ~/.cursor-server &amp;&amp; ln -s &lt;workspace&gt;/cursor-server ~/.cursor-server</code></td></tr><tr><td>Disk space</td><td><code>df -h &lt;workspace&gt;</code></td></tr><tr><td>Proxy</td><td><code>remote.SSH.httpProxy</code> = <code>http://proxy-dmz.altera.com:912</code></td></tr><tr><td>HTTP mode</td><td>Cursor Settings &rarr; Network &rarr; HTTP/1.1</td></tr><tr><td>Clear partials</td><td><code>rm -rf &lt;workspace&gt;/cursor-server/*</code> then reconnect</td></tr><tr><td>Still failing</td><td>Email psgcfdacore@intel.com</td></tr></tbody></table></ac:rich-text-body></ac:structured-macro>
<ul><li><a href="https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/880771080/Cursor+IDE">Cursor IDE Setup Guide (requires Altera SSO)</a></li></ul>
'@

$AgentDocsContent = @'
<ac:structured-macro ac:name="info"><ac:parameter ac:name="title">Internal maintainer reference</ac:parameter><ac:rich-text-body><p>This page covers what the onboarding agent is, how it works, and how to update it.</p></ac:rich-text-body></ac:structured-macro>
<h2>What it is</h2>
<p>The Altera Onboarding Agent is a <strong>Cursor agent skill</strong> that guides new employees through first-day setup tasks in the correct order. It lives entirely inside Cursor &mdash; no separate website, API, or server required.</p>
<p>New hires open a Cursor agent chat and the skill auto-triggers. It walks them through every onboarding task step by step, enforces approval gates, provides all links inline, and adapts based on what equipment the new hire has.</p>
<h2>How to use it</h2>
<ol><li>Open Cursor</li><li>Start a new agent chat</li><li>Say hello or ask about onboarding &mdash; the skill triggers automatically</li></ol>
<ac:structured-macro ac:name="note"><ac:parameter ac:name="title">Auto-trigger keywords</ac:parameter><ac:rich-text-body><p>onboarding, Workday, Teams, Outlook, Confluence, Jira, GitHub Copilot, Enclave, UNIX account, psgeng, ION Sessions Manager, VNC, VSCode remote, Cursor setup, Altera first day</p></ac:rich-text-body></ac:structured-macro>
<h2>Files</h2>
<table><tbody><tr><th>File</th><th>Purpose</th></tr><tr><td><code>.cursor/skills/altera-onboarding-sameera/SKILL.md</code></td><td>Skill definition &mdash; all behavior rules, tone, formatting, gate logic, and task order embedded directly.</td></tr><tr><td><code>data/steps.json</code></td><td>All task instructions, links, approval stages, and gate data. Single source of truth for onboarding content.</td></tr></tbody></table>
<h2>How to update onboarding content</h2>
<h3>Editing a step or link</h3>
<p>Open <code>data/steps.json</code>. Each task has an <code>id</code>, <code>order</code>, and <code>phases</code> array. Find the right <code>phase_id</code> and update its <code>substeps</code>, <code>links</code>, or <code>instructions</code>. To update a URL, change the <code>url</code> field in the <code>links</code> array.</p>
<h3>Adding a new task</h3>
<ol><li>Copy an existing task object in <code>data/steps.json</code></li><li>Give it a unique <code>id</code> and set its <code>order</code></li><li>Add to the array</li><li>Update the <strong>TASK ORDER AND FLOW</strong> section in <code>SKILL.md</code></li></ol>
<h3>Changing agent behavior or tone</h3>
<p>All behavior rules, tone guidance, formatting, gate logic, and task order live in <code>.cursor/skills/altera-onboarding-sameera/SKILL.md</code>. Changes take effect immediately.</p>
<h3>Adding a new approval gate</h3>
<p>Add these fields to the relevant phase in <code>data/steps.json</code>:</p>
<table><tbody><tr><th>Field</th><th>Purpose</th></tr><tr><td><code>gate</code></td><td>What must be confirmed first</td></tr><tr><td><code>blocking_note</code></td><td>What the agent refuses until gate opens</td></tr><tr><td><code>requires_approval_wait</code></td><td>Set to <code>true</code> to trigger move-to-next-task</td></tr><tr><td><code>approval_wait_message</code></td><td>Message shown after submitting</td></tr></tbody></table>
<p>Then add the gate to the <strong>HARD GATE SEQUENCE</strong> section in <code>SKILL.md</code>.</p>
<h2>Approval gate logic</h2>
<table><tbody><tr><th>Gate</th><th>Blocks</th><th>Opens when</th></tr><tr><td>No Intel laptop</td><td>Enclave + all dev setup</td><td>User confirms Intel laptop picked up</td></tr><tr><td>Enclave approval email</td><td>Password reset</td><td>User confirms email received</td></tr><tr><td>Password reset + 10 min</td><td>UNIX account creation</td><td>User confirms both done</td></tr><tr><td>psgeng approval email</td><td>ION / VNC / VSCode / Cursor</td><td>User confirms psgeng email received</td></tr></tbody></table>
<h2>Repository</h2>
<p>Version-controlled at <a href="https://github.com/sameerakap/altera-onboarding-agent">github.com/sameerakap/altera-onboarding-agent</a> (private). Clone and copy <code>.cursor/skills/altera-onboarding-sameera/SKILL.md</code> into your Cursor skills folder to deploy.</p>
'@

$SkillSetupContent = @'
<ac:structured-macro ac:name="info"><ac:parameter ac:name="title">What is this?</ac:parameter><ac:rich-text-body><p>This page lets any Altera employee install the <strong>Altera Onboarding Agent</strong> Cursor skill. Once installed, open a Cursor chat and it will automatically walk a new hire through every onboarding task, step by step.</p></ac:rich-text-body></ac:structured-macro>
<h2>How to install</h2>
<ol>
<li>Make sure <a href="https://cursor.com">Cursor</a> is installed on your machine.</li>
<li>Create the skill folder at: <code>%USERPROFILE%\.cursor\skills\altera-onboarding-sameera\</code> (you can paste this path directly into the Windows Explorer address bar).</li>
<li>Inside that folder, create a file called <code>SKILL.md</code>.</li>
<li>Copy <strong>all</strong> of the content from the code block below and paste it into that file. Save it.</li>
<li>Restart Cursor (or open a new agent chat). The skill is now active.</li>
<li>To use it: open a new Cursor agent chat and say <em>"start my onboarding"</em> or just say hello &mdash; the agent will greet you and begin automatically.</li>
</ol>
<h2>SKILL.md &mdash; copy everything below</h2>
<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">text</ac:parameter><ac:rich-text-body>---
name: altera-onboarding-sameera
description: Guides new Altera employees through their first-day onboarding tasks step by step. Use when the user asks about onboarding, first-day setup, Workday tasks, GitHub Copilot access, Confluence access, Jira access, Enclave accounts, UNIX accounts, psgeng, ION Sessions Manager, VNC, VSCode remote setup, or Cursor remote setup at Altera.
---

Please act as the onboarding assistant described below. Stay in character for the entire conversation — greet me as a new Altera employee and start onboarding me from the very beginning. Do not break character.

---

## PERSONA

You are a friendly, encouraging onboarding assistant for Altera. You are warm, patient, and genuinely excited to help new employees get set up. Your tone is conversational and supportive — like a knowledgeable colleague walking someone through their first day, not a robot reading a checklist.

---

## FIRST MESSAGE BEHAVIOR

Say this word for word, exactly:

"Welcome to Altera! We're so glad you're here — seriously, exciting times ahead.

I'm your onboarding assistant, and I'll be walking you through everything you need to get fully set up. Think of me as a knowledgeable colleague sitting right next to you. We'll go step by step, and I'll make sure nothing gets missed.

One quick heads-up before we start — a few things later on, like creating your UNIX account, need to be done while you're on the Intel office WiFi or connected through the Intel VPN. If you're working remotely today, just make sure VPN is on before we get to those parts."

Then share: "Also, this Confluence page is a really handy reference — worth bookmarking right now: [New Hire Resources for SDAI](https://altera-corp.atlassian.net/wiki/spaces/AlteraGenericTFM/pages/725418106/New+Hire+Resources+for+SDAI). You'll need Altera SSO and Confluence access to open it."

Then ask:

"Before we dive in, I want to make sure you have what you need:

A. Have you been to the Intel building at 2200 Mission College Blvd, Santa Clara, CA 95054 to pick up your Intel badge and Intel laptop?

B. Have you picked up your Altera laptop from IT in building 3?

Just let me know where you stand on both — no rush!"

Based on their answers:
- Has both → full flow, dive into Workday
- Has Altera but NOT Intel laptop → skip Enclave/dev setup, start Workday
- Has neither → encourage them to pick up both, then start Workday

---

## CORE RULES

- Assume NO tasks are complete — start from the beginning always
- Show ALL steps and links before asking if the user is done
- Every URL must be included inline
- Only advance when the user explicitly confirms completion
- Never skip steps

---

## TASK ORDER

1. workday_onboarding — equipment check, Workday tasks, Teams and Outlook
2. confluence_access — submit request, move on immediately
3. jira_access — submit request, move on immediately
4. github_copilot — set up account, submit access, move on
5. altera_enclave_unix Phase 1 — submit Enclave request (Intel laptop required)
6. Cycle back to pending approvals as emails arrive
7. ion_vnc_vscode_cursor_setup — ONLY after psgeng approval confirmed

INTEL LAPTOP GATE: If user does not have Intel laptop, skip Enclave and dev setup entirely.
APPROVAL WAIT RULE: After submitting any approval request, immediately move to the next task.

---

## WORKDAY TASKS

Access via https://wd5.myworkday.com/altera — hover Personal, click Onboarding, Tasks.

- Set Up Direct Deposit — bank info for payroll
- Upload a Profile Photo
- Upload Required Documents
- I-9 Identity Verification — must be completed within 3 business days, Mon-Fri 7:00 AM-7:00 PM CST only

After Workday: confirm Teams (https://teams.cloud.microsoft/) and Outlook (https://outlook.cloud.microsoft/mail/) are working.

---

## CONFLUENCE ACCESS

ServiceNow request for PSG Onboarding, AI Assisted Development, psgswip, and AlteraGenericTFM spaces.
Request: https://alteraprod1.service-now.com/esc?id=sc_cat_item&sys_id=58c343c3eb0eda100fa2f4bbcad0cd87
Track: https://alteraprod1.service-now.com/esc?id=ec_home

SSO NOTE: Confluence only works when signed in with Altera SSO.
On approval, also share: https://altera-corp.atlassian.net/wiki/spaces/psgswip/pages/55575032/New+Hire+Portal+-+SWIP

---

## JIRA ACCESS

Request via MyAccess. Business reason: "New intern/employee requesting Jira access for project tracking."
Request: https://myaccess.microsoft.com/@altera.onmicrosoft.com#/access-packages/298ba549-c4a7-4834-a5f0-f30a423ff583
Track: https://myaccess.microsoft.com/@altera.onmicrosoft.com#/request-history

---

## GITHUB COPILOT SETUP

Part A — GitHub account:
- No account: sign up at https://github.com/signup with @altera.com email
- Existing account: add @altera.com at https://github.com/settings/emails

Part B — Request Copilot: https://myaccess.microsoft.com/@altera.onmicrosoft.com#/access-packages/0dc08523-f501-4daf-b7d6-a4cd7e80fbd8

Part C — Install Git from https://git-scm.com/download/windows, then:
  git config --global user.name "Your Name"
  git config --global user.email "your@altera.com"
Generate token at https://github.com/settings/tokens (repo + workflow scopes).

Reference: https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/283457430/Start+Here+-+VSCode+and+Github+Copilot

---

## ALTERA ENCLAVE AND UNIX — HARD GATE SEQUENCE

INTEL LAPTOP REQUIRED. All steps on Intel computer, Intel Microsoft account, Intel WiFi or VPN.

Phase 1 — Submit Enclave request:
- Go to https://ags.intel.com/identityiq/home.jsf
- Request Access For Myself, search enclave
- Choose Altera Enclave for Altera Permanent Employees or Contract Workers
- Justification: "New intern/employee requesting access to enclave to create UNIX account."
- WAIT for Enclave approval email before continuing.

Phase 2 — Reset Altera password (only after Enclave approval):
- Go to https://passreset.altera.com/
- Wait at least 10 minutes after reset before Phase 3.

Phase 3 — Create UNIX account and apply for groups (only after password reset + 10 min wait):
Part A — Create UNIX account:
- Go to https://autoops.intel.com/domains/Accounts/flows/create_unix_account
- Site: altera_sc
- Submit

Part B — Apply for psgeng (never psgarc) and additional groups via AGS.
Common DV groups: soc, psgfln, psgi10, psglsw, psgknl, psgsynopsys, psgcadence, psgship, psggdr, psgrambus, psgsiemens, psgflnsp, psgcth2tfm

psgeng approval takes 3-4 business days. ION, VNC, VSCode, and Cursor setup are ALL blocked until psgeng is approved.

---

## ION / VNC / VSCODE / CURSOR SETUP

Only begin after psgeng approval email confirmed.

Phase 1 — Install via Company Portal: ION Sessions Manager, RealVNC Viewer.

Phase 2 — Create ION VNC session:
- ION Sessions Manager, New, New VNC
- Site: Santa Clara Altera, Group: psgeng, OS: SLES 15+
- Connect with RealVNC Viewer
- Also create ION Tool Session; run hostname -f and note the full hostname for SSH

Phase 3 — Create symlinks (replace &lt;workspace&gt; with your actual path):
Automated: /p/psg/ctools/vscode/setup-vscode-scripts/setup.sh &lt;workspace&gt;
Manual:
  mkdir &lt;workspace&gt;/vscode-server &amp;&amp; mkdir &lt;workspace&gt;/vscode &amp;&amp; mkdir -p &lt;workspace&gt;/config/Code &amp;&amp; mkdir &lt;workspace&gt;/copilot
  ln -s &lt;workspace&gt;/vscode-server ~/.vscode-server
  ln -s &lt;workspace&gt;/vscode ~/.vscode
  ln -s &lt;workspace&gt;/config/Code ~/.config/Code
  ln -s &lt;workspace&gt;/copilot ~/.copilot

Phase 4 — VSCode SSH:
1. Install VSCode + Remote Development extension
2. PowerShell (Admin): ssh-keygen -t rsa -b 4096
3. Copy public key into Linux ~/.ssh/authorized_keys
4. Add SSH config: Host LinuxSC, User &lt;username&gt;, HostName &lt;hostname&gt;, IdentityFile C:\Users\&lt;username&gt;\.ssh\id_rsa
5. Set Http: Proxy to http://proxy-dmz.altera.com:912
6. Connect via Open a Remote Window, LinuxSC, Linux

Phase 5 — Cursor:
  mkdir &lt;workspace&gt;/cursor &amp;&amp; mkdir &lt;workspace&gt;/cursor-server
  ln -s &lt;workspace&gt;/cursor ~/.cursor
  ln -s &lt;workspace&gt;/cursor-server ~/.cursor-server
  setenv http_proxy http://proxy-dmz.altera.com:912
  arc shell cursor
  cursor
Login, sign in with Altera SSO. To join the Altera team, go to the Cursor IDE Confluence page (https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/880771080/Cursor+IDE, requires Altera SSO) and click the link under Join the Altera Team. Import settings from VSCode, install Remote - SSH by Anysphere.

Troubleshooting: check symlink (ls -la ~/.cursor-server), disk space (df -h &lt;workspace&gt;), proxy (http://proxy-dmz.altera.com:912), HTTP/1.1 mode, clear partials (rm -rf &lt;workspace&gt;/cursor-server/*). Still failing: email psgcfdacore@intel.com.

Reference: https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/880771080/Cursor+IDE
ION/VNC Checklist: https://wiki.ith.intel.com/spaces/psgswip/pages/2465086530/Setup+Checklist+-+SWIP

---

## BREX SETUP

Only trigger if user explicitly mentions receiving a Brex invitation email.

---

## SOURCE FILES FOR MAINTAINERS

data/steps.json — update links, steps, and task content here.
SKILL.md — update agent behavior, tone, and gate logic here. Changes take effect immediately.</ac:rich-text-body></ac:structured-macro>
'@

New-Page "New Hire Onboarding Guide" $NewHireContent
New-Page "Altera Onboarding Agent - Documentation" $AgentDocsContent
New-Page "Altera Onboarding Agent - Install the Cursor Skill" $SkillSetupContent

Write-Host "`nDone!"
