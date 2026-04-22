const { buildDemoOrderPreview } = require('../services/demo.service');

function calculateDemoOrder(req, res) {
  const { productName, price, quantity } = req.body;

  if (!productName || !productName.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Product name is required.',
    });
  }

  const numericPrice = Number(price);
  const numericQuantity = Number(quantity);

  if (Number.isNaN(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Price must be a valid number greater than 0.',
    });
  }

  if (Number.isNaN(numericQuantity) || numericQuantity <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a valid number greater than 0.',
    });
  }

  const preview = buildDemoOrderPreview({
    productName: productName.trim(),
    price: numericPrice,
    quantity: numericQuantity,
  });

  return res.json({
    success: true,
    preview,
  });
}

module.exports = {
  calculateDemoOrder,
};