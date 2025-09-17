// src/utils/calculateManhattanDistance.js
const calculateManhattanDistance = (arr1, arr2) => {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return 0;

  const distance = arr1.reduce((sum, val, i) => sum + Math.abs(val - arr2[i]), 0);
  const maxDistance = arr1.length * 4; // each answer differs max by 4 (1–5 scale)

  const compatibility = ((1 - distance / maxDistance) * 100).toFixed(2);
  return compatibility;
};

export default calculateManhattanDistance;
