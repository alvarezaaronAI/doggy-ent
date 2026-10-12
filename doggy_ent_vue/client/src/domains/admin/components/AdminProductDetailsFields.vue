<script setup>
import AdminImageField from './AdminImageField.vue'
defineProps({ form: { type: Object, required: true }, categoryOptions: Array, proteinOptions: Array })
</script>
<template>
<section class="admin-form-section">
          <h2>Product details</h2>
          <div class="admin-form-grid">
            <label class="admin-field sm:col-span-2"
              >Product name *<input v-model="form.name"
            /></label>
            <label class="admin-field sm:col-span-2"
              >Short description *<textarea
                v-model="form.shortDescription"
                rows="3"
              ></textarea>
            </label>
            <label class="admin-field"
              >Category<select aria-label="Category" v-model="form.category">
                <option v-for="item in categoryOptions" :key="item">
                  {{ item }}
                </option>
              </select></label
            >
            <label class="admin-field"
              >Protein<select aria-label="Protein" v-model="form.protein">
                <option value="">Select protein</option>
                <option v-for="item in proteinOptions" :key="item">
                  {{ item }}
                </option>
              </select></label
            >
            <label class="admin-field sm:col-span-2"
              >Cut<input v-model="form.cut"
            /></label>
            <AdminImageField v-model="form.image" class="sm:col-span-2" label="Product card photo *" folder="products" help="Used on product cards, Quick View, the cart, and order item snapshots. Product Save makes this change live." />
          </div>
        </section>
</template>
