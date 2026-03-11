/**
 * Face Embedding Service
 * 
 * Communicates with the Python AI service to generate face embeddings
 * for student images used in attendance detection.
 */

/**
 * Face embedding configuration
 */
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const EMBEDDING_REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Embedding service error types
 */
export class EmbeddingServiceError extends Error {
  constructor(
    message: string,
    public code: 'SERVICE_UNAVAILABLE' | 'INVALID_IMAGE' | 'NO_FACE_DETECTED' | 'MULTIPLE_FACES' | 'GENERATION_FAILED'
  ) {
    super(message);
    this.name = 'EmbeddingServiceError';
  }
}

/**
 * Response from AI service
 */
interface EmbeddingResponse {
  success: boolean;
  embedding?: number[];
  error?: string;
  faces_detected?: number;
}

/**
 * Result of embedding generation
 */
export interface EmbeddingResult {
  success: boolean;
  embedding: number[];
  facesDetected: number;
}

/**
 * Generate face embedding from image URL
 * 
 * Sends image URL to Python AI service which:
 * 1. Downloads the image
 * 2. Detects faces using face_detector.py
 * 3. Generates 128-d embedding using recognition.py
 * 4. Returns the embedding vector
 * 
 * @param imageUrl - Secure URL of the uploaded image
 * @returns Face embedding vector (128 dimensions)
 */
export async function generateFaceEmbedding(
  imageUrl: string
): Promise<EmbeddingResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EMBEDDING_REQUEST_TIMEOUT);

    const response = await fetch(`${AI_SERVICE_URL}/generate-embedding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new EmbeddingServiceError(
        errorData.error || 'Failed to generate embedding',
        'GENERATION_FAILED'
      );
    }

    const data: EmbeddingResponse = await response.json();

    if (!data.success || !data.embedding) {
      // Handle specific error cases
      if (data.faces_detected === 0) {
        throw new EmbeddingServiceError(
          'No face detected in the image. Please upload a clear photo with a visible face.',
          'NO_FACE_DETECTED'
        );
      }

      if (data.faces_detected && data.faces_detected > 1) {
        throw new EmbeddingServiceError(
          `Multiple faces detected (${data.faces_detected}). Please upload an image with only one person.`,
          'MULTIPLE_FACES'
        );
      }

      throw new EmbeddingServiceError(
        data.error || 'Failed to generate face embedding',
        'GENERATION_FAILED'
      );
    }

    // Validate embedding dimensions (should be 128-d for face_recognition library)
    if (data.embedding.length !== 128) {
      throw new EmbeddingServiceError(
        `Invalid embedding dimensions: expected 128, got ${data.embedding.length}`,
        'GENERATION_FAILED'
      );
    }

    return {
      success: true,
      embedding: data.embedding,
      facesDetected: data.faces_detected || 1,
    };
  } catch (error) {
    if (error instanceof EmbeddingServiceError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new EmbeddingServiceError(
        'AI service is unavailable. Please ensure the Python service is running on port 8000.',
        'SERVICE_UNAVAILABLE'
      );
    }

    // Handle timeout
    if ((error as Error).name === 'AbortError') {
      throw new EmbeddingServiceError(
        'Embedding generation timed out. Please try again.',
        'SERVICE_UNAVAILABLE'
      );
    }

    throw new EmbeddingServiceError(
      `Unexpected error: ${(error as Error).message}`,
      'GENERATION_FAILED'
    );
  }
}

/**
 * Batch generate embeddings for multiple images
 * Useful when uploading a dataset of student images
 * 
 * @param imageUrls - Array of image URLs
 * @returns Array of embedding results
 */
export async function generateBatchEmbeddings(
  imageUrls: string[]
): Promise<EmbeddingResult[]> {
  // Process in parallel with concurrency limit to avoid overwhelming the AI service
  const BATCH_SIZE = 3;
  const results: EmbeddingResult[] = [];

  for (let i = 0; i < imageUrls.length; i += BATCH_SIZE) {
    const batch = imageUrls.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(url => generateFaceEmbedding(url))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Validate that AI service is running and responsive
 * 
 * @returns Service health status
 */
export async function checkAIServiceHealth(): Promise<{
  available: boolean;
  version?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        available: true,
        version: data.version || 'unknown',
      };
    }

    return {
      available: false,
      error: 'Service returned non-OK status',
    };
  } catch (error) {
    return {
      available: false,
      error: (error as Error).message,
    };
  }
}
