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
  institutional_validation?: string;
  is_verified?: string;
  embedding?: number[];
}

let model: use.UniversalSentenceEncoder | null = null;
let internships: Internship[] = [];
let idealVector: number[] | null = null;

// The "Kukreja-Siftly Pattern" Ideal Vector
// This embodies the intent of an early-stage, high-growth technical role for a student.
const IDEAL_STARTUP_INTENT = "Early-stage startup founder's office, building 0-to-1 products, scrappy technical intern, YC backed, high-velocity engineering, mentorship from founders.";

// Helper: Cosine Similarity
const cosineSimilarity = (vecA: number[], vecB: number[]) => {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  try {
    if (type === 'INIT') {
      await tf.ready();
      model = await use.load();
      
      // Pre-calculate the ideal vector
      const emb = await model.embed([IDEAL_STARTUP_INTENT]);
      const arr = await emb.array() as number[][];
      idealVector = arr[0];
      emb.dispose();

      self.postMessage({ type: 'READY' });
    }

    if (type === 'LOAD_DATA') {
      internships = payload;
      if (!model || !idealVector) return;

      // Batch generate embeddings and compute Semantic Match Score
      const texts = internships.map(job => `${job.title} ${job.company} ${job.requirements}`);
      const embeddings = await model.embed(texts);
      const embeddingsArray = await embeddings.array() as number[][];
      
      internships = internships.map((job, i) => {
        const jEmbedding = embeddingsArray[i];
        const semanticMatch = cosineSimilarity(idealVector!, jEmbedding);
        
        // Institutional Boosting
        let matchScore = semanticMatch * 100;
        if (job.is_verified === 'Yes') matchScore += 10; // 10% bonus for verified institutional backing
        
        return {
          ...job,
          match_percentage: Math.min(Math.round(matchScore), 99),
          embedding: jEmbedding
        };
      });

      embeddings.dispose();
      
      // Sort by match percentage by default
      const sorted = [...internships].sort((a, b) => (b as any).match_percentage - (a as any).match_percentage);

      self.postMessage({ type: 'DATA_LOADED', payload: sorted });
    }

    if (type === 'SEARCH') {
      const { term, filterModality } = payload;
      
      // If searching, we combine Semantic Similarity to query + Match Score
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
          final_score: (job as any).match_percentage + (searchScore * 50) 
        };
      }));

      const filtered = results
        .filter(job => filterModality === 'all' || (job as any).modality === filterModality)
        .sort((a, b) => (b as any).final_score - (a as any).final_score);

      self.postMessage({ type: 'SEARCH_RESULTS', payload: filtered });
    }
  } catch (err: any) {
    self.postMessage({ type: 'ERROR', payload: err.message });
  }
};
