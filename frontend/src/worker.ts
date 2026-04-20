import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

interface Internship {
  company: string;
  title: string;
  location: string;
  stipend: string;
  duration: string;
  requirements: string;
  apply_link: string;
  source: string;
  match_percentage?: number;
  embedding?: number[];
}

let model: use.UniversalSentenceEncoder | null = null;
let internships: Internship[] = [];
let idealVector: number[] | null = null;

// What a BITS 1st-year student is actually looking for
const IDEAL_INTENT = "Software engineering intern at a technology startup or research lab, building real products, learning from experienced engineers, mentorship, open source contributions, computer science fundamentals, first year friendly, no prior experience required.";

const cosineSimilarity = (vecA: number[], vecB: number[]) => {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Boost scores for curated high-signal sources
const SOURCE_BOOST: Record<string, number> = {
  'Structured Program': 15,
  'Research Program': 12,
  'Open Source': 10,
  'Internshala': 0,
};

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  try {
    if (type === 'INIT') {
      await tf.ready();
      model = await use.load();
      const emb = await model.embed([IDEAL_INTENT]);
      const arr = await emb.array() as number[][];
      idealVector = arr[0];
      emb.dispose();
      self.postMessage({ type: 'READY' });
    }

    if (type === 'LOAD_DATA') {
      internships = payload;
      if (!model || !idealVector) return;

      const texts = internships.map(job => `${job.title} ${job.company} ${job.requirements}`);
      const embeddings = await model.embed(texts);
      const embeddingsArray = await embeddings.array() as number[][];
      
      internships = internships.map((job, i) => {
        const jEmbedding = embeddingsArray[i];
        const semanticMatch = cosineSimilarity(idealVector!, jEmbedding);
        
        let matchScore = semanticMatch * 100;
        // Boost curated programs
        matchScore += SOURCE_BOOST[job.source] || 0;
        
        return {
          ...job,
          match_percentage: Math.min(Math.round(matchScore), 99),
          embedding: jEmbedding
        };
      });

      embeddings.dispose();
      const sorted = [...internships].sort((a, b) => (b.match_percentage || 0) - (a.match_percentage || 0));
      self.postMessage({ type: 'DATA_LOADED', payload: sorted });
    }

    if (type === 'SEARCH') {
      const { term, filterSource } = payload;

      const results = await Promise.all(internships.map(async job => {
        let searchScore = 0;
        if (term.trim() && model) {
          const emb = await model.embed([term]);
          const arr = await emb.array() as number[][];
          searchScore = cosineSimilarity(arr[0], job.embedding!);
          emb.dispose();
        }
        return { 
          ...job, 
          final_score: (job.match_percentage || 0) + (searchScore * 50) 
        };
      }));

      const filtered = results
        .filter(job => {
          if (filterSource === 'all') return true;
          if (filterSource === 'Remote') return job.location.toLowerCase().includes('remote') || job.location.toLowerCase().includes('work from home');
          return job.source === filterSource;
        })
        .sort((a, b) => (b.final_score || 0) - (a.final_score || 0));

      self.postMessage({ type: 'SEARCH_RESULTS', payload: filtered });
    }
  } catch (err: any) {
    self.postMessage({ type: 'ERROR', payload: err.message });
  }
};
