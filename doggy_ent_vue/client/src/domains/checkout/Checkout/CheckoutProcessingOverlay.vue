

<template>
  <div class="fixed inset-0 z-[120] flex items-center justify-center bg-white/78 backdrop-blur-md">
    <div class="mx-4 flex w-full max-w-md flex-col items-center rounded-[2rem] border border-stone-200 bg-white px-8 py-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
      <div class="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-600 shadow-inner">
        <i class="fa-solid fa-spinner animate-spin"></i>
      </div>

      <p class="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-500">
        Secure Checkout
      </p>

      <h2 class="mt-3 text-3xl font-black tracking-tight text-[var(--brand-4)]">
        Processing Payment
      </h2>

      <p class="mt-4 text-sm leading-relaxed text-stone-500">
        Please wait while we securely confirm your payment. Do not refresh or close this window.
      </p>

      <div class="mt-6 h-2 w-full overflow-hidden rounded-full bg-stone-100">
        <div class="h-full w-1/2 animate-pulse rounded-full bg-emerald-400"></div>
      </div>
    </div>
  </div>
</template>