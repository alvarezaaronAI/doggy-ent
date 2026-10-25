<script setup>
import { Check, LockKeyhole, ArrowLeft, PawPrint } from '@lucide/vue'
defineProps({ settings: Object, checklist: { type: Array, default: () => [] }, preview: Boolean })
</script>
<template>
  <div class="checkout-ui store-pattern flex-1">
    <header class="border-b border-stone-200 bg-white">
      <nav class="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-5" aria-label="Checkout navigation">
        <RouterLink to="/" class="flex items-center gap-2 font-semibold text-[#6a3c2b]" :tabindex="preview ? -1 : 0" @click="preview && $event.preventDefault()"><PawPrint :size="24" class="text-[#315bc5]" />Chase &amp; Evie Co.</RouterLink>
        <RouterLink to="/" class="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm" :tabindex="preview ? -1 : 0" @click="preview && $event.preventDefault()"><ArrowLeft :size="16" />Back to shop</RouterLink>
      </nav>
    </header>
    <main class="mx-auto max-w-[1180px] px-4 py-8">
      <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div><h1 class="text-3xl font-semibold text-[#6a3c2b]">{{ settings?.title || 'Checkout' }}</h1><p class="mt-2 text-sm text-stone-600">{{ settings?.introduction }}</p></div>
        <p class="inline-flex items-center gap-2 text-xs text-stone-600"><LockKeyhole :size="15" />Secure payment with Stripe</p>
      </div>
      <ol class="checkout-steps mb-7" aria-label="Checkout progress">
        <li v-for="(step, index) in checklist" :key="step.id" class="flex min-w-0 items-center gap-2 text-xs" :class="step.complete ? 'text-[#17634c]' : 'text-stone-500'">
          <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-stone-200 bg-white"><Check v-if="step.complete" :size="14" /><span v-else>{{ index + 1 }}</span></span><span>{{ step.label }}</span>
        </li>
      </ol>
      <div class="checkout-layout">
        <section class="checkout-form min-w-0"><slot /></section>
        <aside class="checkout-bag min-w-0 space-y-5"><slot name="summary" /></aside>
      </div>
    </main>
  </div>
</template>
<style scoped>
.checkout-ui { --brand-1: var(--storefront-brand-1); --brand-2: var(--storefront-brand-2); --brand-3: var(--storefront-brand-3); --brand-4: var(--storefront-brand-4); --brand-5: var(--storefront-brand-5); background: #f8f7f3; color: #303b34; min-height: 100%; container-type: inline-size; }
.checkout-layout { display: grid; grid-template-columns: minmax(0,1fr); gap: 24px; align-items: start; }
.checkout-steps { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 8px; }
.checkout-ui :deep(input), .checkout-ui :deep(select), .checkout-ui :deep(label) { min-width: 0; max-width: 100%; }
.checkout-ui :deep(.section-panel) { border-radius: 8px; border-color: #ddd9d2; box-shadow: 0 8px 24px #24352d0a; }
.checkout-ui :deep(.checkout-form > form > fieldset > div), .checkout-ui :deep(.checkout-form > div) { background: white; border-radius: 8px; border-color: #ddd9d2; box-shadow: 0 8px 24px #24352d0a; }
.checkout-ui :deep(button:focus-visible), .checkout-ui :deep(a:focus-visible), .checkout-ui :deep(input:focus-visible) { outline: 2px solid #315bc5; outline-offset: 2px; }
.checkout-ui :deep(h3) { font-size: 18px; }
.checkout-ui :deep(.text-stone-300), .checkout-ui :deep(.text-stone-400) { color: #57534e; }
.checkout-ui :deep(input), .checkout-ui :deep(select) { border-color: #d2d7d3; border-radius: 6px; }
@container (min-width: 900px) { .checkout-layout { grid-template-columns: minmax(0,1fr) 370px; } .checkout-bag { position: sticky; top: 20px; } }
@container (max-width: 899px) { .checkout-bag { grid-row: 1; } .checkout-form { grid-row: 2; } }
@container (max-width: 420px) { .checkout-steps { grid-template-columns: repeat(2,minmax(0,1fr)); } .checkout-ui :deep(.checkout-form > form > fieldset > div) { padding: 16px; } .checkout-ui :deep(.checkout-form > form > fieldset > div > .flex) { gap: 10px; } }
</style>
