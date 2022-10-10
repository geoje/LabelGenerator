const custom = [
  { value: "0.8820820504455562", label: "|", group: "Custom Created" },
  { value: "0.323464402286747", label: ",", group: "Custom Created" },
  { value: "0.5087337145148931", label: "|", group: "Custom Created" },
  { value: "0.6395411595918006", label: ",", group: "Custom Created" },
  { value: "0.6395411123123123", label: ",", group: "Custom Created" },
  { value: "0.1231231231231231", label: "/", group: "Custom Created" },
];

const value = [
  "Item Code",
  "0.8820820504455562",
  "GTIN",
  "0.5087337145148931",
  "Item Name ",
  "0.323464402286747",
  "0.1231231231231231",
  "Type",
  "Size",
];

// Remove duplicated in unused
let newCustom = custom.filter((o) => value.includes(o.value));
let uniqueUnusedCustom = custom
  .filter((o) => !value.includes(o.value))
  .filter((o1, i, a) => a.findIndex((o2) => o2.label === o1.label) === i);

// Add used label
const GRP_CUST = "Custom Created";
newCustom = newCustom
  .map((o) => o.label)
  .filter((v, i, a) => a.indexOf(v) === i)
  .filter((v) => !uniqueUnusedCustom.some((o) => o.label === v))
  .map((v) => {
    return { value: Math.random().toString(), label: v, group: GRP_CUST };
  }) // Used label exclude uniqueUnusedCustom
  .concat(uniqueUnusedCustom)
  .concat(newCustom);

console.log("newCustom", newCustom);
