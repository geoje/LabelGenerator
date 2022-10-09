String.prototype.replaceAt = function (index, replacement) {
  return (
    this.substring(0, index) +
    replacement +
    this.substring(index + replacement.length)
  );
};

const IncreaseAlpha = (a, i) =>
  a.charAt(i) == "Z"
    ? i
      ? IncreaseAlpha(a.replaceAt(i, "A"), i - 1)
      : "A" + a.replaceAt(i, "A")
    : a.replaceAt(i, String.fromCharCode(a.charCodeAt(i) + 1));

console.log(IncreaseAlpha("A", 0));
console.log(IncreaseAlpha("Z", 0));
console.log(IncreaseAlpha("CC", 1));
console.log(IncreaseAlpha("DZ", 1));
console.log(IncreaseAlpha("ZZ", 1));
