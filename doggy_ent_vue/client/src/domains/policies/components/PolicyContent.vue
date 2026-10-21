<script setup>
import { POLICY_BUSINESS, POLICY_PAGES } from '../content/policyPages.js'
defineProps({ page: { type: Object, required: true }, pageKey: { type: String, required: true } })
</script>
<template>
  <div class="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[200px_minmax(0,1fr)] md:py-14">
    <nav aria-label="Shop information" class="min-w-0">
      <p class="mb-3 text-sm font-semibold">Shop information</p>
      <ul class="flex flex-wrap gap-1 md:block">
        <li v-for="(item, key) in POLICY_PAGES" :key="key"><RouterLink :to="item.path" :aria-current="key === pageKey ? 'page' : undefined" class="flex min-h-11 items-center rounded-md px-3 py-2 text-sm hover:bg-stone-100" :class="key === pageKey ? 'bg-stone-100 font-semibold' : ''">{{ item.label }}</RouterLink></li>
      </ul>
    </nav>
    <article class="min-w-0 max-w-3xl">
      <p class="mb-4 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm leading-relaxed"><strong>Draft for review.</strong> Not yet an effective policy. Business details and terms need approval before launch.</p>
      <header class="border-b border-stone-200 pb-6">
        <h1 class="text-3xl leading-tight font-bold text-[var(--storefront-brand-4)]">{{ page.title }}</h1>
        <p class="mt-4 max-w-2xl leading-relaxed text-stone-600">{{ page.introduction }}</p>
        <p class="mt-3 text-sm text-stone-500">{{ POLICY_BUSINESS.name }} &middot; Draft updated {{ POLICY_BUSINESS.reviewedOn }}</p>
      </header>
      <section v-for="section in page.sections" :id="section.id" :key="section.id" class="border-b border-stone-200 py-6">
        <h2 class="text-lg font-semibold">{{ section.title }}</h2>
        <p v-for="paragraph in section.paragraphs" :key="paragraph" class="mt-3 leading-7 text-stone-700">{{ paragraph }}</p>
        <ul v-if="section.bullets" class="mt-3 list-disc space-y-2 pl-5 leading-7 text-stone-700"><li v-for="bullet in section.bullets" :key="bullet">{{ bullet }}</li></ul>
      </section>
      <section v-if="pageKey === 'cookies'" id="preferences" class="border-b border-stone-200 py-6" aria-labelledby="storage-preferences-title">
        <h2 id="storage-preferences-title" class="text-lg font-semibold">Current storage settings</h2>
        <dl class="mt-3 divide-y divide-stone-200 text-sm"><div class="flex justify-between gap-4 py-3"><dt>Bag and sign-in</dt><dd>Used when requested</dd></div><div class="flex justify-between gap-4 py-3"><dt>Remember checkout details</dt><dd>Optional in checkout</dd></div><div class="flex justify-between gap-4 py-3"><dt>Shop analytics &amp; advertising</dt><dd>Not enabled in application</dd></div></dl>
        <p class="mt-3 text-sm leading-relaxed text-stone-600">No optional tracking choice is being collected. This is not a marketing consent form.</p>
      </section>
      <section class="pt-6" aria-labelledby="policy-contact-title">
        <h2 id="policy-contact-title" class="text-lg font-semibold">Questions? Talk to us.</h2>
        <a :href="'mailto:' + POLICY_BUSINESS.email" class="mt-3 inline-flex min-h-11 items-center break-all text-[var(--storefront-brand-1)] underline underline-offset-4">{{ POLICY_BUSINESS.email }}</a>
        <p class="mt-1 text-sm text-stone-600">Please do not send passwords or private payment details.</p>
      </section>
    </article>
  </div>
</template>
