<script setup>
import { PRODUCT_VARIANT_SIZES } from '../constants/adminProducts.constants'
import { formatAdminProductPrice } from '../utils/adminProducts.formatters'
import AdminProductStatusBadge from './AdminProductStatusBadge.vue'
import AdminProductVariantCell from './AdminProductVariantCell.vue'
import AdminIcon from './AdminIcon.vue'
defineProps({ products: { type: Array, required: true }, isDeleting: Boolean })
defineEmits(['delete', 'edit'])
</script>
<template>
  <p v-if="!products.length" class="admin-state">
    No products match these filters.
  </p>
  <div v-else class="admin-table-wrap">
    <table class="admin-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>6 oz</th>
          <th>18 oz</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>
            <div class="flex items-center gap-3">
              <img
                v-if="product.image"
                :src="product.image"
                alt=""
                class="h-14 w-12 shrink-0 rounded border border-[var(--admin-line)] bg-white object-contain"
              /><span
                ><button
                  type="button"
                  class="admin-link text-left"
                  @click="$emit('edit', product)"
                >
                  {{ product.name }}</button
                ><small
                  >{{ product.protein }} / {{ product.category
                  }}<span v-if="product.cut"> / {{ product.cut }}</span></small
                ><small
                  >{{ product.sellingMode || 'inventory-limited'
                  }}<span v-if="product.featured">
                    &middot; Featured</span
                  ></small
                ></span
              >
            </div>
          </td>
          <td data-label="6 oz">
            <AdminProductVariantCell
              :format-price="formatAdminProductPrice"
              :product="product"
              :size="PRODUCT_VARIANT_SIZES.SIX_OZ"
            />
          </td>
          <td data-label="18 oz">
            <AdminProductVariantCell
              :format-price="formatAdminProductPrice"
              :product="product"
              :size="PRODUCT_VARIANT_SIZES.EIGHTEEN_OZ"
            />
          </td>
          <td data-label="Status">
            <AdminProductStatusBadge :status="product.status" />
          </td>
          <td>
            <div class="flex gap-1">
              <button
                type="button"
                class="admin-icon-button"
                :aria-label="'Edit ' + product.name"
                title="Edit product"
                @click="$emit('edit', product)"
              >
                <AdminIcon name="edit" /></button
              ><button
                type="button"
                class="admin-icon-button text-red-700"
                :disabled="isDeleting"
                :aria-label="'Delete ' + product.name"
                title="Delete product"
                @click="$emit('delete', product)"
              >
                <AdminIcon name="delete" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
