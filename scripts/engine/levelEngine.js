/**
 * Tính toán Level dựa trên system_config/level_thresholds
 */
function calculateLevel(totalXp, thresholds) {
  // Support schema Object tĩnh của RTDB (vd: { "2": 300, "3": 700 })
  if (!thresholds || typeof thresholds !== 'object') {
    return 1;
  }
  
  let level = 1;
  
  for (const [lvl, requiredXp] of Object.entries(thresholds)) {
    const parsedLevel = parseInt(lvl, 10);
    if (!Number.isNaN(parsedLevel) && totalXp >= requiredXp) {
      level = Math.max(level, parsedLevel);
    }
  }
  
  return level;
}

module.exports = { calculateLevel };
