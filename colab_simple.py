# SIH Sentiment Analysis - Colab Backend
# Copy and paste this entire code into a single Colab cell

# Install required packages
!pip install flask flask-cors pyngrok transformers torch pandas matplotlib wordcloud nltk scikit-learn

# Import all required libraries
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import io
import base64
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from transformers import pipeline
from nltk.corpus import opinion_lexicon
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
import re
from pyngrok import ngrok
import warnings
warnings.filterwarnings('ignore')

print("✅ All imports successful!")

# Download NLTK data
try:
    nltk.download('opinion_lexicon', quiet=True)
    nltk.download('vader_lexicon', quiet=True)
    print("✅ NLTK data downloaded successfully!")
except Exception as e:
    print(f"⚠️ NLTK download warning: {e}")

# Load ML models
print("🔄 Loading ML models... This may take a few minutes...")

# Load sentiment analysis model
sentiment_pipe = pipeline("text-classification", model="cardiffnlp/twitter-roberta-base-sentiment-latest")
print("✅ Sentiment model loaded!")

# Load summarization model
summarizer = pipeline("summarization", model="knkarthick/MEETING_SUMMARY")
print("✅ Summarization model loaded!")

# Load urgency classification model
urgency_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
print("✅ Urgency classification model loaded!")

print("🎉 All models loaded successfully!")

# Helper functions for analysis
def sentiment_analysis(text: str) -> tuple:
    """Analyze sentiment of a single text"""
    try:
        result = sentiment_pipe(text)
        return result[0]["label"], round(result[0]["score"], 2)
    except Exception as e:
        print(f"Error in sentiment analysis: {e}")
        return "NEUTRAL", 0.0

def generate_summary(text: str) -> str:
    """Generate summary for a text"""
    try:
        # Truncate text if too long
        if len(text) > 1000:
            text = text[:1000]
        result = summarizer(text, max_length=100, min_length=30, do_sample=False)
        return result[0]["summary_text"]
    except Exception as e:
        print(f"Error in summarization: {e}")
        return "Unable to generate summary"

def detect_urgency(text: str, sentiment_label: str) -> str:
    """Detect urgency level based on text and sentiment"""
    try:
        # If positive, no urgency
        if sentiment_label == "POSITIVE":
            return "Not Applicable"
        
        # Clean text
        text = re.sub(r"[^a-zA-Z0-9\s]", "", str(text))
        if not text.strip():
            return "minor"

        urgency_labels = ["critical", "moderate", "minor"]
        result = urgency_classifier(text, urgency_labels)
        return result["labels"][0]
    except Exception as e:
        print(f"Error in urgency detection: {e}")
        return "minor"

def generate_wordcloud(text: str) -> str:
    """Generate word cloud and return as base64 encoded image"""
    try:
        # Clean text
        text_clean = re.sub(r"[^a-z\s]", "", text.lower())
        
        # Get opinion words
        pos_words = set(opinion_lexicon.positive())
        neg_words = set(opinion_lexicon.negative())
        all_sentiment_words = pos_words.union(neg_words)
        
        # Keep only sentiment words
        sentiment_tokens = [w for w in text_clean.split() if w in all_sentiment_words]
        
        # Filter with VADER for strong sentiment words
        sia = SentimentIntensityAnalyzer()
        filtered_tokens = [
            w for w in sentiment_tokens 
            if abs(sia.polarity_scores(w)["compound"]) >= 0.41
        ]
        
        sentiment_text = " ".join(filtered_tokens)
        
        if not sentiment_text.strip():
            # Fallback to original text if no sentiment words found
            sentiment_text = text_clean
        
        # Generate word cloud
        wc = WordCloud(
            width=1000, height=600,
            background_color="white",
            colormap="viridis",
            prefer_horizontal=0.9,
            max_words=80,
            min_font_size=12,
            contour_color="black", 
            contour_width=1,
            relative_scaling=0.5,
            normalize_plurals=True
        ).generate(sentiment_text)
        
        # Convert to base64
        plt.figure(figsize=(12, 7))
        plt.imshow(wc, interpolation="bilinear")
        plt.axis("off")
        
        # Save to bytes
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', bbox_inches='tight', dpi=150)
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        plt.close()
        
        return img_base64
    except Exception as e:
        print(f"Error generating word cloud: {e}")
        return ""

print("✅ Helper functions defined!")

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/')
def health_check():
    return jsonify({
        "message": "SIH Sentiment Analysis API is running!",
        "status": "healthy",
        "models_loaded": True
    })

@app.route('/analyze', methods=['POST'])
def analyze_csv():
    try:
        print("📊 Processing new analysis request...")
        
        # Get the uploaded file
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read CSV file
        contents = file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        print(f"📁 Processing {len(df)} rows...")
        
        # Check if 'review' column exists
        if 'review' not in df.columns:
            # Try common column names
            possible_columns = ['comment', 'comments', 'text', 'feedback', 'response']
            review_column = None
            for col in possible_columns:
                if col in df.columns:
                    review_column = col
                    break
            
            if review_column is None:
                return jsonify({'error': 'No review column found. Please ensure your CSV has a review column.'}), 400
            
            df = df.rename(columns={review_column: 'review'})
            print(f"✅ Found review data in column: {review_column}")
        
        # Process each review
        results = []
        all_text = ""
        
        for idx, row in df.iterrows():
            review_text = str(row['review'])
            all_text += review_text + " "
            
            # Analyze sentiment
            sentiment_label, sentiment_score = sentiment_analysis(review_text)
            
            # Generate summary
            summary = generate_summary(review_text)
            
            # Detect urgency
            urgency = detect_urgency(review_text, sentiment_label)
            
            results.append({
                "id": str(idx),
                "originalComment": review_text,
                "summary": summary,
                "sentiment": sentiment_label.lower(),
                "sentimentScore": sentiment_score,
                "urgency": urgency
            })
        
        print(f"✅ Processed {len(results)} comments")
        
        # Calculate overall statistics
        sentiment_counts = {}
        for result in results:
            sentiment = result["sentiment"]
            sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
        
        # Generate word cloud
        print("🎨 Generating word cloud...")
        wordcloud_image = generate_wordcloud(all_text)
        
        # Prepare response
        analysis_data = {
            "sentimentAnalysis": {
                "positive": sentiment_counts.get("positive", 0),
                "negative": sentiment_counts.get("negative", 0),
                "neutral": sentiment_counts.get("neutral", 0),
                "totalComments": len(results)
            },
            "summaries": results,
            "wordCloud": {
                "image": wordcloud_image,
                "format": "base64"
            },
            "urgencyAnalysis": {
                "critical": len([r for r in results if r["urgency"] == "critical"]),
                "moderate": len([r for r in results if r["urgency"] == "moderate"]),
                "minor": len([r for r in results if r["urgency"] == "minor"]),
                "notApplicable": len([r for r in results if r["urgency"] == "Not Applicable"])
            },
            "averageSentimentScore": sum([r["sentimentScore"] for r in results]) / len(results) if results else 0
        }
        
        print("🎉 Analysis complete!")
        return jsonify(analysis_data)
        
    except Exception as e:
        print(f"❌ Error processing file: {e}")
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

print("✅ Flask app created!")

# Start the Flask server with ngrok
print("🚀 Starting Flask server...")
print("📡 Setting up ngrok tunnel...")

# Create ngrok tunnel
public_url = ngrok.connect(5000)
print(f"\n🌐 Your API is now available at: {public_url}")
print(f"🔗 Use this URL in your frontend: {public_url}/analyze")
print("\n📋 Next steps:")
print("1. Copy the URL above")
print("2. Update your frontend with this URL")
print("3. Start your Next.js frontend")
print("4. Upload CSV files through the frontend!")
print("\n⚠️ Keep this cell running to keep the API active!")

# Start the Flask app
app.run(host='0.0.0.0', port=5000, debug=False)
