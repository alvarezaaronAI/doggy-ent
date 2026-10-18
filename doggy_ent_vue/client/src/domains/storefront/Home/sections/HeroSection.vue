<script setup>
import { computed, inject } from "vue";
import { ArrowRight } from "@lucide/vue";
import StorefrontHero from "@storefront/components/StorefrontHero.vue";
import ContentLink from "@storefront/components/ContentLink.vue";
import { sectionSettings } from "@storefront-content/sectionCatalog.js";
import { BRAND_STORY } from "@storefront/constants/brandContent.js";
const props = defineProps({
  product: { type: Object, default: null },
  id: { type: String, default: "hero" },
  settings: { type: Object, default: () => sectionSettings("hero") },
});
const sections = inject("storefrontSections", null);
const primaryDestination = computed(() => {
  if (props.settings.buttonUrl) return props.settings.buttonUrl;
  if (!sections) return props.product ? "/#spotlight" : "/#shop";
  const target =
    (props.product &&
      sections.value.find(
        (block) => block.visible && block.type === "spotlight",
      )) ||
    sections.value.find(
      (block) => block.visible && block.type === "collection",
    );
  return target ? "/#" + target.id : "";
});
const tags = computed(() =>
  props.settings.tags.length
    ? props.settings.tags
    : !props.settings.text
      ? props.product?.tags || []
      : [],
);
</script>
<template>
  <StorefrontHero
    :id="id"
    :title="settings.title"
    :lead="settings.lead"
    :eyebrow="settings.eyebrow"
    :description="
      settings.text ||
      product?.shortDescription ||
      'Good treats. Good company. Simple ingredients for the everyday moments you share.'
    "
    :image="settings.image || BRAND_STORY.heroImage"
    :image-alt="settings.imageAlt"
  >
    <template #eyebrow
      ><p v-if="settings.eyebrow" class="store-hero-eyebrow">
        {{ settings.eyebrow }}
      </p>
      <div v-if="tags.length" class="mt-3 flex flex-wrap gap-2">
        <span v-for="tag in tags" :key="tag" class="store-product-tag">{{
          tag
        }}</span>
      </div></template
    >
    <ContentLink
      v-if="primaryDestination"
      :href="primaryDestination"
      class="store-button store-button-primary"
    >
      {{
        settings.buttonLabel ||
        (product ? "Shop " + product.name : "Shop all treats")
      }}
      <ArrowRight :size="18"
    /></ContentLink>
    <ContentLink
      v-if="settings.secondaryLabel"
      :href="settings.secondaryUrl"
      class="store-button home-hero-secondary"
      >{{ settings.secondaryLabel }}</ContentLink
    >
    <ContentLink
      v-if="settings.storyLabel"
      :href="settings.storyUrl"
      class="store-button home-hero-secondary"
      >{{ settings.storyLabel }} <ArrowRight :size="18"
    /></ContentLink>
    <template v-if="settings.items.length" #supporting
      ><nav class="flex flex-wrap gap-4" aria-label="Shopping essentials">
        <ContentLink
          v-for="(item, index) in settings.items"
          :key="index"
          :href="item.href"
          class="text-sm"
          >{{ item.title }}</ContentLink
        >
      </nav></template
    >
  </StorefrontHero>
</template>
