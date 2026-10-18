<script setup>
import { computed } from 'vue'
import { Plus, ArrowUp, ArrowDown, Trash2, Save } from '@lucide/vue'
import AdminImageField from './AdminImageField.vue'
import ProductQuickViewGallery from '@products/ProductQuickView/ProductQuickViewGallery.vue'
import { useAdminProductImages } from '../composables/useAdminProductImages.js'
const props = defineProps({ product: { type: Object, required: true } })
const emit = defineEmits(['saved', 'close'])
const { draft, dirty, busy, error, save, cancel, move } = useAdminProductImages(props.product, emit)
const preview = computed(() => ({ ...props.product, ...draft.value }))
</script>
<template>
  <section class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3 border-y border-[var(--admin-line)] py-4"><div><h2>{{ product.name }} · photographs</h2><p class="admin-muted mt-1 text-xs">Product-owned images only. Prices, variants, SKUs and inventory are unchanged.</p></div><div class="flex gap-2"><button type="button" class="admin-button" :disabled="busy" @click="cancel">Cancel</button><button type="button" class="admin-button admin-primary" :disabled="busy || !dirty" @click="save"><Save :size="16" />{{ busy ? 'Saving...' : 'Save images' }}</button></div></div>
    <p v-if="error" class="admin-alert admin-alert-error" role="alert">{{ error }}</p>
    <div class="product-images-workspace">
      <div class="min-w-0"><ProductQuickViewGallery :product="preview" /></div>
      <fieldset :disabled="busy" class="min-w-0 space-y-5">
        <AdminImageField v-model="draft.image" label="Main photograph · catalog card and first pop-out image" folder="products" />
        <div v-for="(item, index) in draft.galleryImages" :key="index" class="border-t border-[var(--admin-line)] pt-5 space-y-3">
          <AdminImageField v-model="item.image" :label="'Detail photograph ' + (index + 1)" folder="products" @description="item.alt = $event" />
          <label class="admin-field">What does this photograph show?<input v-model="item.alt" maxlength="240" placeholder="Describe the product, angle or context" /></label>
          <div class="flex gap-2"><button type="button" class="admin-button" title="Move image earlier" aria-label="Move image earlier" :disabled="index === 0" @click="move(index, -1)"><ArrowUp :size="16" /></button><button type="button" class="admin-button" title="Move image later" aria-label="Move image later" :disabled="index === draft.galleryImages.length - 1" @click="move(index, 1)"><ArrowDown :size="16" /></button><button type="button" class="admin-button" title="Remove detail image" aria-label="Remove detail image" @click="draft.galleryImages.splice(index, 1)"><Trash2 :size="16" /></button></div>
        </div>
        <button type="button" class="admin-button" :disabled="draft.galleryImages.length >= 4" @click="draft.galleryImages.push({ image: '', alt: '' })"><Plus :size="16" />Add detail photograph ({{ draft.galleryImages.length }}/4)</button>
      </fieldset>
    </div>
  </section>
</template>
<style scoped>.product-images-workspace { display: grid; grid-template-columns: minmax(0,1fr) minmax(280px,400px); gap: 24px; align-items: start; } @media(max-width:850px) { .product-images-workspace { grid-template-columns: minmax(0,1fr); } }</style>
