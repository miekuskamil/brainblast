import { makeRng } from './src/engine/rng.js';
import { TIER } from './src/engine/difficulty.js';
import {
  bodmasTopic, negativesTopic, timeSpeedTopic, averagesTopic,
  ratioTopic, fractionsTopic, decimalsTopic, problemSolvingTopic,
} from './src/curriculum/topics-varied.js';

const topics = { bodmasTopic, negativesTopic, timeSpeedTopic, averagesTopic, ratioTopic, fractionsTopic, decimalsTopic, problemSolvingTopic };

const tierNames = { [TIER.EASY]: 'EASY', [TIER.STANDARD]: 'STANDARD', [TIER.HARD]: 'HARD' };

let crashCount = 0;

for (const [tname, topic] of Object.entries(topics)) {
  console.log(`\n=== ${tname} (${topic.id}) ===`);
  for (const styleId of topic.styleIds) {
    console.log(`-- style: ${styleId} --`);
    for (const tier of [TIER.EASY, TIER.STANDARD, TIER.HARD]) {
      const rng = makeRng(12345);
      const lines = [];
      for (let i = 0; i < 3; i++) {
        try {
          const q = topic.generate(rng, styleId, tier);
          const visualKind = q.visual ? (q.visual.match(/data-kind="([^"]+)"/) || [,'?'])[1] : null;
          lines.push(`  [${tierNames[tier]}] ans=${JSON.stringify(q.answer)} visual=${visualKind} :: ${q.prompt.replace(/\n/g, ' | ')}`);
        } catch (e) {
          crashCount++;
          lines.push(`  [${tierNames[tier]}] CRASH: ${e.message}`);
        }
      }
      lines.forEach((l) => console.log(l));
    }
  }
}

console.log(`\nTotal crashes: ${crashCount}`);
