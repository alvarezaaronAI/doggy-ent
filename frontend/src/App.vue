<script setup>
import { ref } from 'vue';

const productName = ref('Dog Treat');
const price = ref(12.99);
const quantity = ref(2);

const result = ref(null);
const errorMessage = ref('');
const isLoading = ref(false);

async function runOrderPreview() {
  errorMessage.value = '';
  result.value = null;
  isLoading.value = true;

  try {
    const response = await fetch('http://localhost:3000/api/demo/order-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: productName.value,
        price: Number(price.value),
        quantity: Number(quantity.value),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    result.value = data.preview;
  } catch (err) {
    errorMessage.value = err.message;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <main class="container">
    <h1>Backend Data Flow Demo</h1>

    <div class="card">
      <h2>Frontend Input</h2>

      <label>
        Product Name
        <input v-model="productName" />
      </label>

      <label>
        Price
        <input type="number" v-model="price" />
      </label>

      <label>
        Quantity
        <input type="number" v-model="quantity" />
      </label>

      <button @click="runOrderPreview" :disabled="isLoading">
        {{ isLoading ? 'Sending...' : 'Send to Backend' }}
      </button>
    </div>

    <div class="card">
      <h2>Data Flow</h2>
      <p>Vue → fetch → Express → Controller → Service → Response → Vue</p>
    </div>

    <div class="card" v-if="result">
      <h2>Backend Response</h2>

      <p>Subtotal: ${{ result.subtotal }}</p>
      <p>Shipping: ${{ result.shipping }}</p>
      <p>Tax: ${{ result.tax }}</p>
      <p><strong>Total: ${{ result.total }}</strong></p>
    </div>

    <div v-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 40px auto;
  font-family: Arial;
}

.card {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid #ddd;
}

input {
  display: block;
  margin: 10px 0;
  padding: 8px;
  width: 100%;
}

button {
  padding: 10px 16px;
  background: black;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.error {
  color: red;
  font-weight: bold;
}
</style>