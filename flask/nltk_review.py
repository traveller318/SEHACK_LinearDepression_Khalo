import os
import numpy as np
from dotenv import load_dotenv
from sklearn.cluster import KMeans
from sentence_transformers import SentenceTransformer
from keybert import KeyBERT
from groq import Groq
import warnings
import json

# Suppress warnings
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['HF_HUB_DISABLE_SYMLINKS_WARNING'] = '1'
warnings.filterwarnings('ignore')

# Initialize environment
load_dotenv()

# Initialize clients with error handling
try:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    model = SentenceTransformer('all-MiniLM-L6-v2')
    kw_model = KeyBERT()
except Exception as e:
    raise RuntimeError(f"Initialization failed: {str(e)}")

def get_representative_reviews(embeddings, reviews, cluster_centers, labels, n=3):
    """Find the top n reviews closest to each cluster center"""
    representative_reviews = {}
    for cluster_id in range(len(cluster_centers)):
        cluster_indices = np.where(labels == cluster_id)[0]
        if len(cluster_indices) == 0:
            continue
            
        cluster_embeddings = embeddings[cluster_indices]
        distances = np.linalg.norm(cluster_embeddings - cluster_centers[cluster_id], axis=1)
        top_indices = cluster_indices[np.argsort(distances)[:n]]
        representative_reviews[cluster_id] = [reviews[i] for i in top_indices]
    
    return representative_reviews

def analyze_reviews(reviews, top_themes=3):
    """Analyze reviews and return a serializable dictionary"""
    if not reviews:
        return {"error": "No reviews provided"}
    
    try:
        # Step 1: Semantic Embedding
        embeddings = model.encode(reviews)
        
        # Step 2: Efficient Clustering
        n_clusters = min(top_themes, len(reviews))
        if n_clusters < 1:
            return {"error": "Not enough reviews for analysis"}
            
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        topics = kmeans.fit_predict(embeddings)
        
        # Get representative reviews
        representative_reviews = get_representative_reviews(
            embeddings, reviews, kmeans.cluster_centers_, topics
        )
        
        # Step 3: Generate summaries
        summaries = []
        for topic_id in range(n_clusters):
            if topic_id not in representative_reviews:
                continue
                
            topic_reviews = [rev for rev, t in zip(reviews, topics) if t == topic_id]
            
            # Get keywords for context
            keywords = kw_model.extract_keywords(
                ' '.join(topic_reviews),
                keyphrase_ngram_range=(1, 2),
                stop_words='english',
                top_n=3
            )
            keyword_list = [kw[0] for kw in keywords]
            
            # Generate concise summary
            summary = summarize_with_groq(keyword_list, representative_reviews[topic_id])
            summaries.append({
                "topic_id": topic_id,
                "summary": summary,
            })
        
        return {"summaries": summaries}
    
    except Exception as e:
        return {"error": str(e)}
    
def summarize_with_groq(keywords, sample_reviews):
    """Generate one-sentence summary"""
    try:
        prompt = f"""
        Based on these patterns: {keywords}
        And these representative reviews: {sample_reviews}
        Create one concise sentence summarizing the main point.
        """
        
        response = client.chat.completions.create(
            model="Llama-3.1-8b-Instant",
            messages=[
                {"role": "system", "content": "You are a concise summarizer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=100
        )
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        return f"Summary error: {str(e)}"

