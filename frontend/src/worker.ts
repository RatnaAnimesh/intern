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
  branch?: string;
  modality?: string;
  is_first_year?: string;
  embedding?: number[];
}

let model: use.UniversalSentenceEncoder | null = null;
let internships: Internship[] = [];

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
      self.postMessage({ type: 'READY' });
    }

    if (type === 'LOAD_DATA') {
      internships = payload;
      if (!model) return;

      // Batch generate embeddings
      const texts = internships.map(job => `${job.title} ${job.company} ${job.requirements}`);
      const embeddings = await model.embed(texts);
      const embeddingsArray = await embeddings.array() as number[][];
      
      internships = internships.map((job, i) => ({
        ...job,
        embedding: embeddingsArray[i]
      }));

      embeddings.dispose(); // Cleanup tensors
      self.postMessage({ type: 'DATA_LOADED', payload: internships });
    }

    if (type === 'SEARCH') {
      const { term, filterModality } = payload;
      if (!term.trim() && filterModality === 'all') {
        self.postMessage({ type: 'SEARCH_RESULTS', payload: internships });
        return;
      }

      let searchEmbedding: number[] | null = null;
      if (term.trim() && model) {
        const emb = await model.embed([term]);
        const arr = await emb.array() as number[][];
        searchEmbedding = arr[0];
        emb.dispose();
      }

      const results = internships.map(job => {
        let score = 0;
        const kw = job.company.toLowerCase().includes(term.toLowerCase()) || 
                   job.title.toLowerCase().includes(term.toLowerCase());
        
        if (kw) score += 0.5;
        if (job.is_first_year === 'Priority: 1st Year') score += 1.0;
        
        if (searchEmbedding && job.embedding) {
          score += cosineSimilarity(searchEmbedding, job.embedding);
        }

        return { ...job, score };
      });

      const filtered = results
        .filter(job => filterModality === 'all' || job.modality === filterModality)
        .sort((a, b) => b.score - a.score);

      self.postMessage({ type: 'SEARCH_RESULTS', payload: filtered });
    }
  } catch (err: any) {
    self.postMessage({ type: 'ERROR', payload: err.message });
  }
};
