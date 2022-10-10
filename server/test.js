const values = [
  { value: "0.8820820504455562", label: "|", group: "Custom Created" },
  { value: "0.323464402286747", label: ",", group: "Custom Created" },
  { value: "0.5087337145148931", label: "|", group: "Custom Created" },
  { value: "0.6395411595918006", label: ",", group: "Custom Created" },
  { value: "0.6395411123123123", label: ",", group: "Custom Created" },
  { value: "0.5087337145148931", label: "/", group: "Custom Created" },
];

const custom = [
  "Item Code",
  "0.8820820504455562",
  "GTIN",
  "0.5087337145148931",
  "Item Name ",
  "0.323464402286747",
  "0.5087337145148931",
  "Type",
  "Size",
];

// Sort
const uniqueLabel = values
  .map((o) => o.label)
  .filter((v, i, a) => a.indexOf(v) === i);
const usedCustom = values.filter((o) => custom.includes(o.value));
const unusedCustom = values.filter((o) => !custom.includes(o.value));
console.log("uniqueLabel", uniqueLabel);
console.log("usedCustom", usedCustom);
console.log("unusedCustom", unusedCustom);
console.log("-------------------------------------------------------");

// Remove
let newCustom = values.filter((o) => custom.includes(o.value));
let uniqueUnusedCustom = values
  .filter((o) => !custom.includes(o.value))
  .filter((o1, i, a) => a.findIndex((o2) => o2.label === o1.label) === i);
console.log("newCustom", newCustom);
console.log("uniqueUnusedCustom", uniqueUnusedCustom);
console.log("-------------------------------------------------------");

// Find need to add
let addLabel = newCustom
  .map((o) => o.label)
  .filter((v, i, a) => a.indexOf(v) === i)
  .filter((v) => !uniqueUnusedCustom.some((o) => o.label === v));
console.log("addLabel", addLabel);
console.log("-------------------------------------------------------");

// Add
const GRP_CUST = "Custom Created";
newCustom = addLabel
  .map((v) => {
    return { value: Math.random().toString(), label: v, group: GRP_CUST };
  })
  .concat(uniqueUnusedCustom)
  .concat(newCustom);

console.log("newCustom", newCustom);
