<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminHeader from './AdminHeader.vue'
import AdminSidebar from './AdminSidebar.vue'
import AdminDataTargetBadge from './AdminDataTargetBadge.vue'
import { fetchAdminSession, logoutAdmin } from '../api/adminSession.api.js'
import '../../../assets/styles/admin.css'
const router = useRouter()
const admin = ref(null)
const signingOut = ref(false)
const error = ref('')
onMounted(async () => {
  try {
    const session = await fetchAdminSession()
    admin.value = session.admin
  } catch (e) {
    error.value = e.message
  }
})
async function logout() {
  signingOut.value = true
  error.value = ''
  try {
    await logoutAdmin()
    admin.value = null
    await router.push('/admin/login')
  } catch (e) {
    error.value = e.message || 'Unable to sign out. Please try again.'
  } finally {
    signingOut.value = false
  }
}
</script>
<template>
  <div class="admin-workspace">
    <a class="admin-skip-link" href="#admin-content">Skip to content</a>
    <AdminHeader :admin="admin" :signing-out="signingOut" @logout="logout" />
    <div class="admin-context">
      <details>
        <summary
          class="flex cursor-pointer flex-wrap items-center gap-3 text-xs"
        >
          <span>Data routing</span><AdminDataTargetBadge />
        </summary>
        <p class="admin-muted mt-3">
          Data target is set when the server starts. Temporary admin modes use
          local admin &rarr; local server &rarr; selected database.
        </p>
      </details>
      <p class="admin-muted break-all">
        Signed in as
        <strong class="font-medium text-[var(--admin-text)]">{{
          admin?.email || 'Checking session...'
        }}</strong>
      </p>
    </div>
    <p
      v-if="error"
      role="alert"
      class="admin-alert admin-alert-error mx-5 mt-4"
    >
      {{ error }}
    </p>
    <div class="admin-body">
      <AdminSidebar />
      <main id="admin-content" class="admin-content" tabindex="-1">
        <RouterView :key="$route.path" />
      </main>
    </div>
    <footer
      class="border-t border-[var(--admin-line)] bg-white px-6 py-4 text-xs text-[var(--admin-muted)]"
    >
      Chase &amp; Evie Co. &middot; Admin
    </footer>
  </div>
</template>
