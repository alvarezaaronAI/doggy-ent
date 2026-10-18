<script setup>
import { ScanLine, PackageCheck, ClipboardCheck, MessageCircle, ArrowUpRight } from "@lucide/vue";
import { sectionSettings } from "@storefront-content/sectionCatalog.js";
import ContentLink from "@storefront/components/ContentLink.vue";
defineProps({
  product: Object,
  id: { type: String, default: "ingredients" },
  settings: { type: Object, default: () => sectionSettings("ingredients") },
});
defineEmits(["quick-view"]);
</script>
<template>
  <section :id="id" class="store-section home-ingredients-section">
    <div class="store-inner home-ingredients-layout">
      <header class="story-heading home-boutique-heading">
        <p v-if="settings.eyebrow" class="store-eyebrow">{{ settings.eyebrow }}</p>
        <h2>{{ settings.title }}</h2>
        <p>{{ settings.text }}</p>
        <button v-if="product" type="button" class="home-boutique-link" @click="$emit('quick-view')">Explore product details <ArrowUpRight :size="17" aria-hidden="true" /></button>
        <ContentLink v-else :href="settings.buttonUrl" class="home-boutique-link">{{ settings.buttonLabel }} <ArrowUpRight :size="17" aria-hidden="true" /></ContentLink>
      </header>
      <div>
        <div class="home-ingredient-points">
          <article class="home-ingredient-point"><ScanLine :size="21" aria-hidden="true" /><div><h3>Ingredients, clearly listed.</h3><p>{{ product?.ingredients || 'Ingredients and analysis stay with each real product, not in a blanket storefront claim.' }}</p></div></article>
          <article class="home-ingredient-point"><PackageCheck :size="21" aria-hidden="true" /><div><h3>The right size for you.</h3><p>Compare bag sizes, prices and availability before you add.</p></div></article>
          <article class="home-ingredient-point"><ClipboardCheck :size="21" aria-hidden="true" /><div><h3>A little care goes a long way.</h3><p>{{ product?.storageFeeding || 'Storage, feeding guidance and freshness information can be reviewed before choosing a treat.' }}</p></div></article>
          <article class="home-ingredient-point"><MessageCircle :size="21" aria-hidden="true" /><div><h3>A little help when needed.</h3><ContentLink href="/account/help" class="home-boutique-link">Shopping help <ArrowUpRight :size="15" aria-hidden="true" /></ContentLink></div></article>
        </div>
        <p v-if="product?.isTestProduct" class="home-ingredient-disclaimer">Sample presentation; replace with approved product information.</p>
      </div>
    </div>
  </section>
</template>
