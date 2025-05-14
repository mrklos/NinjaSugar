export function formatLocalTimeWithMinutesAgo(input) {
  const dateObj = input instanceof Date ? input : new Date(input);

  const nowMs = Date.now();
  const thenMs = dateObj.getTime();
  const diffMin = Math.floor((nowMs - thenMs) / 60000);

  const hrs = dateObj.getHours().toString().padStart(2, "0");
  const mins = dateObj.getMinutes().toString().padStart(2, "0");

  return `${hrs}:${mins}, ${diffMin} min ago`;
}
