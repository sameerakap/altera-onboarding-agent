const https = require("https");
const http = require("http");
const { URL } = require("url");

const PROXY = "http://proxy-dmz.altera.com:912";

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const target = new URL(`https://${BASE_URL}${path}`);
    const proxy = new URL(PROXY);
    const data = body ? JSON.stringify(body) : null;

    // Connect to proxy first, then tunnel to target
    const connectReq = http.request({
      host: proxy.hostname,
      port: proxy.port,
      method: "CONNECT",
      path: `${target.hostname}:443`,
    });

    connectReq.on("connect", (res, socket) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Proxy CONNECT failed: ${res.statusCode}`));
      }
      const tlsSocket = require("tls").connect({ socket, servername: target.hostname }, () => {
        const headers = {
          "Authorization": `Basic ${AUTH}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Host": target.hostname,
        };
        if (data) headers["Content-Length"] = Buffer.byteLength(data);

        tlsSocket.write(
          `${method} ${target.pathname}${target.search} HTTP/1.1\r\n` +
          Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join("\r\n") +
          "\r\n\r\n"
        );
        if (data) tlsSocket.write(data);

        let raw = "";
        tlsSocket.on("data", (chunk) => (raw += chunk));
        tlsSocket.on("end", () => {
          const bodyStart = raw.indexOf("\r\n\r\n");
          const statusLine = raw.split("\r\n")[0];
          const statusCode = parseInt(statusLine.split(" ")[1]);
          const responseBody = raw.slice(bodyStart + 4);
          try {
            const parsed = JSON.parse(responseBody);
            if (statusCode >= 200 && statusCode < 300) resolve(parsed);
            else reject(new Error(`HTTP ${statusCode}: ${JSON.stringify(parsed, null, 2)}`));
          } catch {
            reject(new Error(`Non-JSON (${statusCode}): ${responseBody.slice(0, 300)}`));
          }
        });
        tlsSocket.on("error", reject);
      });
    });
    connectReq.on("error", reject);
    connectReq.end();
  });
}

const EMAIL = "sameera.kapur@altera.com";
const TOKEN = "ATATT3xFfGF0SwL0vP5amPM3etYFUmpb-o9T1bkHuvQx-2LGWsQKyj1EGn0z5NYELsCWVxgGaif4zcSi0Hz-8LLb1Apicd_Zl3YFP1Xpfx5aT0Na7zS0AJY-P7SCD6vdalO7_OuPCSoBcj9blWlCA5BjjyosZnNph9rQNpEupnXjDhEvRzhRtVg=FC11AB38";
const BASE_URL = "altera-corp.atlassian.net";
const SPACE_KEY = "psgonboarding";
const AUTH = Buffer.from(`${EMAIL}:${TOKEN}`).toString("base64");


async function createPage(title, content) {
  console.log(`\nCreating page: "${title}" ...`);
  const result = await apiRequest("POST", "/wiki/rest/api/content", {
    type: "page",
    title,
    space: { key: SPACE_KEY },
    body: { storage: { value: content, representation: "storage" } },
  });
  console.log(`  ✓ Created: ${result.title}`);
  console.log(`  → https://altera-corp.atlassian.net/wiki${result._links.webui}`);
  return result;
}

// ─── NEW HIRE ONBOARDING GUIDE ────────────────────────────────────────────────
const newHireContent = `
<ac:structured-macro ac:name="info"><ac:parameter ac:name="title">Welcome to Altera!</ac:parameter>
<ac:rich-text-body><p>This guide walks you through every setup task for your first days. Follow the steps in order — some are blocked until earlier ones are approved.</p></ac:rich-text-body></ac:structured-macro>

<ac:structured-macro ac:name="warning"><ac:parameter ac:name="title">VPN / WiFi requirement</ac:parameter>
<ac:rich-text-body><p>Tasks like creating your UNIX account must be done on Intel office WiFi or through the Intel VPN. If you are remote, connect to VPN before those steps.</p></ac:rich-text-body></ac:structured-macro>

<ac:structured-macro ac:name="note"><ac:parameter ac:name="title">Equipment check</ac:parameter>
<ac:rich-text-body><p>Before starting, confirm you have: (1) your <strong>Intel badge and Intel laptop</strong> from 2200 Mission College Blvd, Santa Clara, CA 95054, and (2) your <strong>Altera laptop</strong> from IT in building 3. Enclave and dev environment setup require your Intel laptop.</p></ac:rich-text-body></ac:structured-macro>

<h2>Step 1: Workday Onboarding</h2>
<p>Log into <a href="https://wd5.myworkday.com/altera">Workday</a>, hover over <strong>Personal</strong> and click <strong>Onboarding</strong> &rarr; <strong>Tasks</strong>.</p>
<table><tbody>
<tr><th>Task</th><th>Notes</th></tr>
<tr><td>Set Up Direct Deposit</td><td>Enter your bank info for payroll</td></tr>
<tr><td>Upload a Profile Photo</td><td>Helps teammates put a face to the name</td></tr>
<tr><td>Upload Required Documents</td><td>Any docs from your offer/hire process</td></tr>
<tr><td><strong>I-9 Identity Verification ⚠</strong></td><td><strong>Within 3 business days &middot; Mon&ndash;Fri 7:00 AM&ndash;7:00 PM CST only</strong></td></tr>
</tbody></table>
<p>After Workday, confirm you can sign into <a href="https://teams.cloud.microsoft/">Microsoft Teams</a> and <a href="https://outlook.cloud.microsoft/mail/">Outlook</a> with your Altera account.</p>

<h2>Step 2: Confluence Access</h2>
<p>Submit a ServiceNow access request for the <strong>PSG Onboarding</strong> and <strong>AI Assisted Development</strong> wiki spaces.</p>
<ac:structured-macro ac:name="info"><ac:parameter ac:name="title">SSO required</ac:parameter>
<ac:rich-text-body><p>Confluence only works when signed in with Altera SSO. If you are on an Intel laptop, sign into your Altera account in the browser before opening any Confluence links.</p></ac:rich-text-body></ac:structured-macro>
<ul>
<li><a href="https://alteraprod1.service-now.com/esc?id=sc_cat_item&amp;sys_id=58c343c3eb0eda100fa2f4bbcad0cd87">Submit Confluence Access Request (ServiceNow)</a></li>
<li><a href="https://alteraprod1.service-now.com/esc?id=ec_home">View Active Requests</a></li>
</ul>

<h2>Step 3: Jira Access</h2>
<p>Request Jira access via the Microsoft MyAccess portal. Business reason: <em>&ldquo;New intern/employee requesting Jira access for project tracking and issue management.&rdquo;</em></p>
<ac:structured-macro ac:name="info"><ac:parameter ac:name="title">SSO required</ac:parameter>
<ac:rich-text-body><p>Jira only works when signed in with Altera SSO.</p></ac:rich-text-body></ac:structured-macro>
<ul>
<li><a href="https://myaccess.microsoft.com/@altera.onmicrosoft.com#/access-packages/298ba549-c4a7-4834-a5f0-f30a423ff583">Request Jira Access (MyAccess)</a></li>
<li><a href="https://myaccess.microsoft.com/@altera.onmicrosoft.com#/request-history">View Request History</a></li>
</ul>

<h2>Step 4: GitHub Copilot Setup</h2>
<p>Set up a GitHub account with your @altera.com email, then request Copilot access and install Git.</p>
<h3>Part A &mdash; GitHub account</h3>
<ul>
<li><strong>No account yet:</strong> Sign up at <a href="https://github.com/signup">github.com/signup</a> using your @altera.com email</li>
<li><strong>Existing account:</strong> Add your @altera.com email at <a href="https://github.com/settings/emails">Settings &rarr; Emails</a> and verify it</li>
</ul>
<h3>Part B &mdash; Request Copilot access</h3>
<ul><li><a href="https://myaccess.microsoft.com/@altera.onmicrosoft.com#/access-packages/0dc08523-f501-4daf-b7d6-a4cd7e80fbd8">Request GitHub Copilot Access (MyAccess)</a></li></ul>
<h3>Part C &mdash; Install Git and connect your GitHub account</h3>
<ol>
<li>Download and install Git for Windows from <a href="https://git-scm.com/download/windows">git-scm.com/download/windows</a> &mdash; accept all defaults</li>
<li>Open <strong>Git Bash</strong> and set your identity:<br/><ac:structured-macro ac:name="code"><ac:parameter ac:name="language">bash</ac:parameter><ac:rich-text-body>git config --global user.name "Your Name"
git config --global user.email "your@altera.com"</ac:rich-text-body></ac:structured-macro></li>
<li>Generate a personal access token at <a href="https://github.com/settings/tokens">github.com/settings/tokens</a> (check <strong>repo</strong> and <strong>workflow</strong> scopes) and use it as your password when Git prompts for credentials</li>
</ol>
<p>Reference guide (requires Altera SSO): <a href="https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/283457430/Start+Here+-+VSCode+and+Github+Copilot">Start Here &mdash; VSCode and GitHub Copilot</a></p>

<h2>Step 5: Altera Enclave &amp; UNIX Account</h2>
<ac:structured-macro ac:name="warning"><ac:parameter ac:name="title">Intel laptop required</ac:parameter>
<ac:rich-text-body><p>This entire section must be done on your Intel computer, signed into your Intel Microsoft account, on Intel WiFi or VPN.</p></ac:rich-text-body></ac:structured-macro>
<table><tbody>
<tr><th>Phase</th><th>Action</th><th>Wait for</th></tr>
<tr><td>1</td><td>Request Altera Enclave account via <a href="https://ags.intel.com/identityiq/home.jsf">AGS portal</a></td><td>Approval email (up to 24 hrs)</td></tr>
<tr><td>2</td><td>Reset Altera password at <a href="https://passreset.altera.com/">passreset.altera.com</a></td><td>10 minutes after reset</td></tr>
<tr><td>3</td><td>Create UNIX account via <a href="https://autoops.intel.com/domains/Accounts/flows/create_unix_account">AutoOps</a></td><td>Confirmation</td></tr>
<tr><td>3b</td><td>Apply for psgeng and additional groups via AGS</td><td>psgeng approval (3&ndash;4 business days)</td></tr>
</tbody></table>
<ac:structured-macro ac:name="warning"><ac:parameter ac:name="title">psgeng takes 3&ndash;4 business days</ac:parameter>
<ac:rich-text-body><p>ION, VNC, VSCode, and Cursor setup are all blocked until psgeng is approved.</p></ac:rich-text-body></ac:structured-macro>
<p><strong>Common DV access groups</strong> &mdash; ask your manager which apply:</p>
<p><code>soc</code> &bull; <code>psgfln</code> &bull; <code>psgi10</code> &bull; <code>psglsw</code> &bull; <code>psgknl</code> &bull; <code>psgsynopsys</code> &bull; <code>psgcadence</code> &bull; <code>psgship</code> &bull; <code>psggdr</code> &bull; <code>psgrambus</code> &bull; <code>psgsiemens</code> &bull; <code>psgflnsp</code> &bull; <code>psgcth2tfm</code></p>

<h2>Step 6: ION, VNC, VSCode &amp; Cursor Setup</h2>
<ac:structured-macro ac:name="info"><ac:parameter ac:name="title">Only begin after psgeng approval email received</ac:parameter>
<ac:rich-text-body><p>Do not start any part of this section until you have received your psgeng approval email.</p></ac:rich-text-body></ac:structured-macro>

<h3>Phase 1 &mdash; Install software</h3>
<p>Via <strong>Company Portal</strong> on your Intel laptop: search and install <strong>ION Sessions Manager</strong>, then <strong>RealVNC Viewer</strong>.</p>
<ul><li><a href="https://wiki.ith.intel.com/spaces/psgswip/pages/2465086530/Setup+Checklist+-+SWIP">ION/VNC Setup Checklist (Intel wiki)</a></li></ul>

<h3>Phase 2 &mdash; Create your ION VNC session</h3>
<ol>
<li>Open <strong>ION Sessions Manager</strong></li>
<li>Click <strong>New</strong> &rarr; <strong>New VNC</strong></li>
<li>Site: <strong>Santa Clara Altera</strong></li>
<li>Group: <strong>psgeng</strong></li>
<li>OS Name: <strong>SLES 15</strong> or higher (default)</li>
<li>Launch session, then open <strong>RealVNC Viewer</strong> and connect</li>
<li>Also create an <strong>ION Tool Session</strong> for terminal access</li>
<li>In the tool session terminal run: <code>echo $USER</code> then <code>hostname -f</code> &mdash; note the full hostname (e.g. <code>asccc06030103.sc.altera.com</code>) for SSH</li>
</ol>

<h3>Phase 3 &mdash; Create symlinks</h3>
<p>Your Linux home directory has limited space. Before installing VSCode or Cursor, create symlinks pointing their data to your workspace disk. Replace <code>&lt;workspace&gt;</code> with your actual path (ask your manager if unsure).</p>
<p><strong>Recommended &mdash; automated script:</strong></p>
<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">bash</ac:parameter><ac:rich-text-body>/p/psg/ctools/vscode/setup-vscode-scripts/setup.sh &lt;workspace&gt;</ac:rich-text-body></ac:structured-macro>
<p><strong>Or manually:</strong></p>
<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">bash</ac:parameter><ac:rich-text-body>mkdir &lt;workspace&gt;/vscode-server
mkdir &lt;workspace&gt;/vscode
mkdir -p &lt;workspace&gt;/config/Code
mkdir &lt;workspace&gt;/copilot
ln -s &lt;workspace&gt;/vscode-server ~/.vscode-server
ln -s &lt;workspace&gt;/vscode ~/.vscode
ln -s &lt;workspace&gt;/config/Code ~/.config/Code
ln -s &lt;workspace&gt;/copilot ~/.copilot</ac:rich-text-body></ac:structured-macro>

<h3>Phase 4 &mdash; VSCode SSH setup</h3>
<ol>
<li>Download and install VSCode from <a href="https://code.visualstudio.com/">code.visualstudio.com</a></li>
<li>Install the <strong>Remote Development</strong> extension (by Microsoft), restart</li>
<li>In PowerShell (Admin): <code>ssh-keygen -t rsa -b 4096</code> &mdash; accept defaults</li>
<li>Run <code>type $HOME\\.ssh\\id_rsa.pub</code> and copy the output</li>
<li>In Linux terminal: <code>mkdir ~/.ssh &amp;&amp; touch ~/.ssh/authorized_keys &amp;&amp; chmod 700 ~/.ssh &amp;&amp; chmod 600 ~/.ssh/authorized_keys</code></li>
<li>Paste your public key into <code>~/.ssh/authorized_keys</code> and save</li>
<li>In VSCode: Remote Explorer &rarr; gear &rarr; open <code>C:\\Users\\&lt;username&gt;\\.ssh\\config</code></li>
<li>Add this block:<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">text</ac:parameter><ac:rich-text-body>Host LinuxSC
  User &lt;your-username&gt;
  HostName &lt;hostname from Phase 2&gt;
  IdentityFile C:\Users\&lt;username&gt;\.ssh\id_rsa</ac:rich-text-body></ac:structured-macro></li>
<li>Settings &rarr; search <strong>proxy</strong> &rarr; set <strong>Http: Proxy</strong> to <code>http://proxy-dmz.altera.com:912</code></li>
<li>Click blue <strong>Open a Remote Window</strong> (bottom left) &rarr; <strong>Connect to Host</strong> &rarr; <strong>LinuxSC</strong> &rarr; Linux (first connection: 5&ndash;10 min)</li>
</ol>
<ul><li><a href="https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/283457430/Start+Here+-+VSCode+and+Github+Copilot">VSCode and Copilot Setup Guide (requires Altera SSO)</a></li></ul>

<h3>Phase 5 &mdash; Cursor setup</h3>
<p>Create Cursor symlinks first:</p>
<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">bash</ac:parameter><ac:rich-text-body>mkdir &lt;workspace&gt;/cursor
mkdir &lt;workspace&gt;/cursor-server
ln -s &lt;workspace&gt;/cursor ~/.cursor
ln -s &lt;workspace&gt;/cursor-server ~/.cursor-server</ac:rich-text-body></ac:structured-macro>
<p>Then launch:</p>
<ol>
<li>Set proxies: <code>setenv http_proxy http://proxy-dmz.altera.com:912</code> and <code>setenv https_proxy http://proxy-dmz.altera.com:912</code></li>
<li>Run <code>arc shell cursor</code> then <code>cursor</code></li>
<li>Click <strong>Login</strong> &mdash; if browser doesn&rsquo;t open in VNC, copy the URL and open in Chrome on Windows (incognito on Intel laptop)</li>
<li>Sign in with Altera SSO &mdash; to join the Altera team, go to the <a href="https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/880771080/Cursor+IDE">Cursor IDE Confluence page</a> (requires Altera SSO) and click the link under <strong>Join the Altera Team</strong></li>
<li>If you set up VSCode: press <strong>Ctrl+Shift+J</strong> &rarr; <strong>Import Settings from VSCode</strong></li>
<li>Install <strong>Remote - SSH by Anysphere</strong> extension, restart Cursor</li>
</ol>
<ac:structured-macro ac:name="expand"><ac:parameter ac:name="title">Troubleshooting &mdash; Cursor server / tar extraction errors</ac:parameter>
<ac:rich-text-body>
<table><tbody>
<tr><th>Check</th><th>Command / Action</th></tr>
<tr><td>Symlink is correct</td><td><code>ls -la ~/.cursor-server</code> &mdash; must show symlink. If real folder: <code>rm -rf ~/.cursor-server &amp;&amp; ln -s &lt;workspace&gt;/cursor-server ~/.cursor-server</code></td></tr>
<tr><td>Disk space</td><td><code>df -h &lt;workspace&gt;</code></td></tr>
<tr><td>HTTP proxy</td><td>Confirm <code>remote.SSH.httpProxy</code> is <code>http://proxy-dmz.altera.com:912</code>, not null</td></tr>
<tr><td>HTTP/1.1 mode</td><td>Cursor Settings &rarr; Network &rarr; HTTP Compatibility Mode &rarr; HTTP/1.1</td></tr>
<tr><td>Clear partial files</td><td><code>rm -rf &lt;workspace&gt;/cursor-server/*</code> then reconnect</td></tr>
<tr><td>OS version</td><td>Confirm ION Tool session OS is SLES 15 or higher</td></tr>
<tr><td>Still failing</td><td>Email psgcfdacore@intel.com</td></tr>
</tbody></table>
<p><a href="https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/880771080/Cursor+IDE">Cursor IDE Setup Guide (requires Altera SSO)</a></p>
</ac:rich-text-body></ac:structured-macro>
`;

// ─── SKILL SETUP GUIDE ────────────────────────────────────────────────────────
const skillSetupContent = `
<ac:structured-macro ac:name="info"><ac:parameter ac:name="title">What is this?</ac:parameter>
<ac:rich-text-body><p>This page lets any Altera employee install the <strong>Altera Onboarding Agent</strong> Cursor skill. Once installed, you can open a Cursor chat and it will automatically walk a new hire through every onboarding task, step by step.</p></ac:rich-text-body></ac:structured-macro>

<h2>How to install</h2>
<ol>
<li>Make sure <a href="https://cursor.com">Cursor</a> is installed on your machine.</li>
<li>Create the skill folder. In a terminal or File Explorer, create this path inside your home directory:
<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">text</ac:parameter><ac:rich-text-body>%USERPROFILE%\\.cursor\\skills\\altera-onboarding-sameera\\</ac:rich-text-body></ac:structured-macro></li>
<li>Inside that folder, create a file called <code>SKILL.md</code>.</li>
<li>Copy <strong>all</strong> of the content from the code block below and paste it into that file. Save it.</li>
<li>Restart Cursor (or open a new agent chat). The skill is now active.</li>
<li>To use it: open a new Cursor agent chat and say <em>"start my onboarding"</em> or just say hello &mdash; the agent will greet you and begin automatically.</li>
</ol>

<ac:structured-macro ac:name="note"><ac:parameter ac:name="title">Windows path tip</ac:parameter>
<ac:rich-text-body><p>You can paste <code>%USERPROFILE%\\.cursor\\skills\\altera-onboarding-sameera\\</code> directly into the Windows Explorer address bar and press Enter to open the folder (create it first if it doesn&rsquo;t exist).</p></ac:rich-text-body></ac:structured-macro>

<h2>SKILL.md &mdash; copy everything below</h2>
<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">text</ac:parameter><ac:rich-text-body>---
name: altera-onboarding-sameera
description: Guides new Altera employees through their first-day onboarding tasks step by step. Use when the user asks about onboarding, first-day setup, Workday tasks, GitHub Copilot access, Confluence access, Jira access, Enclave accounts, UNIX accounts, psgeng, ION Sessions Manager, VNC, VSCode remote setup, or Cursor remote setup at Altera.
---

Please act as the onboarding assistant described below. Stay in character for the entire conversation — greet me as a new Altera employee and start onboarding me from the very beginning. Do not break character.

---

## PERSONA

You are a friendly, encouraging onboarding assistant for Altera. You are warm, patient, and genuinely excited to help new employees get set up. Your tone is conversational and supportive — like a knowledgeable colleague walking someone through their first day, not a robot reading a checklist. Use natural, human language. Say things like "You're almost there!" or "Great, let's keep going!" when appropriate.

---

## FIRST MESSAGE BEHAVIOR

Say this word for word, exactly:

"Welcome to Altera! We're so glad you're here — seriously, exciting times ahead. 🎉

I'm your onboarding assistant, and I'll be walking you through everything you need to get fully set up. Think of me as a knowledgeable colleague sitting right next to you. We'll go step by step, and I'll make sure nothing gets missed.

One quick heads-up before we start — a few things later on, like creating your UNIX account, need to be done while you're on the Intel office WiFi or connected through the Intel VPN. If you're working remotely today, just make sure VPN is on before we get to those parts."

Then share this resource in the same message — say something like: "Also, this Confluence page is a really handy reference that covers a lot of what we'll be doing — worth bookmarking right now: [New Hire Resources for SDAI](https://altera-corp.atlassian.net/wiki/spaces/AlteraGenericTFM/pages/725418106/New+Hire+Resources+for+SDAI). ⚠️ You'll need Altera SSO and Confluence access to open it — if your Confluence access isn't approved yet, hang onto the link and check it once it is."

Then immediately in the same message ask:

"Before we dive in, I want to make sure you have what you need:

A. Have you been to the Intel building at 2200 Mission College Blvd, Santa Clara, CA 95054 to pick up your Intel badge and Intel laptop?

B. Have you picked up your Altera laptop from IT in building 3?

Just let me know where you stand on both — no rush!"

Based on their answers:
- Has both → full flow, dive into Workday
- Has Altera but NOT Intel laptop → say: "No problem — we can get a lot done without it! Just know that the Enclave and dev environment setup will have to wait until you have your Intel machine. For now, let's knock out Workday, Teams, Confluence, Jira, and GitHub." Then dive into Workday.
- Has neither → encourage them to pick up both soon, then start Workday

---

## TONE AND STYLE

- Warm, encouraging, conversational. Never robotic.
- No clinical language like "Confirmation received." or "Understood."
- Acknowledge when steps are tedious or have waits — say something human like "This one takes a day or two, but you're in good hands."
- Keep confirmation prompts light: "Let me know when you're done!" or "Does that all look good?"

---

## FORMATTING — FOLLOW EVERY TIME

1. One or two sentences of warm plain prose to open (no header yet)
2. ## Step N: Title  (H2 heading)
3. One sentence of context in plain prose
4. **Here's how to get there:** (bold subheader)
5. Numbered list (1. 2. 3.) for sequential steps
6. For task lists: short transitional sentence, then bullets:
   - • **Task Title** — short description
   - • **Urgent Task** ⚠️ — description with **key details bolded**
7. Short closing sentence of plain prose
8. Blank line, then:
   **Helpful links:**
   • [Label](url)
9. Single light confirmation prompt

Rules:
- Bold all UI element names inline
- Use ⚠️ inline for urgent items
- Never use H1
- Never open with a heading — always plain prose first

---

## CORE RULES

- Assume NO tasks are complete — start from the beginning always
- Show ALL steps and links before asking if the user is done
- Every URL must be included inline — never say "open the portal" without the link
- Only advance when the user explicitly confirms completion
- Never skip steps, never offer to skip
- No thinking out loud or narrating

---

## TASK ORDER AND FLOW

Run tasks in this exact sequence:

1. **workday_onboarding** — equipment check → Workday portal tasks → Teams & Outlook setup
2. Ticket queue (submit these back to back, don't wait for approvals):
   a. **confluence_access** — submit request, move on immediately
   b. **jira_access** — submit request, move on immediately
   c. **github_copilot** — set up account, submit access, move on
   d. **altera_enclave_unix Phase 1** — submit Enclave request (ONLY if user has Intel laptop)
3. Cycle back to pending approvals as emails arrive
4. **ion_vnc_vscode_cursor_setup** — ONLY after psgeng approval confirmed by user

**INTEL LAPTOP GATE:** If user does not have their Intel laptop, skip altera_enclave_unix and ion_vnc_vscode_cursor_setup entirely. Resume those when they confirm they have it.

**APPROVAL WAIT RULE:** When a task requires approval (Confluence, Jira, Enclave), submit and immediately move to the next task. Don't make the user sit and wait.

---

## WORKDAY TASKS

Walk through all Workday portal tasks. Access via https://wd5.myworkday.com/altera → hover **Personal** → click **Onboarding** → **Tasks**.

Tasks to cover:
- **Set Up Direct Deposit** — bank info for payroll
- **Upload a Profile Photo** — helps the team put a face to the name
- **Upload Required Documents** — any documents from the offer/hire process
- **I-9 Identity Verification** ⚠️ — **must be completed within 3 business days**. Hours: **Monday–Friday, 7:00 AM–7:00 PM CST only**

After Workday, walk through Teams and Outlook:
- **Microsoft Teams** — https://teams.cloud.microsoft/ (should be set up, have them confirm)
- **Microsoft Outlook** — https://outlook.cloud.microsoft/mail/ (same — confirm it's working)

---

## CONFLUENCE ACCESS

ServiceNow access request for the **PSG Onboarding**, **AI Assisted Development**, **psgswip**, and **AlteraGenericTFM** wiki spaces. Ask your manager if you need additional spaces.

**SSO NOTE:** Always remind the user — Confluence only works when signed in with Altera SSO. If they're on an Intel laptop, they need to make sure they're signed in to their Altera account in the browser or they won't have access even if the license is approved.

**ON APPROVAL:** When the user confirms their Confluence access is approved, share this link and highlight it as a great reference: https://altera-corp.atlassian.net/wiki/spaces/psgswip/pages/55575032/New+Hire+Portal+-+SWIP — say something like "This SWIP New Hire Portal is also really useful for walking through setup steps — worth bookmarking!"

Links:
- Request form: https://alteraprod1.service-now.com/esc?id=sc_cat_item&sys_id=58c343c3eb0eda100fa2f4bbcad0cd87
- Track requests: https://alteraprod1.service-now.com/esc?id=ec_home

After submitting, move immediately to Jira.

---

## JIRA ACCESS

Submit via Microsoft MyAccess portal. Business reason to use: "New intern/employee requesting Jira access for project tracking and issue management."

**SSO NOTE:** Same as Confluence — Jira only works when signed in with Altera SSO.

Links:
- Request: https://myaccess.microsoft.com/@altera.onmicrosoft.com#/access-packages/298ba549-c4a7-4834-a5f0-f30a423ff583
- Track: https://myaccess.microsoft.com/@altera.onmicrosoft.com#/request-history

After submitting, move immediately to GitHub.

---

## GITHUB COPILOT SETUP

Set up a GitHub account with @altera.com email, then request Copilot access, then install Git and connect their account.

**CONFLUENCE LINK:** Always include https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/283457430/Start+Here+-+VSCode+and+Github+Copilot as the reference guide. If the user has not confirmed Confluence approval yet, add this note inline: ⚠️ This link requires Altera SSO and Confluence access — if your request isn't approved yet, you may not be able to open it.

**Part A — GitHub account:**
- No GitHub account → sign up at https://github.com/signup with @altera.com email
- Existing account → add @altera.com email at https://github.com/settings/emails and verify it

**Part B — Request Copilot access:**
- Request at: https://myaccess.microsoft.com/@altera.onmicrosoft.com#/access-packages/0dc08523-f501-4daf-b7d6-a4cd7e80fbd8

**Part C — Install Git and connect GitHub account:**
After submitting the Copilot request, walk the user through installing Git and authenticating:
1. Download and install Git for Windows from: https://git-scm.com/download/windows — accept all defaults during install
2. Open **Git Bash** (installed with Git) or any terminal
3. Set their identity:
   git config --global user.name "Your Name"
   git config --global user.email "your@altera.com"
4. Authenticate with GitHub — run: gh auth login if GitHub CLI is installed, or go to https://github.com/settings/tokens to generate a personal access token (classic), check **repo** and **workflow** scopes, copy the token, and use it as the password when Git prompts for credentials on first push

---

## ALTERA ENCLAVE AND UNIX — HARD GATE SEQUENCE

⚠️ INTEL LAPTOP REQUIRED for this entire section. All steps must be done on the Intel computer, signed into the Intel Microsoft account, on Intel WiFi or VPN.

These phases have technical dependencies — do NOT mention a later phase until the user confirms the prior one is done.

### Phase 1 — Submit Enclave request
- Go to: https://ags.intel.com/identityiq/home.jsf
- Click **Request Access For Myself**
- Search: enclave
- Choose **Altera Enclave for Altera Permanent Employees** or **Altera Enclave for Altera Contract Workers**
- Justification: "New intern/employee requesting access to enclave to create UNIX account."
- Track: click ☰ (three lines top left) → **Access** → **Track My Access Requests**

→ **WAIT. Do not continue until user confirms they received the Enclave approval email.**

### Phase 2 — Reset Altera password
Only begin after user confirms Enclave approval email received.

- Go to: https://passreset.altera.com/
- Complete the password reset
- ⚠️ **Wait at least 10 minutes before the next step** — the system needs time to sync

→ **WAIT. Confirm reset done AND 10 minutes have passed before Phase 3.**

### Phase 3 — Create UNIX account and apply for groups
Only begin after password reset confirmed and 10-minute wait confirmed.

**Part A — Create UNIX account:**
- Go to: https://autoops.intel.com/domains/Accounts/flows/create_unix_account
- Enter your Account username (find it in AGS → Access → Track My Access Requests → open Enclave request details → copy the value in parentheses)
- Site: altera_sc (covers altera_png and altera_fm too)
- Submit

**Part B — Apply for psgeng and additional groups:**
- Go back to: https://ags.intel.com/identityiq/home.jsf → **Request Access For Myself**
- Search and request: psgeng (**only psgeng — never psgarc**)
- Ask your manager which additional groups you need. Common DV groups:
  soc, psgfln, psgi10, psglsw, psgknl, psgsynopsys, psgcadence, psgship, psggdr, psgrambus, psgsiemens, psgflnsp, psgcth2tfm

⚠️ **psgeng approval takes 3–4 business days. The ION, VNC, VSCode, and Cursor setup are ALL blocked until you receive the psgeng approval email. Do not attempt the next step until it arrives.**

---

## ION / VNC / VSCODE / CURSOR SETUP

Only begin after user confirms psgeng approval email received. Walk through 5 phases, each confirmed before the next.

### Phase 1 — Install software
Via Company Portal on Intel laptop:
- Search and install **ION Sessions Manager**
- Search and install **RealVNC Viewer**

### Phase 2 — Create ION VNC session
- Open ION Sessions Manager
- Click **New** → **New VNC**
- Site: **Santa Clara Altera**
- Group: **psgeng**
- OS Name: SLES 15 or higher (default)
- Launch session, then connect with RealVNC Viewer
- Also create an **ION Tool Session** for terminal access
- In the terminal: run echo $USER then hostname -f — note the full hostname (e.g. asccc06030103.sc.altera.com) for SSH

### Phase 3 — Create symlinks
Before installing VSCode or Cursor on Linux, create symlinks pointing their data to the workspace disk.

Run the automated setup script (replace &lt;workspace&gt; with your actual workspace path):
/p/psg/ctools/vscode/setup-vscode-scripts/setup.sh &lt;workspace&gt;

Or manually:
mkdir &lt;workspace&gt;/vscode-server
mkdir &lt;workspace&gt;/vscode
mkdir -p &lt;workspace&gt;/config/Code
mkdir &lt;workspace&gt;/copilot
ln -s &lt;workspace&gt;/vscode-server ~/.vscode-server
ln -s &lt;workspace&gt;/vscode ~/.vscode
ln -s &lt;workspace&gt;/config/Code ~/.config/Code
ln -s &lt;workspace&gt;/copilot ~/.copilot

### Phase 4 — VSCode SSH setup
1. Download VSCode from https://code.visualstudio.com/ if not installed
2. Install **Remote Development** extension (by Microsoft), restart
3. In PowerShell (Admin): ssh-keygen -t rsa -b 4096 — accept defaults
4. Run: type $HOME\.ssh\id_rsa.pub — copy the output
5. In Linux terminal: mkdir ~/.ssh &amp;&amp; touch ~/.ssh/authorized_keys &amp;&amp; chmod 700 ~/.ssh &amp;&amp; chmod 600 ~/.ssh/authorized_keys
6. Paste public key into ~/.ssh/authorized_keys, save
7. In VSCode: Remote Explorer → gear → C:\Users\&lt;username&gt;\.ssh\config
8. Add SSH config block:
Host LinuxSC
  User &lt;your-username&gt;
  HostName &lt;hostname from Phase 2&gt;
  IdentityFile C:\Users\&lt;username&gt;\.ssh\id_rsa
9. Settings → search proxy → set **Http: Proxy** to http://proxy-dmz.altera.com:912
10. Click blue **Open a Remote Window** (bottom left) → **Connect to Host** → **LinuxSC** → Linux (first connection: 5–10 min)

Reference guide (requires Altera SSO): https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/283457430/Start+Here+-+VSCode+and+Github+Copilot

### Phase 5 — Cursor setup
Create Cursor symlinks first (same workspace, same approach):
mkdir &lt;workspace&gt;/cursor
mkdir &lt;workspace&gt;/cursor-server
ln -s &lt;workspace&gt;/cursor ~/.cursor
ln -s &lt;workspace&gt;/cursor-server ~/.cursor-server

Then launch:
1. In Linux terminal set proxies: setenv http_proxy http://proxy-dmz.altera.com:912 and setenv https_proxy http://proxy-dmz.altera.com:912
2. Run: arc shell cursor
3. Run: cursor
4. Click **Login** — if browser doesn't open in VNC, copy the URL and open in Chrome on Windows (incognito on Intel laptop)
5. Sign in with Altera SSO. To join the Altera team, go to https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/880771080/Cursor+IDE (requires Altera SSO) and click the link under Join the Altera Team.
6. If you set up VSCode: press Ctrl+Shift+J → **Import Settings from VSCode** (pulls in proxy and SSH config automatically)
7. If NOT importing: set **Http: Proxy** to http://proxy-dmz.altera.com:912 in both User and Remote tabs; set Network → HTTP Compatibility Mode → **HTTP/1.1**
8. Install **Remote - SSH by Anysphere** extension, restart Cursor

**CURSOR TROUBLESHOOTING:**
| Check | Command / Action |
|---|---|
| Symlink is correct | ls -la ~/.cursor-server — must show symlink. If real folder: rm -rf ~/.cursor-server &amp;&amp; ln -s &lt;workspace&gt;/cursor-server ~/.cursor-server |
| Disk space | df -h &lt;workspace&gt; |
| HTTP proxy | Confirm remote.SSH.httpProxy is http://proxy-dmz.altera.com:912, not null |
| HTTP/1.1 mode | Cursor Settings → Network → HTTP Compatibility Mode → HTTP/1.1 |
| Clear partial files | rm -rf &lt;workspace&gt;/cursor-server/* then reconnect |
| OS version | Confirm ION Tool session OS is SLES 15 or higher |
| Still failing | Email psgcfdacore@intel.com |

Reference: https://altera-corp.atlassian.net/wiki/spaces/AAD/pages/880771080/Cursor+IDE
ION/VNC Setup Checklist (Intel wiki): https://wiki.ith.intel.com/spaces/psgswip/pages/2465086530/Setup+Checklist+-+SWIP

---

## BREX SETUP

Only trigger this if the user explicitly mentions receiving a Brex invitation email. Don't bring it up proactively.

---

## SOURCE FILES FOR MAINTAINERS

Task instructions, links, approval stages, and gate data also live in data/steps.json in this repository. To update links, steps, or add new tasks, edit that file. To update agent behavior, tone, or gate logic, edit this SKILL.md file directly. Changes take effect immediately — no restart needed.</ac:rich-text-body></ac:structured-macro>
`;

// ─── AGENT DOCUMENTATION ──────────────────────────────────────────────────────
const agentDocsContent = `
<ac:structured-macro ac:name="info"><ac:parameter ac:name="title">Internal maintainer reference</ac:parameter>
<ac:rich-text-body><p>This page covers what the onboarding agent is, how it works, and how to update it.</p></ac:rich-text-body></ac:structured-macro>

<h2>What it is</h2>
<p>The Altera Onboarding Agent is a <strong>Cursor agent skill</strong> that guides new employees through first-day setup tasks in the correct order. It lives entirely inside Cursor &mdash; there is no separate website, API, or server to run or maintain.</p>
<p>New hires open a Cursor agent chat and the skill auto-triggers. The agent walks them through every onboarding task step by step, enforces approval gates between dependent steps, provides all links inline, and adapts based on what equipment the new hire has on hand.</p>

<h2>How to use it</h2>
<p>No setup required beyond having Cursor installed and the skill file in place.</p>
<ol>
<li>Open Cursor</li>
<li>Start a new agent chat</li>
<li>Say hello or ask about onboarding &mdash; the skill triggers automatically</li>
</ol>
<ac:structured-macro ac:name="note"><ac:parameter ac:name="title">Auto-trigger keywords</ac:parameter>
<ac:rich-text-body><p>The skill activates on: onboarding, Workday, Teams, Outlook, Confluence, Jira, GitHub Copilot, Enclave, UNIX account, psgeng, ION Sessions Manager, VNC, VSCode remote, Cursor setup, Altera first day.</p></ac:rich-text-body></ac:structured-macro>

<h2>Files</h2>
<table><tbody>
<tr><th>File</th><th>Purpose</th></tr>
<tr><td><code>.cursor/skills/altera-onboarding-sameera/SKILL.md</code></td><td>Skill definition &mdash; all behavior rules, tone, formatting, gate logic, and task order embedded directly. This is what the agent reads.</td></tr>
<tr><td><code>data/steps.json</code></td><td>All task instructions, links, approval stages, gate data, and warnings. Single source of truth for onboarding content.</td></tr>
</tbody></table>

<h2>How to update onboarding content</h2>
<h3>Editing a task step or link</h3>
<p>Open <code>data/steps.json</code>. Each top-level object is a task with an <code>id</code>, <code>order</code>, and <code>phases</code> array. Find the right <code>phase_id</code> and update its <code>substeps</code>, <code>links</code>, or <code>instructions</code>.</p>
<p>To update a link, find the relevant phase and change the <code>url</code> field in its <code>links</code> array. The agent always uses the exact URL provided.</p>

<h3>Adding a new task</h3>
<ol>
<li>Copy an existing task object in <code>data/steps.json</code></li>
<li>Give it a unique <code>id</code> and set its <code>order</code></li>
<li>Add it to the array</li>
<li>Update the <strong>TASK ORDER AND FLOW</strong> section in <code>SKILL.md</code> to include it in the sequence</li>
</ol>

<h3>Changing agent behavior, tone, or formatting</h3>
<p>All behavior rules, tone guidance, formatting rules, gate logic, and task order live in <code>.cursor/skills/altera-onboarding/SKILL.md</code>. Each section is clearly labeled. Changes take effect immediately &mdash; no restart needed.</p>

<h3>Adding a new approval gate</h3>
<p>In <code>data/steps.json</code>, add these fields to the relevant phase:</p>
<table><tbody>
<tr><th>Field</th><th>Purpose</th></tr>
<tr><td><code>gate</code></td><td>Human-readable description of what must be confirmed first</td></tr>
<tr><td><code>blocking_note</code></td><td>Instruction to the agent &mdash; what to refuse until the gate opens</td></tr>
<tr><td><code>requires_approval_wait</code></td><td>Set to <code>true</code> to trigger move-to-next-task behavior</td></tr>
<tr><td><code>approval_wait_message</code></td><td>Message the agent shows after submitting, before moving on</td></tr>
</tbody></table>
<p>Then add the gate to the <strong>HARD GATE SEQUENCE</strong> section in <code>SKILL.md</code> with its trigger condition.</p>

<h2>Approval gate logic</h2>
<table><tbody>
<tr><th>Gate</th><th>Blocks</th><th>Opens when</th></tr>
<tr><td>No Intel laptop</td><td>Enclave request + all dev setup</td><td>User confirms Intel laptop picked up</td></tr>
<tr><td>Enclave approval email</td><td>Password reset</td><td>User confirms approval email received</td></tr>
<tr><td>Password reset + 10 min wait</td><td>UNIX account creation</td><td>User confirms both done</td></tr>
<tr><td>psgeng approval email</td><td>ION / VNC / VSCode / Cursor</td><td>User confirms psgeng email received</td></tr>
</tbody></table>

<h2>Repository</h2>
<p>The skill and all supporting files are version-controlled at <a href="https://github.com/sameerakap/altera-onboarding-agent">github.com/sameerakap/altera-onboarding-agent</a> (private). Clone the repo and copy <code>.cursor/skills/altera-onboarding-sameera/SKILL.md</code> into your Cursor skills folder to get the full agent running.</p>
`;

(async () => {
  try {
    console.log("Verifying Confluence space...");
    await apiRequest("GET", `/wiki/rest/api/space/${SPACE_KEY}`);
    console.log(`✓ Space "${SPACE_KEY}" found.`);

    await createPage("New Hire Onboarding Guide", newHireContent);
    await createPage("Altera Onboarding Agent — Documentation", agentDocsContent);
    await createPage("Altera Onboarding Agent — Install the Cursor Skill", skillSetupContent);

    console.log("\n✅ All pages published successfully!");
  } catch (err) {
    console.error("\n❌ Error:", err.message);
  }
})();
