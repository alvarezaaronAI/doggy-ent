<script setup>
import { Plus, Trash2 } from '@lucide/vue'
import AdminImageField from './AdminImageField.vue'
defineProps({ items: { type: Array, required: true }, type: String })
</script>
<template>
  <section class="space-y-4">
    <h3>{{ type === 'gallery' ? 'Gallery images' : 'Section items' }}</h3>
    <div v-for="(item, index) in items" :key="index" class="space-y-3 border-b border-[var(--admin-line)] pb-4">
      <label v-if="type !== 'gallery'" class="admin-field">{{ type === 'help' ? 'Question' : type === 'process' ? 'Care step heading' : 'Supporting link wording' }} {{ index + 1 }}<input v-model="item.title" maxlength="160" /></label>
      <label v-if="!['promise', 'hero'].includes(type)" class="admin-field">{{ type === 'gallery' ? 'Caption beneath this photo' : type === 'help' ? 'Answer shown when opened' : 'How this care step works' }}<textarea v-model="item.text" rows="3" maxlength="2000"></textarea></label>
      <template v-if="type === 'gallery'">
        <AdminImageField v-model="item.image" :label="'Gallery photo ' + (index + 1)" folder="website" @description="item.alt = $event" />
        <label class="admin-field">Photo description for accessibility<input v-model="item.alt" maxlength="240" /></label>
      </template>
      <label v-if="['promise', 'hero'].includes(type)" class="admin-field">Supporting link destination<input v-model="item.href" placeholder="/#ingredients" /></label>
      <button type="button" class="admin-button" :aria-label="'Remove item ' + (index + 1)" @click="items.splice(index, 1)"><Trash2 :size="16" />Remove item</button>
    </div>
    <button type="button" class="admin-button" :disabled="items.length >= 12" @click="items.push(type === 'gallery' ? { title: '', text: '', image: '', alt: '' } : ['promise', 'hero'].includes(type) ? { title: '', text: '', href: '/#shop' } : { title: '', text: '' })"><Plus :size="16" />Add {{ type === 'gallery' ? 'image' : 'item' }}</button>
  </section>
</template>
