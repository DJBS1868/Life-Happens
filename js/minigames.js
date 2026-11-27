// ---------------------------------------------------------------------------
// Life-sim minigames: slots, blackjack, scratch cards and crime timing.
// These modules only touch game state through the exported game helpers; the
// UI layer passes in its modal helpers so there is no circular import.
// ---------------------------------------------------------------------------
import * as G from './game.js';
import { moneyFull, rand, randInt, clamp } from './data.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const CASINO_BET = 1000;
const SLOT_SYMBOLS = ['🍒', '🍋', '🔔', '⭐', '💎', '7️⃣'];
const SLOT_TRIPLE = { '🍒': 3, '🍋': 4, '🔔': 6, '⭐': 8, '💎': 12, '7️⃣': 25 };
const SCRATCH_PRIZES = { '🍒': 10, '🍋': 20, '🔔': 50, '⭐': 100, '💎': 10000, '7️⃣': 1000000 };

function setBank(card) {
  const bank = G.state.player?.money ?? 0;
  $$('[data-bank]', card).forEach(el => { el.textContent = moneyFull(bank); });
}
function setResult(card, text, tone = '') {
  const el = $('[data-result]', card);
  if (!el) return;
  el.textContent = text;
  el.className = 'mg-result' + (tone ? ' ' + tone : '');
}

// ---------------------------------------------------------------------------
// Casino
// ---------------------------------------------------------------------------
export function openCasino(api) {
  const p = G.state.player;
  if (!p) return;
  api.showModal({
    title: 'Casino',
    body: `<div class="mg-pick">
      <div class="mg-pick-art">🎰</div>
      <p class="mg-hint">Feeling lucky? Pick a table. Every bet is <b>${moneyFull(CASINO_BET)}</b>.</p>
    </div>`,
    options: [
      { label: '🎰 Slot Machine', sub: 'Match symbols to win big', primary: true, onClick: () => { api.closeModal(); openSlots(api); } },
      { label: '🃏 Blackjack', sub: 'Beat the dealer to 21', onClick: () => { api.closeModal(); openBlackjack(api); } },
      { label: 'Leave the casino', onClick: () => api.closeModal() },
    ],
    dismissible: true,
  });
}

function openSlots(api) {
  let spinning = false;
  let tick = null;
  let settle = null;
  api.showModal({
    title: 'Slot Machine',
    okText: 'Leave',
    body: `<div class="mg mg-slots">
      <div class="mg-top"><span>Bet <b>${moneyFull(CASINO_BET)}</b></span><span class="mg-bank">Bank <b data-bank>${moneyFull(G.state.player.money)}</b></span></div>
      <div class="mg-reels" data-reels>${[0, 1, 2].map(() => `<div class="mg-reel"><span>${rand(SLOT_SYMBOLS)}</span></div>`).join('')}</div>
      <div class="mg-paytable"><span>Pair pays 2×</span><span>Three of a kind pays 3–25×</span></div>
      <div class="mg-result" data-result>Tap SPIN to try your luck.</div>
      <button class="mg-btn mg-btn-spin" data-spin>SPIN ${moneyFull(CASINO_BET)}</button>
    </div>`,
    dismissible: true,
    onMount: card => {
      const spinBtn = $('[data-spin]', card);
      const leaveBtn = $('[data-ok]', card);
      const reels = $$('.mg-reel span', card);
      spinBtn.onclick = () => {
        if (spinning) return;
        const p = G.state.player;
        if (p.money < CASINO_BET) { api.toast(`You need ${moneyFull(CASINO_BET)} to spin.`); return; }
        spinning = true;
        spinBtn.disabled = true;
        if (leaveBtn) leaveBtn.disabled = true;
        G.changeMoney(-CASINO_BET);
        setBank(card);
        setResult(card, 'Spinning…');
        const final = [rand(SLOT_SYMBOLS), rand(SLOT_SYMBOLS), rand(SLOT_SYMBOLS)];
        tick = setInterval(() => reels.forEach(r => { r.textContent = rand(SLOT_SYMBOLS); }), 70);
        settle = setTimeout(() => {
          clearInterval(tick);
          reels.forEach((r, i) => { r.textContent = final[i]; });
          const payout = slotPayout(final);
          if (payout) {
            G.changeMoney(payout);
            G.bump('happiness', 5);
            G.addLog(`You won ${moneyFull(payout)} on the slot machine.`, 'pos');
            setResult(card, payout >= CASINO_BET * 10 ? `JACKPOT! ${moneyFull(payout)}!` : `Winner! ${moneyFull(payout)}.`, 'win');
          } else {
            G.bump('happiness', -3);
            G.addLog('You lost at the slot machine.', 'neg');
            setResult(card, 'No win. Better luck next spin.', 'lose');
          }
          G.save();
          setBank(card);
          api.refresh();
          spinning = false;
          if (leaveBtn) leaveBtn.disabled = false;
          spinBtn.disabled = G.state.player.money < CASINO_BET;
        }, 1100);
      };
    },
    onClose: () => { clearInterval(tick); clearTimeout(settle); },
  });
}

function slotPayout(reels) {
  if (reels[0] === reels[1] && reels[1] === reels[2]) return CASINO_BET * (SLOT_TRIPLE[reels[0]] || 3);
  if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) return CASINO_BET * 2;
  return 0;
}

function openBlackjack(api) {
  let deck = [];
  let player = [];
  let dealer = [];
  let phase = 'idle';
  const bet = CASINO_BET;
  api.showModal({
    title: 'Blackjack',
    okText: 'Leave Table',
    body: `<div class="mg mg-bj">
      <div class="mg-top"><span>Bet <b>${moneyFull(bet)}</b></span><span class="mg-bank">Bank <b data-bank>${moneyFull(G.state.player.money)}</b></span></div>
      <div class="mg-table">
        <div class="mg-side">
          <div class="mg-hand-label">Dealer <b data-dealer-score>—</b></div>
          <div class="mg-hand" data-dealer></div>
        </div>
        <div class="mg-table-divider"><span>♠ ♥ BLACKJACK ♦ ♣</span></div>
        <div class="mg-side">
          <div class="mg-hand-label">You <b data-player-score>—</b></div>
          <div class="mg-hand" data-player></div>
        </div>
      </div>
      <div class="mg-result" data-result>Deal a hand to begin. Blackjack pays 3:2.</div>
      <div class="mg-actions">
        <button class="mg-btn" data-hit disabled>Hit</button>
        <button class="mg-btn" data-stand disabled>Stand</button>
        <button class="mg-btn primary" data-deal>Deal</button>
      </div>
    </div>`,
    dismissible: true,
    onMount: card => {
      const q = sel => $(sel, card);
      const dealerEl = q('[data-dealer]');
      const playerEl = q('[data-player]');
      const resultEl = q('[data-result]');
      const hitBtn = q('[data-hit]');
      const standBtn = q('[data-stand]');
      const dealBtn = q('[data-deal]');

      const render = () => {
        dealerEl.innerHTML = dealer.map((c, i) => (i === 1 && phase === 'player') ? '<div class="mg-card back"></div>' : cardHTML(c)).join('');
        playerEl.innerHTML = player.map(cardHTML).join('');
        q('[data-dealer-score]').textContent = dealer.length ? (phase === 'player' ? `${cardValue(dealer[0])} + ?` : handValue(dealer)) : '—';
        q('[data-player-score]').textContent = player.length ? handValue(player) : '—';
        hitBtn.disabled = phase !== 'player';
        standBtn.disabled = phase !== 'player';
        dealBtn.disabled = phase === 'player';
        dealBtn.textContent = phase === 'done' ? 'Deal Again' : 'Deal';
        setBank(card);
      };

      const finish = () => {
        phase = 'done';
        const before = handValue(player);
        const playerBlackjack = before === 21 && player.length === 2;
        if (!playerBlackjack && before <= 21) while (handValue(dealer) < 17) dealer.push(deck.pop());
        const pv = handValue(player);
        const dv = handValue(dealer);
        const pBJ = pv === 21 && player.length === 2;
        const dBJ = dv === 21 && dealer.length === 2;
        let payout = 0;
        let msg = '';
        if (pv > 21) {
          msg = `Bust! You went over 21 and lost ${moneyFull(bet)}.`;
        } else if (pBJ && !dBJ) {
          payout = Math.round(bet * 2.5);
          msg = `Blackjack! You won ${moneyFull(payout - bet)}.`;
        } else if (dBJ && !pBJ) {
          msg = `Dealer blackjack. You lost ${moneyFull(bet)}.`;
        } else if (dv > 21 || pv > dv) {
          payout = bet * 2;
          msg = `You win ${moneyFull(bet)}!`;
        } else if (pv === dv) {
          payout = bet;
          msg = 'Push. Your bet is returned.';
        } else {
          msg = `Dealer wins ${dv} to ${pv}. You lost ${moneyFull(bet)}.`;
        }
        if (payout) G.changeMoney(payout);
        if (payout > bet) {
          G.bump('happiness', 6);
          G.addLog(`You won ${moneyFull(payout - bet)} at blackjack.`, 'pos');
          resultEl.className = 'mg-result win';
        } else if (payout === bet) {
          G.addLog('You pushed at blackjack.', 'info');
          resultEl.className = 'mg-result';
        } else {
          G.bump('happiness', -3);
          G.addLog('You lost at blackjack.', 'neg');
          resultEl.className = 'mg-result lose';
        }
        resultEl.textContent = msg;
        G.save();
        api.refresh();
        render();
      };

      const deal = () => {
        if (phase === 'player') return;
        const p = G.state.player;
        if (p.money < bet) { api.toast(`You need ${moneyFull(bet)} to play.`); return; }
        G.changeMoney(-bet);
        deck = makeDeck();
        player = [deck.pop(), deck.pop()];
        dealer = [deck.pop(), deck.pop()];
        phase = 'player';
        resultEl.textContent = 'Hit or stand?';
        resultEl.className = 'mg-result';
        render();
        if (handValue(player) === 21 || handValue(dealer) === 21) finish();
      };

      hitBtn.onclick = () => {
        if (phase !== 'player') return;
        player.push(deck.pop());
        render();
        if (handValue(player) > 21) finish();
      };
      standBtn.onclick = () => { if (phase === 'player') finish(); };
      dealBtn.onclick = deal;
      render();
    },
  });
}

const SUITS = [{ s: '♠', c: 'black' }, { s: '♥', c: 'red' }, { s: '♦', c: 'red' }, { s: '♣', c: 'black' }];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function makeDeck() {
  const deck = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ r: rank, s: suit.s, c: suit.c });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
function cardValue(c) {
  if (c.r === 'A') return 11;
  if (c.r === 'J' || c.r === 'Q' || c.r === 'K') return 10;
  return Number(c.r);
}
function handValue(hand) {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    if (c.r === 'A') { total += 11; aces++; } else total += cardValue(c);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}
function cardHTML(c) {
  return `<div class="mg-card ${c.c}"><span>${c.r}</span><i>${c.s}</i></div>`;
}

// ---------------------------------------------------------------------------
// Scratch card lottery
// ---------------------------------------------------------------------------
export function openLottery(api) {
  const p = G.state.player;
  const cost = 10;
  if (!p) return;
  if (p.money < cost) { api.toast(`You need ${moneyFull(cost)} for a ticket.`); return; }
  G.changeMoney(-cost);
  G.save();
  api.refresh();
  const grid = buildScratchGrid();
  let revealed = 0;
  let done = false;
  api.showModal({
    title: 'Scratch & Win',
    okText: 'Leave',
    body: `<div class="mg mg-scratch">
      <div class="mg-top"><span>Ticket <b>${moneyFull(cost)}</b></span><span class="mg-bank">Bank <b data-bank>${moneyFull(G.state.player.money)}</b></span></div>
      <p class="mg-hint">Scratch all 9 spots. Match 3 symbols to win a prize.</p>
      <div class="mg-grid" data-grid>${grid.map((s, i) => `<button class="mg-cell" data-i="${i}"><span class="mg-cell-back">?</span><span class="mg-cell-sym">${s}</span></button>`).join('')}</div>
      <div class="mg-result" data-result>Tap a spot to scratch it.</div>
    </div>`,
    dismissible: true,
    onMount: card => {
      const resultEl = $('[data-result]', card);
      $$('[data-i]', card).forEach(btn => {
        btn.onclick = () => {
          if (done || btn.classList.contains('revealed')) return;
          btn.classList.add('revealed');
          revealed++;
          if (revealed < 9) { resultEl.textContent = `${revealed}/9 scratched…`; return; }
          done = true;
          const counts = {};
          grid.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
          const winSym = Object.keys(counts).find(s => counts[s] >= 3);
          const prize = winSym ? SCRATCH_PRIZES[winSym] || 0 : 0;
          if (prize) {
            G.changeMoney(prize);
            G.bump('happiness', prize >= 10000 ? 20 : 8);
            G.addLog(`You won ${moneyFull(prize)} on a scratch card!`, prize >= 10000 ? 'special' : 'pos');
            resultEl.textContent = prize >= 1000000 ? `JACKPOT! ${moneyFull(prize)}!` : `Winner! ${moneyFull(prize)}.`;
            resultEl.className = 'mg-result win';
          } else {
            G.addLog('Your scratch card was a loser.', 'neg');
            resultEl.textContent = 'No match. Maybe next time.';
            resultEl.className = 'mg-result lose';
          }
          G.save();
          setBank(card);
          api.refresh();
        };
      });
    },
  });
}

function buildScratchGrid() {
  const roll = Math.random();
  let winSym = null;
  if (roll < 0.0004) winSym = '7️⃣';
  else if (roll < 0.01) winSym = '💎';
  else if (roll < 0.08) winSym = '⭐';
  const grid = [];
  if (winSym) grid.push(winSym, winSym, winSym);
  const pool = SLOT_SYMBOLS.filter(s => s !== winSym);
  while (grid.length < 9) {
    const counts = {};
    grid.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
    const available = pool.filter(s => (counts[s] || 0) < 2);
    grid.push(available.length ? rand(available) : rand(pool));
  }
  for (let i = grid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [grid[i], grid[j]] = [grid[j], grid[i]];
  }
  return grid;
}

// ---------------------------------------------------------------------------
// Crime timing minigame
// ---------------------------------------------------------------------------
const CRIMES = {
  shoplift: { title: 'Shoplift', diff: 1, hint: 'Slip the item into your bag when nobody is looking.' },
  pickpocket: { title: 'Pickpocket', diff: 2, hint: 'Lift the wallet at the perfect moment.' },
  carjack: { title: 'Steal a Car', diff: 3, hint: 'Break in and hotwire it before anyone notices.' },
  bankrob: { title: 'Rob a Bank', diff: 4, hint: 'The vault timer is ticking. Make your move.' },
  assault: { title: 'Start a Fight', diff: 2, hint: 'Pick your moment and throw the first punch.' },
  escape: { title: 'Prison Escape', diff: 5, hint: 'Dash past the guard tower when the searchlight turns.' },
};

export function openCrime(id, api) {
  const cfg = CRIMES[id];
  const p = G.state.player;
  if (!cfg || !p) return;
  const zoneW = clamp(42 - cfg.diff * 6 + (p.stats.smarts - 50) * 0.18, 14, 46);
  const zoneL = randInt(18, Math.round(78 - zoneW));
  const speed = 1500 - cfg.diff * 170;
  let raf = 0;
  let done = false;
  api.showModal({
    title: cfg.title,
    okText: 'Back Out',
    dismissible: false,
    body: `<div class="mg mg-crime">
      <p class="mg-hint">${cfg.hint}</p>
      <div class="mg-meter"><div class="mg-zone" style="left:${zoneL}%;width:${zoneW}%"></div><div class="mg-marker" data-marker></div></div>
      <div class="mg-result" data-result>Tap GRAB when the marker is in the green zone.</div>
      <button class="mg-btn primary" data-grab>GRAB IT</button>
    </div>`,
    onMount: card => {
      const marker = $('[data-marker]', card);
      const resultEl = $('[data-result]', card);
      const btn = $('[data-grab]', card);
      const start = performance.now();
      const tick = now => {
        const t = ((now - start) / speed) % 1;
        const pos = t < 0.5 ? t * 2 : (1 - t) * 2;
        marker.style.left = (pos * 100).toFixed(2) + '%';
        marker.dataset.pos = pos;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      btn.onclick = () => {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        const pos = Number(marker.dataset.pos || 0) * 100;
        const hit = pos >= zoneL && pos <= zoneL + zoneW;
        btn.disabled = true;
        resultEl.textContent = hit ? 'Clean getaway!' : 'Caught red-handed!';
        resultEl.className = 'mg-result ' + (hit ? 'win' : 'lose');
        setTimeout(() => {
          api.closeModal();
          const res = id === 'escape' ? G.prisonAction('escape', hit) : G.commitCrime(id, hit);
          api.refresh();
          api.showResult(res);
        }, 750);
      };
    },
    onClose: () => cancelAnimationFrame(raf),
  });
}
