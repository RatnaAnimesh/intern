/* ============================================================
   BITS Internship Portal — Semantic Engine Worker
   ============================================================
   Zero build step. Pulls TFJS from CDN.
   ============================================================ */

importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow-models/universal-sentence-encoder");

let model = null;
let idealVector = null;

const IDEAL_INTENT = "Software engineering intern at a technology startup or research lab, building real products, learning from experienced engineers, mentorship, open source contributions, computer science fundamentals, first year friendly, no prior experience required.";

async function init() {
  await tf.ready();
  model = await use.load();
  const emb = await model.embed([IDEAL_INTENT]);
  idealVector = await emb.array();
  idealVector = idealVector[0];
  emb.dispose();
  self.postMessage({ type: 'READY' });
}

function dotProduct(vecA, vecB) {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

function magnitude(vec) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

function cosineSimilarity(vecA, vecB) {
  return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}

const SOURCE_BOOST = {
  'Structured Program': 0.15,
  'Research Program': 0.12,
  'Open Source': 0.10,
  'Internshala': 0,
};

self.onmessage = async (e) => {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    await init();
  }

  if (type === 'GET_SCORES') {
    if (!model || !idealVector) return;

    const internships = payload;
    const texts = internships.map(j => `${j.title} ${j.company} ${j.requirements}`);
    
    // Process in batches of 20 to avoid freezing worker memory
    const scores = [];
    for (let i = 0; i < texts.length; i += 20) {
      const batch = texts.slice(i, i + 20);
      const embeddings = await model.embed(batch);
      const embeddingsArray = await embeddings.array();
      
      embeddingsArray.forEach((emb, idx) => {
        const similarity = cosineSimilarity(idealVector, emb);
        const boost = SOURCE_BOOST[internships[i + idx].source] || 0;
        const finalScore = Math.min(Math.round((similarity + boost) * 100), 99);
        scores.push(finalScore);
      });
      
      embeddings.dispose();
    }

    self.postMessage({ type: 'SCORES_CALCULATED', payload: scores });
  }
};
