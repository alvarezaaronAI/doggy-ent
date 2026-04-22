function roundCurrency(value) {
  return Number(value.toFixed(2));
}

function buildDemoOrderPreview({ productName, price, quantity }) {
  const subtotal = roundCurrency(price * quantity);
  const shipping = subtotal >= 50 ? 0 : 6.99;
  const tax = roundCurrency(subtotal * 0.08);
  const total = roundCurrency(subtotal + shipping + tax);

  return {
    productName,
    unitPrice: price,
    quantity,
    subtotal,
    shipping,
    tax,
    total,
    message: `Backend calculated a preview for ${quantity} ${productName}(s).`,
  };
}

module.exports = {
  buildDemoOrderPreview,
};