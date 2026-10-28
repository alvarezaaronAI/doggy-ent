<script setup>
import { computed, useId } from 'vue'
import { Mail, Pencil, Plus, ArrowRight } from '@lucide/vue'
import { useCheckoutAddressReview } from '../composables/useCheckoutAddressReview.js'
import { US_SHIPPING_STATES, isUSShippingDestination } from '../constants/shippingDestinations.js'

const props = defineProps({
  customer: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['address-reviewed'])
const id = useId()
const { reviewing, addressReview, streetField, hasApartment, complete, recipient, locality, countryName, reviewAddress, editAddress, expandApartment } = useCheckoutAddressReview(() => props.customer)
const country = computed({
  get: () => props.customer.country === 'United States' ? 'US' : props.customer.country,
  set: value => { props.customer.country = value },
})
const unsupportedDestination = computed(() => country.value !== 'US'
  || Boolean(props.customer.state && !isUSShippingDestination(props.customer)))
async function confirmAddress() {
  if (!complete.value) return
  await reviewAddress()
  emit('address-reviewed')
}
</script>

<template>
  <div class="shipping-address border p-5">
    <header class="flex items-start gap-3">
      <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf6f0] font-semibold text-[#17634c]">2</span>
      <div class="min-w-0 flex-1"><h3 class="text-lg font-semibold">Shipping address</h3><p class="mt-1 text-sm text-stone-600">Where should we send your treats?</p></div>
      <Mail :size="22" class="mt-1 shrink-0 text-stone-400" aria-hidden="true" />
    </header>

    <div v-if="reviewing && complete" ref="addressReview" tabindex="-1" aria-label="Delivery address review" class="mt-5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#315bc5]">
      <div class="flex items-start justify-between gap-4 border-t border-stone-200 pt-5">
        <div class="min-w-0"><p class="mb-3 text-xs font-medium text-stone-500">Deliver to</p><address class="break-words text-sm not-italic leading-7"><strong class="font-semibold text-stone-900">{{ recipient }}</strong><br>{{ customer.address1 }}<br><template v-if="customer.address2">{{ customer.address2 }}<br></template>{{ locality }}<br>{{ countryName }}</address></div>
        <button type="button" class="shipping-edit inline-flex shrink-0 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium" @click="editAddress"><Pencil :size="14" />Edit</button>
      </div>
      <p class="mt-5 border-t border-stone-200 pt-4 text-xs text-stone-500">Please check the recipient, street and postal code before paying.</p>
    </div>

    <div v-else class="shipping-fields mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
      <label class="shipping-field col-span-2" :for="id + '-country'">Country / region<select :id="id + '-country'" v-model="country" autocomplete="shipping country" :aria-describedby="id + '-destinations'" required><option value="US">United States</option></select></label>
      <p :id="id + '-destinations'" class="col-span-2 text-xs text-stone-600">Shipping is available to the 50 US states and District of Columbia only.<span v-if="unsupportedDestination" class="block font-medium text-red-700" role="status">Choose United States and a supported state for this checkout. Your saved address is unchanged.</span></p>
      <label class="shipping-field" :for="id + '-first'">First name<input :id="id + '-first'" v-model="customer.firstName" autocomplete="shipping given-name" required></label>
      <label class="shipping-field" :for="id + '-last'">Last name<input :id="id + '-last'" v-model="customer.lastName" autocomplete="shipping family-name" required></label>
      <label class="shipping-field col-span-2" :for="id + '-street'">Street address<input :id="id + '-street'" ref="streetField" v-model="customer.address1" autocomplete="shipping address-line1" placeholder="Street and house number" required></label>
      <label v-if="hasApartment" class="shipping-field col-span-2" :for="id + '-apartment'">Apartment, suite or unit <span class="text-xs text-stone-500">Optional</span><input :id="id + '-apartment'" v-model="customer.address2" autocomplete="shipping address-line2"></label>
      <button v-else type="button" class="col-span-2 inline-flex min-h-11 items-center gap-2 justify-self-start rounded-md border border-stone-200 bg-stone-50 px-3 text-sm text-stone-700" :aria-expanded="hasApartment" @click="expandApartment"><Plus :size="15" />Add apartment, suite or unit</button>
      <label class="shipping-field col-span-2" :for="id + '-city'">City<input :id="id + '-city'" v-model="customer.city" autocomplete="shipping address-level2" required></label>
      <label class="shipping-field" :for="id + '-state'">State<select :id="id + '-state'" v-model="customer.state" autocomplete="shipping address-level1" required><option value="">Select state</option><option v-for="state in US_SHIPPING_STATES" :key="state.code" :value="state.code">{{ state.name }}</option></select></label>
      <label class="shipping-field" :for="id + '-postal'">ZIP code<input :id="id + '-postal'" v-model="customer.zip" autocomplete="shipping postal-code" required></label>
      <div class="col-span-2 border-t border-stone-200 pt-4"><button type="button" class="inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-4 text-sm font-semibold text-stone-800 disabled:cursor-not-allowed disabled:opacity-50" :disabled="!complete" @click="confirmAddress">Use this address <ArrowRight :size="16" /></button><p class="mt-2 text-xs text-stone-500">{{ complete ? 'Review your delivery address before paying.' : 'Complete the fields above to review your address.' }}</p></div>
    </div>
  </div>
</template>

<style scoped>
.shipping-address { container-type: inline-size; background: white; border-color: #ddd9d2; border-radius: 8px; box-shadow: 0 8px 24px #24352d0a; }
.shipping-field { display: flex; min-width: 0; flex-wrap: wrap; align-items: baseline; gap: 6px; font-size: 13px; font-weight: 500; color: #57534e; }
.shipping-field input, .shipping-field select { width: 100%; min-height: 46px; border: 1px solid #d2d7d3; border-radius: 6px; background: white; padding: 10px 12px; font-size: 14px; color: #292524; font-weight: 400; }
.shipping-address :is(button,input,select):focus-visible { outline: 2px solid #315bc5; outline-offset: 2px; }
.shipping-edit { min-height: 44px; }
@container (max-width: 320px) { .shipping-fields { column-gap: 10px; } }
</style>
