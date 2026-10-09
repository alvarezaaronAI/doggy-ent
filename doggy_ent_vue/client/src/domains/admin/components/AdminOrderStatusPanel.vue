<script setup>
import { computed, ref, watch } from 'vue'
import { ORDER_STATUSES } from '../constants/adminOrders.constants'
import { formatAdminOrderDate } from '../utils/adminOrders.utils'
const props = defineProps({
  order: { type: Object, required: true },
  statusClass: { type: Function, required: true },
  saving: Boolean,
})
const emit = defineEmits(['save'])
const selectedStatus = ref(props.order.status)
const statusNote = ref('')
const hasChanges = computed(() => selectedStatus.value !== props.order.status)
const history = computed(() =>
  Array.isArray(props.order.statusHistory) ? props.order.statusHistory : [],
)
const lastChange = computed(
  () => props.order.lastStatusChange || history.value[0],
)
function cancel() {
  selectedStatus.value = props.order.status
  statusNote.value = ''
}
watch(() => props.order.status, cancel)
function save() {
  if (hasChanges.value && !props.saving)
    emit('save', {
      status: selectedStatus.value,
      note: statusNote.value.trim(),
    })
}
</script>
<template>
  <section class="admin-form-section">
    <h2>Status &amp; history</h2>
    <div class="admin-form-grid mt-5">
      <div>
        <p class="admin-muted">Current status</p>
        <span class="admin-badge mt-2" :class="statusClass(order.status)">{{
          order.status
        }}</span>
        <p class="admin-muted mt-3">
          Updated {{ formatAdminOrderDate(order.updatedAt) }}
        </p>
        <p v-if="lastChange" class="admin-muted text-xs mt-1">
          Last change: {{ lastChange.fromStatus || 'Created' }} to
          {{ lastChange.toStatus }}
        </p>
      </div>
      <div>
        <label class="admin-field"
          >Select next status<select
            aria-label="Select next status"
            v-model="selectedStatus"
            :disabled="saving"
          >
            <option
              v-for="status in Object.values(ORDER_STATUSES)"
              :key="status"
              :value="status"
            >
              {{ status }}
            </option>
          </select></label
        >
        <label class="admin-field mt-4"
          >Status note<textarea
            v-model="statusNote"
            :disabled="saving"
            rows="2"
            placeholder="Optional fulfillment note"
          ></textarea>
        </label>
        <div class="flex gap-2 mt-4">
          <button
            class="admin-button admin-primary"
            :disabled="saving || !hasChanges"
            @click="save"
          >
            {{ saving ? 'Saving...' : 'Save status' }}</button
          ><button
            class="admin-button"
            :disabled="saving || (!hasChanges && !statusNote)"
            @click="cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
    <details class="mt-6" open>
      <summary class="font-medium cursor-pointer">
        Status history ({{ history.length }})
      </summary>
      <ol v-if="history.length" class="admin-timeline mt-4">
        <li v-for="entry in history" :key="entry.id">
          <p class="font-medium">
            {{ entry.fromStatus || 'Created' }} to {{ entry.toStatus }}
          </p>
          <p class="admin-muted text-xs">
            {{ formatAdminOrderDate(entry.createdAt) }} ·
            {{ entry.changedByType
            }}<span v-if="entry.changedBy"> · {{ entry.changedBy }}</span>
          </p>
          <p v-if="entry.note" class="mt-2">{{ entry.note }}</p>
        </li>
      </ol>
      <p v-else class="admin-muted mt-3">No status changes recorded.</p>
    </details>
  </section>
</template>
