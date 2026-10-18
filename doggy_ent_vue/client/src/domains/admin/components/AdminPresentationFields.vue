<script setup>
import { PRESENTATION_FIELDS } from '../constants/websiteEditor.constants.js'
import AdminImageField from './AdminImageField.vue'
import { PRESENTATION_COLORS } from '@storefront-content/pagePresentation.js'
defineProps({ draft: { type: Object, required: true }, area: String })
</script>
<template>
  <div class="space-y-4">
    <h2>Page presentation</h2>
    <p class="admin-muted text-xs">Static wording and appearance only. Product records, variants, prices, stock, campaign stories, partner details and donation rules are read-only here.</p>
    <fieldset><legend class="mb-2 text-sm">{{ area === 'campaign' ? 'Contribution panel surface' : 'Page / component surface' }}</legend><div class="flex flex-wrap gap-2"><label v-for="(color, name) in PRESENTATION_COLORS" :key="name" class="flex items-center gap-2 rounded border border-gray-300 px-3 py-2 text-xs capitalize"><input v-model="draft.presentation[area].background" :name="area + '-background'" :value="name" type="radio" /><span class="h-4 w-4 border border-gray-300" :style="{ background: color }"></span>{{ name }}</label></div><p v-if="area === 'cards'" class="admin-muted mt-2 text-xs">Eligible campaign cards always keep the emerald giving tint.</p><p v-if="area === 'brand'" class="admin-muted mt-2 text-xs">White uses a light neutral reading surface; the monogram remains visible.</p></fieldset>
    <label v-for="(label, key) in PRESENTATION_FIELDS[area]" :key="key" class="admin-field">{{ label }}<textarea v-model="draft.presentation[area][key]" :rows="key === 'story' ? 8 : 2" :maxlength="key === 'story' ? 6000 : 500"></textarea></label>
    <template v-if="area === 'brand'">
      <AdminImageField v-model="draft.presentation.brand.heroImage" label="Brand story lead photograph" folder="website" @description="draft.presentation.brand.heroAlt = $event" />
      <label class="admin-field">Lead photograph description<input v-model="draft.presentation.brand.heroAlt" maxlength="240" /></label>
      <fieldset v-for="(portrait, index) in draft.presentation.brand.portraits" :key="index" class="space-y-3 border-t border-[var(--admin-line)] pt-4">
        <legend>Portrait {{ index + 1 }} · {{ portrait.name }}</legend>
        <label class="admin-field">Portrait name and selection button<input v-model="portrait.name" maxlength="80" /></label>
        <label class="admin-field">Personality introduction<input v-model="portrait.tagline" maxlength="160" /></label>
        <label class="admin-field">Portrait story<textarea v-model="portrait.text" rows="4" maxlength="2000"></textarea></label>
        <AdminImageField v-model="portrait.image" :label="portrait.name + ' portrait photograph'" folder="website" @description="portrait.alt = $event" />
        <label class="admin-field">Portrait photograph description<input v-model="portrait.alt" maxlength="240" /></label>
        <p class="admin-muted text-xs">An empty image uses the labelled illustrative portrait. Replace suggested personality copy with your real story before launch.</p>
      </fieldset>
      <fieldset v-for="(chapter, index) in draft.presentation.brand.journey" :key="index" class="space-y-3 border-t border-[var(--admin-line)] pt-4"><legend>Story chapter {{ index + 1 }}</legend><label class="admin-field">Chapter heading<input v-model="chapter.title" maxlength="160" /></label><label class="admin-field">Chapter narrative<textarea v-model="chapter.text" rows="4" maxlength="2000"></textarea></label></fieldset>
    </template>
    <RouterLink v-if="['cards','quick'].includes(area)" to="/admin/products" class="admin-link">Manage product facts & photographs in Catalog → Products</RouterLink>
    <RouterLink v-if="area === 'campaign'" to="/admin/campaigns" class="admin-link">Manage campaign story, partner & rules in Catalog → Campaigns</RouterLink>
  </div>
</template>
