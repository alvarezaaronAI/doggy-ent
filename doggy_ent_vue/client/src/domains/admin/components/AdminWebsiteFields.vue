<script setup>
import { computed } from 'vue'
import { SECTION_CATALOG } from '@storefront-content/sectionCatalog.js'
import { WEBSITE_FIELD_LABELS, WEBSITE_BACKGROUNDS, websiteFieldLabel, websiteFieldHelp } from '../constants/adminWebsite.constants.js'
import AdminWebsiteLinks from './AdminWebsiteLinks.vue'
import AdminWebsiteItems from './AdminWebsiteItems.vue'
import AdminImageField from './AdminImageField.vue'
import { isCollectionProduct } from '@products/utils/productVisibility.js'
const props = defineProps({ draft: { type: Object, required: true }, selected: String, block: Object, products: { type: Array, default: () => [] } })
const fields = computed(() => props.block ? Object.keys(SECTION_CATALOG[props.block.type].defaults).filter(key => WEBSITE_FIELD_LABELS[key]) : [])
</script>
<template>
  <div class="space-y-5">
    <template v-if="selected === 'announcement'">
      <h2>Announcement bar</h2>
      <label class="flex items-center gap-2"><input v-model="draft.announcement.visible" type="checkbox" />Show announcement</label>
      <label class="flex items-center gap-2"><input v-model="draft.announcement.rotate" type="checkbox" />Fade between messages automatically</label>
      <fieldset v-for="(message, index) in draft.announcement.messages" :key="index" class="space-y-3 border-t border-[var(--admin-line)] pt-3"><legend>Message {{ index + 1 }}</legend><label class="admin-field">Message above navigation<textarea v-model="message.text" rows="3" maxlength="300"></textarea></label><label class="admin-field">Optional destination<input v-model="message.href" placeholder="/#shop or https://..." /></label><button v-if="draft.announcement.messages.length > 1" type="button" class="admin-button" @click="draft.announcement.messages.splice(index, 1)">Remove message</button></fieldset>
      <button type="button" class="admin-button" :disabled="draft.announcement.messages.length >= 3" @click="draft.announcement.messages.push({ text: 'A little something new.', href: '' })">Add message ({{ draft.announcement.messages.length }}/3)</button>
    </template>
    <template v-else-if="selected === 'header'">
      <h2>Header &amp; navigation</h2>
      <label class="admin-field">Brand name<input v-model="draft.header.brandName" maxlength="80" /></label>
      <label class="admin-field">Search placeholder<input v-model="draft.header.searchPlaceholder" maxlength="100" /></label>
      <AdminWebsiteLinks :links="draft.header.links" />
    </template>
    <template v-else-if="selected === 'footer'">
      <h2>Footer</h2>
      <label class="flex items-center gap-2"><input v-model="draft.footer.visible" type="checkbox" />Show footer</label>
      <label class="admin-field">Brand name<input v-model="draft.footer.brandName" maxlength="80" /></label>
      <label class="admin-field">Brand introduction beneath the footer logo<textarea v-model="draft.footer.text" rows="3" maxlength="500"></textarea></label>
      <label class="admin-field">Closing message beneath copyright<textarea v-model="draft.footer.tagline" rows="3" maxlength="500"></textarea></label>
      <label class="admin-field">Background<select v-model="draft.footer.background"><option v-for="background in WEBSITE_BACKGROUNDS.filter(b => b.value !== 'default')" :key="background.value" :value="background.value">{{ background.label }}</option></select></label>
      <AdminImageField v-model="draft.footer.backgroundImage" label="Footer background artwork" folder="website" help="Decorative image behind the footer. A reading tint keeps links legible." />
      <AdminWebsiteLinks :links="draft.footer.links" />
      <label v-for="platform in ['instagram', 'tiktok', 'youtube']" :key="platform" class="admin-field capitalize">{{ platform }} profile URL<input v-model="draft.footer.social[platform]" type="url" placeholder="https://..." /></label>
    </template>
    <template v-else-if="selected === 'theme'">
      <h2>Seasonal appearance</h2>
      <label class="flex items-center gap-2"><input v-model="draft.theme.monogram" type="checkbox" />Subtle Labrador monogram</label>
      <label class="admin-field">Maximum collection columns<select v-model="draft.theme.columns"><option value="4">Up to four columns</option><option value="3">Up to three columns</option></select></label>
      <p class="admin-muted text-xs">Fewer columns appear when needed to keep each product card comfortable to read.</p>
      <label class="admin-field">Season<select v-model="draft.theme.season"><option value="original">Everyday</option><option value="autumn">Autumn</option><option value="winter">Winter</option></select></label>
      <AdminImageField v-model="draft.theme.backgroundImage" label="Homepage seasonal background artwork" folder="website" help="Repeats behind homepage reading sections. Explicit section backgrounds take priority; the hero keeps its own photo. Clear to restore the original background." />
    </template>
    <template v-else-if="block">
      <h2>{{ SECTION_CATALOG[block.type].label }}</h2>
      <label class="flex items-center gap-2"><input v-model="block.visible" type="checkbox" />Visible on homepage</label>
      <p class="admin-muted text-xs">Section link: /#{{ block.id }}</p>
      <div v-for="key in fields" :key="key">
        <AdminImageField v-if="key === 'image'" v-model="block.settings[key]" :label="websiteFieldLabel(block.type, key)" :help="websiteFieldHelp(block.type, key)" folder="website" @description="block.settings.imageAlt = $event" />
        <template v-else>
          <label class="admin-field">{{ websiteFieldLabel(block.type, key) }}
            <textarea v-if="['text', 'caption'].includes(key)" v-model="block.settings[key]" rows="4" :maxlength="key === 'text' ? 6000 : 300"></textarea>
            <input v-else v-model="block.settings[key]" :maxlength="key.endsWith('Url') ? 1200 : key === 'imageAlt' ? 240 : 300" :placeholder="key.endsWith('Url') ? '/#shop or https://...' : ''" />
          </label>
          <p v-if="websiteFieldHelp(block.type, key)" class="admin-muted mt-2 text-xs">{{ websiteFieldHelp(block.type, key) }}</p>
        </template>
      </div>
      <p v-if="block.type === 'hero'" class="admin-muted text-xs">Empty body text and primary button use the featured product. Empty image uses the existing brand template.</p>
      <label v-if="block.type === 'hero'" class="admin-field">Badges · comma separated<input :value="block.settings.tags.join(', ')" placeholder="Empty uses product badges" @input="block.settings.tags = $event.target.value.split(',').map(tag => tag.trim()).filter(Boolean)" /></label>
      <label v-if="block.type === 'spotlight'" class="admin-field">Featured treat<select v-model="block.settings.productId"><option value="">Use catalog featured product</option><option v-for="product in products.filter(p => p.status === 'active')" :key="product.id" :value="product.id">{{ product.name }}</option></select></label>
      <fieldset v-if="block.type === 'collection'" class="space-y-3">
        <legend class="font-medium">{{ block.id === 'shop' ? 'Featured product order' : 'Collection products' }}</legend>
        <p class="admin-muted text-xs">{{ block.id === 'shop' ? 'All published catalog products appear here. Selected products appear first with Featured sorting; newly published products follow. Draft and archived products stay hidden.' : 'Only selected products appear. Leave the selection empty to show all published catalog products.' }}</p>
        <label v-for="product in products.filter(isCollectionProduct)" :key="product.id" class="flex items-start gap-2"><input v-model="block.settings.productIds" :value="product.id" type="checkbox" />{{ product.name }}</label>
      </fieldset>
      <AdminWebsiteItems v-if="Array.isArray(block.settings.items)" :items="block.settings.items" :type="block.type" />
      <label v-if="block.type === 'gallery'" class="flex items-start gap-2"><input v-model="block.settings.sampleReviews" type="checkbox" />Show seven explicitly fictional review examples (testing only)</label>
      <fieldset v-if="block.type !== 'hero'">
        <legend class="mb-2 font-medium">Section background</legend>
        <div class="flex flex-wrap gap-2">
          <label v-for="background in WEBSITE_BACKGROUNDS" :key="background.value" class="flex min-h-10 items-center gap-2 rounded border border-[var(--admin-line)] px-2 text-xs"><input v-model="block.settings.background" :value="background.value" type="radio" :name="'background-' + block.id" /><span class="h-4 w-4 rounded-sm border border-gray-300" :style="{ background: background.color }"></span>{{ background.label }}</label>
        </div>
      </fieldset>
      <AdminImageField v-if="block.type !== 'hero'" v-model="block.settings.backgroundImage" label="This section's background artwork" folder="website" help="Replaces seasonal artwork behind this section only. Save Draft keeps the public page unchanged." />
      <p v-else class="admin-muted text-xs">The hero photograph covers this section. Use Hero background photo above to change it.</p>
      <p v-if="['ingredients', 'spotlight', 'collection', 'drops'].includes(block.type)" class="admin-muted text-xs">Prices, sizes, availability, and ingredient details come from Products.</p>
    </template>
  </div>
</template>
