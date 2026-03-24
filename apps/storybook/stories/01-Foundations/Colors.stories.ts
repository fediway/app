import type { Meta, StoryObj } from '@storybook/vue3';
import {
  PhArrowsClockwise,
  PhBookmarkSimple,
  PhChat,
  PhCompass,
  PhCursorClick,
  PhDotsThree,
  PhHeart,
  PhLayout,
  PhPaperPlaneRight,
  PhStar,
  PhTextBolder,
  PhWarning,
} from '@phosphor-icons/vue';
import { defineComponent, onMounted, ref } from 'vue';

// ═══════════════════════════════════════════════════════════════
// 1. PHILOSOPHY — The 8 color roles
// ═══════════════════════════════════════════════════════════════

const ColorPhilosophy = defineComponent({
  name: 'ColorPhilosophy',
  components: { PhHeart, PhArrowsClockwise, PhStar, PhCompass, PhWarning, PhCursorClick, PhLayout, PhTextBolder },
  template: `
    <div class="max-w-[900px]">
      <p class="text-sm text-muted-foreground mb-6 max-w-[640px] leading-relaxed">
        <strong class="text-foreground">Color as Meaning.</strong> Warmth as Identity. Content First.<br>
        The brand is not a hue — it's the warmth of the surface itself.
        Chromatic color appears only when it communicates meaning. Every color moment is earned.
      </p>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="role in roles" :key="role.name"
          class="rounded-xl p-3.5 flex gap-3 items-start"
          :style="{ background: role.bg, border: '1px solid ' + role.border }">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            :style="{ background: role.dot, color: role.dotText }">
            <component :is="role.icon" :size="16" :weight="role.fill ? 'fill' : 'regular'" />
          </div>
          <div>
            <div class="text-xs font-bold" :style="{ color: role.labelColor }">{{ role.name }}</div>
            <div class="text-[10px] leading-snug mt-0.5" :style="{ color: role.descColor }">{{ role.meaning }}</div>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <h3 class="text-sm font-bold text-foreground mb-3">Do's and Don'ts</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="rounded-lg p-3 bg-emerald-50 border border-emerald-100">
            <div class="text-xs font-bold text-emerald-700 mb-2">DO</div>
            <ul class="text-xs text-emerald-700/80 space-y-1.5">
              <li>Use <strong>gray-900</strong> (navy) for primary buttons</li>
              <li>Use <strong>galaxy-500</strong> for @mentions and #hashtags</li>
              <li>Use <strong>gold-400</strong> for star ratings (brighter)</li>
              <li>Use <strong>font-semibold</strong> for book titles, no color</li>
              <li>Use <strong>surface-inset</strong> (#F7F3E9) for item cards inside posts</li>
            </ul>
          </div>
          <div class="rounded-lg p-3 bg-red-50 border border-red-100">
            <div class="text-xs font-bold text-red-700 mb-2">DON'T</div>
            <ul class="text-xs text-red-700/80 space-y-1.5">
              <li>Don't use rose/pink for buttons — rose = love only</li>
              <li>Don't color book titles — content has no chromatic color</li>
              <li>Don't use blue links — looks like Bluesky. Use galaxy or bold</li>
              <li>Don't use generic gray — use the warm→cool brand gray</li>
              <li>Don't invert light palette for dark mode — use surface tokens</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    const roles = [
      { name: 'Rose = Love', meaning: 'Hearts, favourites, notifications', icon: 'PhHeart', fill: true, bg: 'var(--rose-50)', border: 'var(--rose-100)', dot: 'var(--rose-500)', dotText: 'white', labelColor: 'var(--rose-700)', descColor: 'var(--rose-500)' },
      { name: 'Emerald = Amplify', meaning: 'Boosts, reposts, sharing', icon: 'PhArrowsClockwise', fill: true, bg: 'var(--emerald-50)', border: 'var(--emerald-100)', dot: 'var(--emerald-500)', dotText: 'white', labelColor: 'var(--emerald-700)', descColor: 'var(--emerald-500)' },
      { name: 'Gold = Judgment', meaning: 'Ratings, reviews, bookmarks', icon: 'PhStar', fill: true, bg: 'var(--gold-50)', border: 'var(--gold-100)', dot: 'var(--gold-400)', dotText: 'white', labelColor: 'var(--gold-600)', descColor: 'var(--gold-400)' },
      { name: 'Galaxy = Discovery', meaning: '@mentions, #hashtags, links, info', icon: 'PhCompass', fill: false, bg: 'var(--galaxy-50)', border: 'var(--galaxy-100)', dot: 'var(--galaxy-500)', dotText: 'white', labelColor: 'var(--galaxy-700)', descColor: 'var(--galaxy-500)' },
      { name: 'Red = Caution', meaning: 'Errors, delete, destructive', icon: 'PhWarning', fill: false, bg: 'var(--red-50)', border: 'var(--red-100)', dot: 'var(--red-500)', dotText: 'white', labelColor: 'var(--red-700)', descColor: 'var(--red-500)' },
      { name: 'Indigo = Interactive', meaning: 'Secondary buttons, UI controls', icon: 'PhCursorClick', fill: false, bg: 'oklch(0.95 0.020 280 / 0.3)', border: 'oklch(0.90 0.025 280 / 0.3)', dot: 'var(--interactive)', dotText: 'var(--interactive-text)', labelColor: 'var(--interactive)', descColor: 'oklch(0.50 0.050 280)' },
      { name: 'Gray = Structure', meaning: 'Primary buttons, text, surfaces', icon: 'PhLayout', fill: false, bg: 'var(--muted)', border: 'var(--border)', dot: 'var(--primary)', dotText: 'var(--primary-foreground)', labelColor: 'var(--foreground)', descColor: 'var(--muted-foreground)' },
      { name: 'No Color = Content', meaning: 'Book titles (bold), body text', icon: 'PhTextBolder', fill: false, bg: 'var(--card)', border: 'var(--border)', dot: 'var(--primary)', dotText: 'var(--primary-foreground)', labelColor: 'var(--foreground)', descColor: 'var(--muted-foreground)' },
    ];
    return { roles };
  },
});

// ═══════════════════════════════════════════════════════════════
// 2. PRIMITIVE PALETTE — 6 families × 11 steps
// ═══════════════════════════════════════════════════════════════

const PrimitivePalette = defineComponent({
  name: 'PrimitivePalette',
  template: `
    <div class="max-w-[900px]">
      <p class="text-sm text-muted-foreground mb-4">6 families × 11 steps = 66 colors. OKLCH-based. Click any swatch to copy the CSS variable.</p>
      <div class="space-y-2">
        <div v-for="family in families" :key="family.name" class="flex items-center gap-2">
          <div class="w-20 text-right pr-2 shrink-0">
            <div class="text-xs font-bold" :style="{ color: 'var(--' + family.name + '-600)' }">{{ family.label }}</div>
            <div class="text-[10px]" :style="{ color: 'var(--' + family.name + '-400)' }">{{ family.desc }}</div>
          </div>
          <div class="grid grid-cols-11 gap-1.5 flex-1">
            <div v-for="step in steps" :key="step"
              class="aspect-square rounded-lg cursor-pointer relative flex items-end justify-center pb-0.5 transition-all hover:scale-110 hover:z-10 hover:shadow-lg group"
              :style="{ background: 'var(--' + family.name + '-' + step + ')' }"
              :title="'--' + family.name + '-' + step"
              @click="copy('--' + family.name + '-' + step)">
              <span class="text-[8px] font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                :style="{ color: step <= 400 ? 'var(--' + family.name + '-900)' : 'var(--' + family.name + '-50)' }">
                {{ step }}
              </span>
              <span v-if="brandMarkers[family.name + '-' + step]"
                class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white shadow-sm ring-1 ring-black/20" />
            </div>
          </div>
        </div>
      </div>
      <!-- Step labels -->
      <div class="flex items-center gap-2 mt-2">
        <div class="w-20 shrink-0" />
        <div class="grid grid-cols-11 gap-1.5 flex-1">
          <div v-for="step in steps" :key="step" class="text-center text-[9px] font-mono text-muted-foreground/50">{{ step }}</div>
        </div>
      </div>
      <!-- Toast -->
      <Teleport to="body">
        <Transition name="toast">
          <div v-if="copied"
            class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-mono shadow-xl z-[9999]">
            {{ copied }}
          </div>
        </Transition>
      </Teleport>
    </div>
  `,
  setup() {
    const copied = ref('');
    const families = [
      { name: 'rose', label: 'Rose', desc: 'Love' },
      { name: 'gold', label: 'Gold', desc: 'Judgment' },
      { name: 'emerald', label: 'Emerald', desc: 'Amplify' },
      { name: 'galaxy', label: 'Galaxy', desc: 'Discovery' },
      { name: 'red', label: 'Red', desc: 'Caution' },
      { name: 'gray', label: 'Gray', desc: 'Structure' },
    ];
    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    const brandMarkers: Record<string, string> = {
      'rose-400': '#EC84AF',
      'gold-400': '#DBA800',
      'red-600': '#C23737',
      'gray-100': '#F6F3EB',
      'gray-200': '#EDE6D6',
      'gray-900': '#232B37',
    };
    const copy = (varName: string) => {
      navigator.clipboard.writeText(`var(${varName})`);
      copied.value = `var(${varName})`;
      setTimeout(() => {
        copied.value = '';
      }, 1500);
    };
    return { families, steps, brandMarkers, copy, copied };
  },
});

// ═══════════════════════════════════════════════════════════════
// 3. GRAY HUE JOURNEY — warm gold → rose → cool indigo
// ═══════════════════════════════════════════════════════════════

const GrayHueJourney = defineComponent({
  name: 'GrayHueJourney',
  template: `
    <div class="max-w-[900px]">
      <p class="text-sm text-muted-foreground mb-4">
        The brand lives here. The gray scale rotates from warm gold through rose to cool indigo.
        Rose sits at the midpoint — the brand's primary accent embedded in every neutral.
      </p>
      <div class="flex rounded-xl overflow-hidden" style="height: 72px">
        <div v-for="(step, i) in graySteps" :key="step.value"
          class="flex-1 flex items-end justify-center pb-1.5"
          :style="{ background: 'var(--gray-' + step.value + ')' }">
          <span class="text-[8px] font-mono font-bold"
            :style="{ color: step.value <= 400 ? 'var(--gray-800)' : 'var(--gray-200)' }">
            {{ step.hue }}°
          </span>
        </div>
      </div>
      <div class="flex mt-1.5 text-[10px] font-semibold">
        <div class="flex-1 text-left" style="color: var(--gold-600)">gold 90°</div>
        <div class="flex-1 text-center" style="color: var(--rose-500)">rose 10°</div>
        <div class="flex-1 text-right" style="color: var(--galaxy-600)">indigo 255°</div>
      </div>
      <div class="mt-4 grid grid-cols-3 gap-4 text-xs leading-relaxed">
        <div class="text-muted-foreground"><span class="font-bold" style="color: var(--gold-500)">50–200</span><br>Warm cream — the bookshop feel</div>
        <div class="text-muted-foreground"><span class="font-bold" style="color: var(--rose-400)">400–500</span><br>Rose undertone — brand DNA in every neutral</div>
        <div class="text-muted-foreground"><span class="font-bold" style="color: var(--galaxy-600)">700–950</span><br>Cool indigo — the galaxy void</div>
      </div>
    </div>
  `,
  setup() {
    const graySteps = [
      { value: 50, hue: 90 },
      { value: 100, hue: 85 },
      { value: 200, hue: 75 },
      { value: 300, hue: 55 },
      { value: 400, hue: 30 },
      { value: 500, hue: 10 },
      { value: 600, hue: 345 },
      { value: 700, hue: 300 },
      { value: 800, hue: 275 },
      { value: 900, hue: 260 },
      { value: 950, hue: 255 },
    ];
    return { graySteps };
  },
});

// ═══════════════════════════════════════════════════════════════
// 4. SURFACE TOKENS — Elevation system
// ═══════════════════════════════════════════════════════════════

const SurfaceTokens = defineComponent({
  name: 'SurfaceTokens',
  template: `
    <div class="max-w-[900px]">
      <p class="text-sm text-muted-foreground mb-4">
        Separate from the primitive scale. Light mode: cream → white → cream (Apple sandwich).
        Dark mode: 4% lightness steps for elevation.
      </p>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Light -->
        <div>
          <div class="text-xs font-bold text-muted-foreground/60 mb-3">LIGHT MODE</div>
          <div class="rounded-xl p-4 space-y-3" style="background: var(--surface-base); border: 1px solid var(--border-subtle)">
            <div class="text-[10px] font-mono text-muted-foreground">surface-base — page bg</div>
            <div class="rounded-lg p-4" style="background: var(--surface-raised); border: 1px solid var(--border-default); box-shadow: 0 1px 3px rgba(0,0,0,0.04)">
              <div class="text-[10px] font-mono text-muted-foreground mb-2">surface-raised — post card (white)</div>
              <div class="text-sm text-foreground">Content on card</div>
              <div class="rounded-md p-3 mt-3" style="background: var(--surface-inset); border: 1px solid var(--border-subtle)">
                <div class="text-[10px] font-mono text-muted-foreground">surface-inset — item card (#F7F3E9)</div>
              </div>
            </div>
            <div class="rounded-lg p-3" style="background: var(--surface-sunken); border: 1px solid var(--border-subtle)">
              <div class="text-[10px] font-mono text-muted-foreground">surface-sunken — inputs, code</div>
            </div>
          </div>
        </div>
        <!-- Dark -->
        <div>
          <div class="text-xs font-bold text-muted-foreground/60 mb-3">DARK MODE</div>
          <div class="rounded-xl p-4 space-y-3" style="background: var(--surface-dark-base)">
            <div class="text-[10px] font-mono" style="color: var(--fg-dark-tertiary)">surface-dark-base — L 19%</div>
            <div class="rounded-lg p-4" style="background: var(--surface-dark-raised); border: 1px solid var(--border-dark-subtle)">
              <div class="text-[10px] font-mono mb-2" style="color: var(--fg-dark-tertiary)">surface-dark-raised — L 23%</div>
              <div class="text-sm" style="color: var(--fg-dark-primary)">Content on dark card</div>
              <div class="rounded-md p-3 mt-3" style="background: var(--surface-dark-overlay); border: 1px solid var(--border-dark-default)">
                <div class="text-[10px] font-mono" style="color: var(--fg-dark-tertiary)">surface-dark-overlay — L 27%</div>
                <div class="rounded-md p-3 mt-2" style="background: var(--surface-dark-elevated); border: 1px solid var(--border-dark-default)">
                  <div class="text-[10px] font-mono" style="color: var(--fg-dark-tertiary)">surface-dark-elevated — L 31%</div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-3 flex items-end gap-1" style="height: 64px">
            <div v-for="(level, i) in darkLevels" :key="level.name"
              class="flex-1 rounded-t-md flex items-end justify-center pb-1"
              :style="{ height: (20 + i * 20) + '%', background: level.bg }">
              <span class="text-[7px] font-mono" :style="{ color: level.text }">{{ level.name }}</span>
            </div>
          </div>
          <div class="text-[10px] font-mono mt-1 text-center text-muted-foreground/50">L 19% → 23% → 27% → 31% → 35%</div>
        </div>
      </div>

      <!-- Token table -->
      <div class="mt-6 rounded-xl overflow-hidden border border-border">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-muted">
              <th class="text-left p-2.5 font-semibold text-muted-foreground">Token</th>
              <th class="text-left p-2.5 font-semibold text-muted-foreground">Light</th>
              <th class="text-left p-2.5 font-semibold text-muted-foreground">Dark</th>
              <th class="text-left p-2.5 font-semibold text-muted-foreground">Use</th>
            </tr>
          </thead>
          <tbody class="font-mono text-muted-foreground">
            <tr v-for="row in tokenRows" :key="row.token" class="border-t border-border">
              <td class="p-2.5 font-semibold text-foreground">{{ row.token }}</td>
              <td class="p-2.5"><span class="inline-block w-3 h-3 rounded align-middle mr-1.5" :style="{ background: row.lightBg, border: '1px solid var(--border)' }"></span>{{ row.light }}</td>
              <td class="p-2.5"><span class="inline-block w-3 h-3 rounded align-middle mr-1.5" :style="{ background: row.darkBg }"></span>{{ row.dark }}</td>
              <td class="p-2.5">{{ row.use }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  setup() {
    const darkLevels = [
      { name: 'base', bg: 'var(--surface-dark-base)', text: 'var(--fg-dark-placeholder)' },
      { name: 'raised', bg: 'var(--surface-dark-raised)', text: 'var(--fg-dark-tertiary)' },
      { name: 'overlay', bg: 'var(--surface-dark-overlay)', text: 'var(--fg-dark-tertiary)' },
      { name: 'elevated', bg: 'var(--surface-dark-elevated)', text: 'var(--fg-dark-secondary)' },
      { name: 'highlight', bg: 'var(--surface-dark-highlight)', text: 'var(--fg-dark-secondary)' },
    ];
    const tokenRows = [
      { token: 'surface-base', light: 'cream L97%', lightBg: 'var(--surface-base)', dark: 'void L19%', darkBg: 'var(--surface-dark-base)', use: 'Page background' },
      { token: 'surface-raised', light: 'white L100%', lightBg: 'var(--surface-raised)', dark: 'navy L23%', darkBg: 'var(--surface-dark-raised)', use: 'Post cards' },
      { token: 'surface-overlay', light: 'white L100%', lightBg: 'var(--surface-overlay)', dark: 'navy L27%', darkBg: 'var(--surface-dark-overlay)', use: 'Popovers' },
      { token: 'surface-elevated', light: 'white L100%', lightBg: 'var(--surface-raised)', dark: 'indigo L31%', darkBg: 'var(--surface-dark-elevated)', use: 'Modals' },
      { token: 'surface-inset', light: '#F7F3E9', lightBg: 'var(--surface-inset)', dark: 'void L19%', darkBg: 'var(--surface-dark-base)', use: 'Item cards' },
      { token: 'surface-sunken', light: 'cream L94%', lightBg: 'var(--surface-sunken)', dark: '—', darkBg: 'transparent', use: 'Inputs, code' },
    ];
    return { darkLevels, tokenRows };
  },
});

// ═══════════════════════════════════════════════════════════════
// 5. INTERACTIVE TOKENS — Chromatic gray
// ═══════════════════════════════════════════════════════════════

const InteractiveTokens = defineComponent({
  name: 'InteractiveTokens',
  template: `
    <div class="max-w-[900px]">
      <p class="text-sm text-muted-foreground mb-4">
        Not a color family — a role. Purpose-built tokens for secondary interactions.
        Same indigo hue (H 278°) as the dark grays, chroma pushed to 0.100 for a rich glow.
      </p>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Light -->
        <div>
          <div class="text-xs font-bold text-muted-foreground/60 mb-3">LIGHT MODE</div>
          <div class="rounded-xl p-5 bg-card border border-border">
            <div class="flex gap-3 items-end mb-4">
              <div v-for="t in lightTokens" :key="t.name" class="flex flex-col items-center gap-1">
                <div class="rounded-lg flex items-center justify-center"
                  :class="t.large ? 'w-14 h-14' : 'w-11 h-11'"
                  :style="{ background: t.bg }">
                  <span v-if="t.label" class="text-[9px] font-mono font-bold" :style="{ color: t.labelColor }">{{ t.label }}</span>
                </div>
                <span class="text-[8px] font-mono text-muted-foreground/50">{{ t.name }}</span>
              </div>
            </div>
            <p class="text-sm text-foreground/80">
              Post by <span class="font-semibold" style="color: var(--galaxy-500)">@SusannaClarke</span>
              about <span class="font-medium" style="color: var(--galaxy-500)">#Fantasy</span>
            </p>
          </div>
        </div>
        <!-- Dark -->
        <div>
          <div class="text-xs font-bold text-muted-foreground/60 mb-3">DARK MODE</div>
          <div class="rounded-xl p-5" style="background: var(--surface-dark-raised); border: 1px solid var(--border-dark-subtle)">
            <div class="flex gap-3 items-end mb-4">
              <div v-for="t in darkTokens" :key="t.name" class="flex flex-col items-center gap-1">
                <div class="rounded-lg flex items-center justify-center"
                  :class="t.large ? 'w-14 h-14' : 'w-11 h-11'"
                  :style="{ background: t.bg }">
                  <span v-if="t.label" class="text-[9px] font-mono font-bold" :style="{ color: t.labelColor }">{{ t.label }}</span>
                </div>
                <span class="text-[8px] font-mono" style="color: var(--fg-dark-placeholder)">{{ t.name }}</span>
              </div>
            </div>
            <p class="text-sm" style="color: var(--fg-dark-primary)">
              Post by <span class="font-semibold" style="color: var(--galaxy-400)">@SusannaClarke</span>
              about <span class="font-medium" style="color: var(--galaxy-400)">#Fantasy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    const lightTokens = [
      { name: 'subtle', bg: 'var(--interactive-subtle)', large: false },
      { name: 'active', bg: 'var(--interactive-active)', large: false },
      { name: 'base', bg: 'var(--interactive)', label: '#525380', labelColor: 'var(--interactive-text)', large: true },
      { name: 'hover', bg: 'var(--interactive-hover)', large: false },
      { name: 'text', bg: 'var(--interactive-text)', label: 'Aa', labelColor: 'var(--interactive)', large: false },
    ];
    const darkTokens = [
      { name: 'subtle', bg: 'var(--interactive-subtle)', large: false },
      { name: 'active', bg: 'var(--interactive-active)', large: false },
      { name: 'base', bg: 'var(--interactive)', label: 'base', labelColor: 'var(--interactive-text)', large: true },
      { name: 'hover', bg: 'var(--interactive-hover)', large: false },
      { name: 'text-dark', bg: 'var(--interactive-text-dark)', label: 'Aa', labelColor: 'var(--surface-dark-raised)', large: false },
    ];
    return { lightTokens, darkTokens };
  },
});

// ═══════════════════════════════════════════════════════════════
// 6. IN CONTEXT — Post mockup
// ═══════════════════════════════════════════════════════════════

const _InContext = defineComponent({
  name: 'InContext',
  components: { PhChat, PhArrowsClockwise, PhHeart, PhBookmarkSimple, PhPaperPlaneRight, PhDotsThree, PhStar },
  template: `
    <div class="max-w-[900px]">
      <p class="text-sm text-muted-foreground mb-4">
        How the color system works in a real post. Color only appears on active interactions and content (ratings).
        The UI itself is warm cream and navy. Toggle Storybook dark mode to compare.
      </p>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Light post -->
        <div>
          <div class="text-[10px] font-bold font-mono text-muted-foreground/50 mb-2">LIGHT</div>
          <div class="rounded-xl overflow-hidden bg-card border border-border">
            <div class="p-5">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-secondary text-secondary-foreground">JA</div>
                <div class="flex-1">
                  <div class="text-sm font-semibold text-foreground">Jane Austen</div>
                  <div class="text-xs text-muted-foreground"><span class="font-medium" style="color: var(--galaxy-500)">@jane</span>@books.social · 2h</div>
                </div>
                <PhDotsThree :size="20" class="text-muted-foreground cursor-pointer" />
              </div>
              <p class="text-sm text-foreground leading-relaxed mb-3">
                Just finished <span class="font-semibold">Piranesi</span> by <span class="font-semibold" style="color: var(--galaxy-500)">@SusannaClarke</span>.
                The way she builds atmosphere is extraordinary. <span class="font-medium" style="color: var(--galaxy-500)">#BookReview</span>
              </p>
              <div class="rounded-lg p-3 mb-4" style="background: var(--surface-inset); border: 1px solid var(--border-subtle)">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-xs font-semibold text-foreground">Piranesi</div>
                    <div class="text-[11px] text-muted-foreground">Susanna Clarke · 2020</div>
                  </div>
                  <div style="color: var(--gold-400)">
                    <PhStar v-for="i in 5" :key="i" :size="14" weight="fill" />
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="flex items-center gap-1 text-xs text-muted-foreground px-1.5 py-1 rounded-md cursor-pointer hover:bg-muted">
                  <PhChat :size="18" /> 3
                </span>
                <span class="flex items-center gap-1 text-xs font-semibold px-1.5 py-1 rounded-md cursor-pointer" style="color: var(--emerald-500)">
                  <PhArrowsClockwise :size="18" weight="fill" /> 12
                </span>
                <span class="flex items-center gap-1 text-xs font-semibold px-1.5 py-1 rounded-md cursor-pointer" style="color: var(--rose-500)">
                  <PhHeart :size="18" weight="fill" /> 47
                </span>
                <span class="flex items-center gap-1 text-xs px-1.5 py-1 rounded-md cursor-pointer" style="color: var(--gold-400)">
                  <PhBookmarkSimple :size="18" weight="fill" />
                </span>
                <span class="flex items-center gap-1 text-xs text-muted-foreground px-1.5 py-1 rounded-md cursor-pointer hover:bg-muted">
                  <PhPaperPlaneRight :size="18" />
                </span>
              </div>
            </div>
          </div>
        </div>
        <!-- Dark post -->
        <div>
          <div class="text-[10px] font-bold font-mono text-muted-foreground/50 mb-2">DARK</div>
          <div class="rounded-xl overflow-hidden" style="background: var(--surface-dark-raised); border: 1px solid var(--border-dark-subtle)">
            <div class="p-5">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style="background: var(--surface-dark-overlay); color: var(--fg-dark-tertiary)">JA</div>
                <div class="flex-1">
                  <div class="text-sm font-semibold" style="color: var(--fg-dark-primary)">Jane Austen</div>
                  <div class="text-xs" style="color: var(--fg-dark-placeholder)"><span class="font-medium" style="color: var(--galaxy-400)">@jane</span>@books.social · 2h</div>
                </div>
                <PhDotsThree :size="20" style="color: var(--fg-dark-placeholder)" class="cursor-pointer" />
              </div>
              <p class="text-sm leading-relaxed mb-3" style="color: var(--fg-dark-primary)">
                Just finished <span class="font-semibold">Piranesi</span> by <span class="font-semibold" style="color: var(--galaxy-400)">@SusannaClarke</span>.
                The way she builds atmosphere is extraordinary. <span class="font-medium" style="color: var(--galaxy-400)">#BookReview</span>
              </p>
              <div class="rounded-lg p-3 mb-4" style="background: var(--surface-dark-overlay); border: 1px solid var(--border-dark-default)">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-xs font-semibold" style="color: var(--fg-dark-primary)">Piranesi</div>
                    <div class="text-[11px]" style="color: var(--fg-dark-tertiary)">Susanna Clarke · 2020</div>
                  </div>
                  <div style="color: var(--gold-400)">
                    <PhStar v-for="i in 5" :key="i" :size="14" weight="fill" />
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="flex items-center gap-1 text-xs px-1.5 py-1 rounded-md cursor-pointer" style="color: var(--fg-dark-placeholder)">
                  <PhChat :size="18" /> 3
                </span>
                <span class="flex items-center gap-1 text-xs font-semibold px-1.5 py-1 rounded-md cursor-pointer" style="color: var(--emerald-400)">
                  <PhArrowsClockwise :size="18" weight="fill" /> 12
                </span>
                <span class="flex items-center gap-1 text-xs font-semibold px-1.5 py-1 rounded-md cursor-pointer" style="color: var(--rose-400)">
                  <PhHeart :size="18" weight="fill" /> 47
                </span>
                <span class="flex items-center gap-1 text-xs px-1.5 py-1 rounded-md cursor-pointer" style="color: var(--gold-400)">
                  <PhBookmarkSimple :size="18" weight="fill" />
                </span>
                <span class="flex items-center gap-1 text-xs px-1.5 py-1 rounded-md cursor-pointer" style="color: var(--fg-dark-placeholder)">
                  <PhPaperPlaneRight :size="18" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
});

// ═══════════════════════════════════════════════════════════════
// 7. CONTRAST CHECKER
// ═══════════════════════════════════════════════════════════════

const ContrastChecker = defineComponent({
  name: 'ContrastChecker',
  template: `
    <div class="max-w-[900px]">
      <p class="text-sm text-muted-foreground mb-4">
        White text on each shade. Contrast ratios computed live.
        <span class="font-semibold" style="color: var(--emerald-600)">■ AA ≥4.5:1</span>
        <span class="font-semibold ml-2" style="color: var(--gold-500)">■ Large ≥3:1</span>
      </p>
      <div class="space-y-2" ref="gridRef">
        <div v-for="family in families" :key="family.name" class="flex items-center gap-2">
          <div class="w-20 text-right text-xs font-bold pr-2 shrink-0"
            :style="{ color: 'var(--' + family.name + '-600)' }">{{ family.label }}</div>
          <div class="grid grid-cols-11 gap-1.5 flex-1">
            <div v-for="step in steps" :key="step"
              :ref="el => registerCell(el, family.name, step)"
              class="rounded-md flex items-center justify-center text-[9px] font-bold font-mono text-white relative"
              style="min-height: 28px"
              :style="{ background: 'var(--' + family.name + '-' + step + ')' }">
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    const gridRef = ref<HTMLElement>();
    const cellRegistry: { el: HTMLElement; family: string; step: number }[] = [];

    const families = [
      { name: 'rose', label: 'Rose' },
      { name: 'gold', label: 'Gold' },
      { name: 'emerald', label: 'Emerald' },
      { name: 'galaxy', label: 'Galaxy' },
      { name: 'red', label: 'Red' },
      { name: 'gray', label: 'Gray' },
    ];
    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

    const rgbRegex = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/;
    const parseRgb = (str: string): number[] | null => {
      const m = str.match(rgbRegex);
      return m ? [+m[1], +m[2], +m[3]] : null;
    };
    const srgbToLinear = (c: number) => {
      c /= 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const luminance = (r: number, g: number, b: number) =>
      0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);

    const registerCell = (el: any, family: string, step: number) => {
      if (el instanceof HTMLElement)
        cellRegistry.push({ el, family, step });
    };

    onMounted(() => {
      requestAnimationFrame(() => {
        cellRegistry.forEach(({ el }) => {
          const bg = getComputedStyle(el).backgroundColor;
          const rgb = parseRgb(bg);
          if (!rgb)
            return;
          const L = luminance(rgb[0], rgb[1], rgb[2]);
          const ratio = 1.05 / (L + 0.05);
          el.textContent = ratio.toFixed(1);
          if (ratio >= 4.5) {
            const badge = document.createElement('div');
            badge.className = 'absolute top-0.5 right-0.5 text-[6px] font-extrabold px-0.5 rounded-sm';
            badge.style.cssText = 'background:oklch(0.6 0.12 155);color:white';
            badge.textContent = 'AA';
            el.appendChild(badge);
          }
          else if (ratio >= 3) {
            const badge = document.createElement('div');
            badge.className = 'absolute top-0.5 right-0.5 text-[6px] font-extrabold px-0.5 rounded-sm';
            badge.style.cssText = 'background:oklch(0.72 0.13 87);color:var(--gray-900)';
            badge.textContent = 'lg';
            el.appendChild(badge);
          }
        });
      });
    });

    return { families, steps, gridRef, registerCell };
  },
});

// ═══════════════════════════════════════════════════════════════
// META & STORIES
// ═══════════════════════════════════════════════════════════════

const meta = {
  title: '01-Foundations/Colors',
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Philosophy: Story = {
  name: 'Philosophy & Roles',
  render: () => ({ components: { ColorPhilosophy }, template: '<ColorPhilosophy />' }),
};

export const Palette: Story = {
  name: 'Primitive Palette',
  render: () => ({ components: { PrimitivePalette }, template: '<PrimitivePalette />' }),
};

export const GrayJourney: Story = {
  name: 'Gray Hue Journey',
  render: () => ({ components: { GrayHueJourney }, template: '<GrayHueJourney />' }),
};

export const Surfaces: Story = {
  name: 'Surface Elevation',
  render: () => ({ components: { SurfaceTokens }, template: '<SurfaceTokens />' }),
};

export const Interactive: Story = {
  name: 'Interactive Tokens',
  render: () => ({ components: { InteractiveTokens }, template: '<InteractiveTokens />' }),
};

export const Contrast: Story = {
  name: 'Contrast Checker',
  render: () => ({ components: { ContrastChecker }, template: '<ContrastChecker />' }),
};
