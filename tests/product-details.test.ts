import test from "node:test";
import assert from "node:assert/strict";
import { catalogue } from "../lib/catalogue";
import { detailsFor } from "../lib/product-details";

test("every active product has substantial buying information and named feature explanations", () => {
  for (const product of catalogue) {
    const details = detailsFor(product);
    assert.ok(details, product.id);
    assert.ok(details.overview.join(" ").split(/\s+/).length >= 100, product.name);
    assert.ok(details.features.length >= 4);
    assert.ok(details.features.every(feature => feature.title.length > 3 && feature.description.length > 20));
    assert.ok(details.benefits.length >= 3 && details.uses.length >= 3 && details.checks.length >= 3);
    assert.ok(details.faq.length >= 3 && Object.keys(details.specifications).length >= 2);
  }
});
test("model-specific content distinguishes energy capacity, output, connections and general guidance", () => {
  const compact = detailsFor(catalogue.find(p => p.id === "re-021")!);
  const ac = detailsFor(catalogue.find(p => p.id === "re-024")!);
  const battery = detailsFor(catalogue.find(p => p.id === "re-016")!);
  assert.match(compact.specifications['Connections in supplied material'], /USB and 12V DC/);
  assert.match(compact.overview.join(' '), /AC outlet is not specified/);
  assert.match(ac.specifications['Connections in supplied material'], /3 AC/);
  assert.equal(battery.specifications['Listed energy capacity'], '32kWh');
  assert.ok(!Object.keys(battery.specifications).some(key => /cycles|warranty|chemistry|surge/i.test(key)));
});
