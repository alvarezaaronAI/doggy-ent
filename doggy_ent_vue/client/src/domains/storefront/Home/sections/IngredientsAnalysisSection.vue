<script setup>
import { sectionSettings } from '@storefront-content/sectionCatalog.js'
import ContentLink from '@storefront/components/ContentLink.vue'
defineProps({ product: Object, id: { type: String, default: 'ingredients' }, settings: { type: Object, default: () => sectionSettings('ingredients') } })
</script>
<template>
  <section :id="id" class="store-section bg-[#f8faf8]">
    <div class="store-inner grid gap-8 md:grid-cols-2">
      <div>
        <p class="store-eyebrow">{{ settings.eyebrow }}</p>
        <h2 class="mt-3 text-3xl font-bold">{{ settings.title }}</h2>
        <p class="store-muted mt-4 leading-relaxed">
          {{ settings.text }}
        </p>
      </div>
      <div class="border-l-4 border-[var(--brand-2)] pl-6">
        <h3 class="font-bold">{{ product?.name || 'Our treats' }}</h3>
        <p class="mt-3 text-lg">
          {{
            product?.ingredients ||
            'Ingredient details are listed with each product.'
          }}
        </p>
        <p
          v-if="product?.storageFeeding"
          class="store-muted mt-4 whitespace-pre-line text-sm leading-relaxed"
        >
          {{ product.storageFeeding }}
        </p>
        <ContentLink :href="settings.buttonUrl" class="store-button mt-5">{{ settings.buttonLabel }}</ContentLink>
      </div>
    </div>
  </section>
</template>
