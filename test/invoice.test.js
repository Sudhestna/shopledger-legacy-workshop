var test = require('node:test');
var assert = require('node:assert/strict');

var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

test('invoice resolves GST from the line HSN slab', function () {
  var items = [{ id: 1, name: 'Rice', hsn: '1006', price: 100, qty: 1 }];
  var order = { id: 1, items: items, subtotal: 100, discount: 0, tax: 5, total: 105 };

  var ledgerFigures = pricing.computeTotals(items, '');
  var invoiceFigures = invoice.computeInvoiceFigures(order);

  assert.equal(ledgerFigures.tax, 5);
  assert.equal(ledgerFigures.total, 105);
  assert.equal(invoiceFigures.rows[0].gstPercent, 5);
  assert.equal(invoiceFigures.tax, 5);
  assert.equal(invoiceFigures.total, 105);
});

test('percentage coupon invoice discount is applied to subtotal before GST', function () {
  var items = [{ id: 1, name: 'Rice', hsn: '1006', price: 100, qty: 1 }];
  var order = { id: 2, items: items, coupon: 'WELCOME', subtotal: 100, discount: 5, tax: 4.75, total: 99.75 };

  var ledgerFigures = pricing.computeTotals(items, 'WELCOME');
  var invoiceFigures = invoice.computeInvoiceFigures(order);

  assert.equal(ledgerFigures.discount, 5);
  assert.equal(ledgerFigures.tax, 4.75);
  assert.equal(ledgerFigures.total, 99.75);
  assert.equal(invoiceFigures.discount, 5);
  assert.equal(invoiceFigures.tax, 4.75);
  assert.equal(invoiceFigures.total, 99.75);
});

test('invoice interprets a decimal gstRate as a decimal rate', function () {
  var items = [{ id: 1, name: 'Rice', hsn: '1006', gstRate: 0.05, price: 100, qty: 1 }];
  var order = { id: 3, items: items };

  var ledgerFigures = pricing.computeTotals(items, '');
  var invoiceFigures = invoice.computeInvoiceFigures(order);

  assert.equal(ledgerFigures.lines[0].gstPercent, 5);
  assert.equal(ledgerFigures.tax, 5);
  assert.equal(invoiceFigures.rows[0].gstPercent, 5);
  assert.equal(invoiceFigures.tax, 5);
});
