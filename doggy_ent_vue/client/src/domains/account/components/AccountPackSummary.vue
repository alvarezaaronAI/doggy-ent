<script setup>
import { onMounted } from 'vue'
import { ArrowRight, PawPrint, Plus } from '@lucide/vue'
import { useAccountPets } from '../composables/useAccountPets.js'
import AccountPetPhoto from './AccountPetPhoto.vue'
import { petBreedLabel } from '../mappers/petProfile.mapper.js'
const { activePets, loading, error, load } = useAccountPets()
onMounted(load)
</script>
<template>
  <section class="rounded-lg border border-[var(--account-line)] bg-white p-5 shadow-sm" aria-labelledby="pack-summary-title">
    <div class="account-row"><h2 id="pack-summary-title" class="flex items-center gap-2"><PawPrint :size="20" aria-hidden="true" />Your pack</h2><RouterLink to="/account/pets" class="account-link text-xs">Manage pets<ArrowRight :size="15" aria-hidden="true" /></RouterLink></div>
    <p v-if="loading" class="account-muted mt-4 text-sm" role="status">Loading your pets...</p>
    <div v-else-if="error" role="alert" class="mt-4 text-sm"><p class="account-error">Your pets could not load.</p><button type="button" class="account-link mt-2" @click="load">Try again</button></div>
    <ul v-else-if="activePets.length" class="mt-4 divide-y divide-[var(--account-line)]">
      <li v-for="pet in activePets.slice(0, 3)" :key="pet.id" class="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0">
        <div class="w-20 shrink-0 overflow-hidden rounded-md"><AccountPetPhoto :pet="pet" compact /></div>
        <div class="min-w-0"><p class="font-semibold [overflow-wrap:anywhere]">{{ pet.nickname }}</p><p class="account-muted text-xs [overflow-wrap:anywhere]">{{ petBreedLabel(pet) || 'A member of your pack' }}</p></div>
      </li>
    </ul>
    <p v-else class="account-muted mt-4 text-sm">Make a little space for the ones you shop for. A nickname is all you need.</p>
    <RouterLink v-if="!loading && !error && !activePets.length" to="/account/pets" class="account-button mt-4"><Plus :size="16" aria-hidden="true" />Add your first pet</RouterLink>
    <p v-if="activePets.length > 3" class="account-muted mt-4 text-xs">And {{ activePets.length - 3 }} more in your pack.</p>
  </section>
</template>
