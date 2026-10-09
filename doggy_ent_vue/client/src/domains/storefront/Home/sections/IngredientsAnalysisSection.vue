<script setup>
defineProps({ product: Object })
</script>
<template>
  <section id="ingredients" class="store-section bg-[#f8faf8]">
    <div class="store-inner grid gap-8 md:grid-cols-2">
      <div>
        <p class="store-eyebrow">Know what goes in</p>
        <h2 class="mt-3 text-3xl font-bold">Our ingredient promise.</h2>
        <p class="store-muted mt-4 leading-relaxed">
          Clear ingredients, thoughtful preparation. Check each treat's details
          to find the right fit for your pup.
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
        <a href="#shop" class="store-button mt-5">Explore the collection</a>
      </div>
    </div>
  </section>
</template>
