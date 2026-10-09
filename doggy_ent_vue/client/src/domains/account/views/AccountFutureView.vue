<template>
  <header class="account-heading">
    <h1>{{ kind === 'Rewards' ? 'Good things ahead' : 'Your future favorites' }}</h1>
    <p>
      {{
        kind === 'Rewards'
          ? 'A little more to look forward to.'
          : 'A place to keep the treats you love.'
      }}
    </p>
  </header>
  <section class="account-section">
    <i
      class="fa-solid mb-5 text-3xl text-[var(--account-green)]"
      :class="kind === 'Rewards' ? 'fa-gift' : 'fa-heart'"
      aria-hidden="true"
    ></i>
    <h2>{{ kind }}</h2>
    <p class="account-muted mt-3 max-w-xl">
      Coming in future phase:
      {{
        kind === 'Rewards'
          ? 'earn rewards, see your points history, and share treats with friends through referrals.'
          : 'save favorite treats and return to them when you are ready to shop.'
      }}
    </p>
    <RouterLink to="/#shop" class="account-button mt-6"
      >Explore treats<i class="fa-solid fa-arrow-right" aria-hidden="true"></i
    ></RouterLink>
  </section>
</template>
<script setup>
defineProps({ kind: { type: String, required: true } })
</script>
