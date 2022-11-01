const img = { width: 1440, height: 1081 };
const sizePx = { w: 359, h: 76 };

const wRatio = sizePx.w / img.width;
const hRatio = sizePx.h / img.height;

console.log({
  w: Math.floor(Math.min(wRatio, hRatio) * img.width),
  h: Math.floor(Math.min(wRatio, hRatio) * img.height),
});

// Changing at github
// Changed!!!!
