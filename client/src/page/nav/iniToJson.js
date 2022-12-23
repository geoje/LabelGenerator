export default function iniToJson(ini) {
  const result = {};
  let key = "";

  ini.split("\n").forEach((line) => {
    line = line.trim();

    if (/^\[.+\]$/.test(line)) {
      key = line.slice(1, line.length - 1);
      result[key] = {};
    } else {
      const sepIdx = line.indexOf("=");
      if (sepIdx !== -1) {
        result[key][line.slice(0, sepIdx)] = line.slice(
          sepIdx + 1,
          line.length
        );
      }
    }
  });
  return result;
}
