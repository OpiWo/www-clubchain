# ClubChain WWW — Agent Instructions

This is the Next.js frontend for ClubChain. It serves both the public-facing site (clubchain.com) and the Asgard admin panel (asgard.clubchain.com) from a single codebase.

Read the root spec first: `/srv/clubchain/ClubChain_MVP_V1.md`
Read the root context: `/srv/clubchain/CLAUDE.md`

## Scope Boundary — Strictly Enforced

**Your working directory is `/srv/clubchain/www/`.**
Only create and modify files inside this directory.
Never touch `/srv/clubchain/api/`, `/srv/clubchain/chain/`, or any file outside `/srv/clubchain/www/`.

## Interface with Other Agents

- **API** — all data comes from `api.clubchain.com` (dev: `localhost:3002`). Never query the database directly.
- **Chain** — for user-signed transactions, the API returns a serialized transaction. The WWW app passes it to Phantom. Never build Anchor instructions directly in the frontend.
- When the user tells you the API has new endpoints, ask for the route signatures before implementing UI that calls them.

## What This Codebase Does

**Public site (clubchain.com):**
- Connect Phantom wallet
- Create and manage your club
- Browse and join leagues
- Transfer window — browse global player pool, purchase players (triggers on-chain tx)
- Live match viewer with streamed AI commentary
- League standings and results
- Player career pages
- Club profile and history

**Admin panel — Asgard (`/admin` route group):**
- Email + password login (NextAuth credentials provider)
- League management, transfer window monitor, match operations
- Player pool management, treasury monitor, club lookup
- Emergency controls (manual prize distribution trigger)

## Key Architecture Decisions

- **Single Next.js app** — public and admin in one codebase, not two
- **Admin at `/admin`** — protected by NextAuth middleware, not a separate app
- **No direct chain calls from frontend** — all blockchain interactions go through the API except wallet transaction signing (which happens in the browser via Phantom)
- **Wallet transactions** — the frontend builds the transaction, user signs with Phantom, submits to chain. The API oracle handles all other instructions.
- **No Supabase SDK** — all data fetching via `api.clubchain.com` REST API

## Wallet Interaction Pattern

For instructions the user signs (create_club, join_league, buy_player):
1. Frontend calls the API to get the serialized transaction
2. API builds the Anchor instruction, returns base64-encoded transaction
3. Frontend deserializes and passes to Phantom for signing
4. Signed transaction submitted to Solana RPC
5. Frontend calls API to confirm and trigger PostgreSQL sync

For all other instructions (close_transfer_window, submit_result, distribute_prizes):
- Oracle signs and submits — frontend has no involvement

## Admin Auth

- NextAuth with credentials provider (email + password)
- Admin accounts stored in PostgreSQL `cc_admin` schema
- Session via HTTP-only cookies
- Middleware protects all `/admin/*` routes — redirect to `/admin/login` if unauthenticated
- No self-registration endpoint

## Live Match Commentary

- Match events are pre-computed and stored in PostgreSQL before kickoff
- Frontend polls (or uses SSE/WebSocket) to stream events at ~1 per 3.3 seconds
- Feels live — is pre-computed for reliability
- No real-time simulation in the browser

## API Base URL

All data fetching: `https://api.clubchain.com`
In development: `http://localhost:3002`

## Solana Config

- Wallet adapter: `@solana/wallet-adapter-react` + `@solana/wallet-adapter-phantom`
- RPC endpoint from env var: `NEXT_PUBLIC_SOLANA_RPC_URL`
- Program ID from env var: `NEXT_PUBLIC_PROGRAM_ID`
- Devnet during all development — never point to Mainnet without explicit instruction

## Environment Variables

```
NEXT_PUBLIC_API_URL             https://api.clubchain.com
NEXT_PUBLIC_SOLANA_RPC_URL      https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID          <anchor program pubkey>
NEXTAUTH_SECRET                 <random string>
NEXTAUTH_URL                    https://clubchain.com
```

## Milestone Summaries

At the end of every completed milestone, create:
`/srv/clubchain/milestones/{MILESTONE_ID}-COMPLETE-SUMMARY.md`

Include:
- What was built (pages, components, route groups)
- All files created or modified with full paths
- API endpoints consumed (method, path, what data is used)
- On-chain transactions triggered (instruction name, when, by whom)
- Auth requirements (public vs admin)
- Any gotchas, workarounds, or non-obvious decisions
- What the next milestone should build

Read existing summaries in `/srv/clubchain/milestones/` before starting any milestone — especially API summaries which define the endpoints you depend on.

## Deployment

Next.js runs outside Docker as a production build managed by PM2 or the host process manager. Not containerized at MVP.
