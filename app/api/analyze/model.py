# from transformers import pipeline
# import pandas as pd
# import matplotlib.pyplot as plt
# from wordcloud import WordCloud
# from nltk.corpus import opinion_lexicon
# from nltk.sentiment.vader import SentimentIntensityAnalyzer
# import nltk, re

# # Load the classification pipeline with the specified model
# pipe = pipeline("text-classification", model="cardiffnlp/twitter-roberta-base-sentiment-latest")

# # Classify a new sentence
# sentence = "I love this product! It's amazing and works perfectly."
# result = pipe(sentence)

# # Print the result
# print(result)

# def sentiment(Review):
#   try:
#     res = pipe(Review)  # truncate long text
#     return res["label"], round(res["score"], 2)
#   except:
#     return "No Comment provided"

# rev = pd.read_csv('reviews.csv')
# rev['ratings'] = rev['review'].apply(lambda x: sentiment(x))


# nltk.download('opinion_lexicon')
# nltk.download('vader_lexicon')

# # Load reviews


# # Join all reviews into one string and clean
# text = " ".join(rev["review"].astype(str)).lower()
# text_clean = re.sub(r"[^a-z\s]", "", text)

# # Get opinion words (positive + negative)
# pos_words = set(opinion_lexicon.positive())
# neg_words = set(opinion_lexicon.negative())
# all_sentiment_words = pos_words.union(neg_words)

# # Keep only words that are in opinion lexicon
# sentiment_tokens = [w for w in text_clean.split() if w in all_sentiment_words]

# # Filter with VADER for strong sentiment words
# sia = SentimentIntensityAnalyzer()
# filtered_tokens = [
#     w for w in sentiment_tokens 
#     if abs(sia.polarity_scores(w)["compound"]) >= 0.41
# ]

# # Convert back to text for wordcloud
# sentiment_text = " ".join(filtered_tokens)


# wc = WordCloud(
#     width=1000, height=600,
#     background_color="white",
#     colormap="viridis",
#     prefer_horizontal=0.9,
#     max_words=80,
#     min_font_size=12,
#     contour_color="black", contour_width=1,
#     relative_scaling=0.5,
#     normalize_plurals=True
# ).generate(sentiment_text)


# plt.figure(figsize=(12, 7))
# plt.imshow(wc, interpolation="bilinear")
# plt.axis("off")
# plt.show()

# summarizer = pipeline("summarization",model="knkarthick/MEETING_SUMMARY")

# def Summary(Text):
#   try:
#     return summarizer(Text)
#   except:
#     return "No Comment"

# rev['summaries'] = rev['review'].apply(lambda x: Summary(x))

# urgency_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# # ----------------------------
# # 3. Define Labels
# # ----------------------------
# urgency_labels = ["critical", "moderate", "minor"]

# # ----------------------------
# # 4. Functions
# # ----------------------------


# def detect_urgency(text, sentiment_label):
#     # if positive, no urgency
#     if sentiment_label == "POSITIVE":
#         return "Not Applicable"
    
#     # clean text
#     text = re.sub(r"[^a-zA-Z0-9\s]", "", str(text))
#     if not text.strip():
#         return "minor"

#     result = urgency_classifier(text, urgency_labels)
#     return result["labels"][0]  # best match

# # ----------------------------
# # 5. Apply on comments
# # ----------------------------
# sentiments = rev["review"].apply(lambda x: sentiment(x))
# rev["sentiment"] = sentiments.apply(lambda x: x[0])
# rev["sentiment_score"] = sentiments.apply(lambda x: round(x[1], 2))

# rev["urgency"] = rev.apply(lambda row: detect_urgency(row["review"], row["sentiment"]), axis=1)

# # ----------------------------
# # 6. Save / View Results
# # ----------------------------


# SIH Sentiment Analysis - Colab Backend with Issue Detection
# Copy and paste this entire code into a single Colab cell

# Install required packages
!pip install flask flask-cors pyngrok transformers torch pandas matplotlib wordcloud nltk scikit-learn spacy

# Download spacy model
!python -m spacy download en_core_web_sm

# Import all required libraries
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from transformers import pipeline
from nltk.corpus import opinion_lexicon
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
import re
from pyngrok import ngrok
import spacy
from collections import Counter, defaultdict
import warnings
warnings.filterwarnings('ignore')

print("✅ All imports successful!")

# Download NLTK data
try:
    nltk.download('opinion_lexicon', quiet=True)
    nltk.download('vader_lexicon', quiet=True)
    nltk.download('stopwords', quiet=True)
    print("✅ NLTK data downloaded successfully!")
except Exception as e:
    print(f"⚠ NLTK download warning: {e}")

# Load spacy model
nlp = spacy.load("en_core_web_sm")

# Load ML models
sentiment_pipe = pipeline("text-classification", model="cardiffnlp/twitter-roberta-base-sentiment-latest")
summarizer = pipeline("summarization", model="knkarthick/MEETING_SUMMARY")

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
        if len(text) > 1000:
            text = text[:1000]
        result = summarizer(text, max_length=100, min_length=30, do_sample=False)
        return result[0]["summary_text"]
    except Exception as e:
        print(f"Error in summarization: {e}")
        return "Unable to generate summary"

def extract_issues(text: str) -> list:
    """Extract key issues/problems from text using NLP"""
    try:
        doc = nlp(text.lower())
        issues = []
        
        # Negative keywords that indicate problems
        problem_indicators = {
            'not', 'no', 'never', 'cant', "can't", 'cannot', 'wont', "won't", 'dont', "don't",
            'doesnt', "doesn't", 'didnt', "didn't", 'issue', 'problem', 'bug', 'error',
            'broken', 'fail', 'failed', 'failing', 'slow', 'poor', 'bad', 'terrible',
            'horrible', 'awful', 'useless', 'worst', 'hate', 'crash', 'crashing'
        }
        
        # Extract noun chunks that appear with problem indicators
        for chunk in doc.noun_chunks:
            chunk_text = chunk.text.strip()
            chunk_words = set(chunk_text.split())
            
            # Check if chunk or nearby words contain problem indicators
            sent = chunk.sent
            sent_words = set(token.text.lower() for token in sent)
            
            if sent_words.intersection(problem_indicators):
                # Clean and normalize the issue
                issue = re.sub(r'\b(the|a|an|is|are|was|were|be|been|being)\b', '', chunk_text)
                issue = re.sub(r'\s+', ' ', issue).strip()
                
                if len(issue.split()) <= 5 and len(issue) > 3:  # Reasonable length
                    issues.append(issue)
        
        # Also look for specific patterns like "X not working", "X is broken", etc.
        text_lower = text.lower()
        patterns = [
            r'(\w+(?:\s+\w+){0,3})\s+(?:not|isnt|isn\'t|doesnt|doesn\'t)\s+(?:work|working|function|responding|responsive)',
            r'(\w+(?:\s+\w+){0,3})\s+(?:is|are)\s+(?:broken|slow|buggy|crashing|failing)',
            r'(?:issue|problem|bug|error)\s+(?:with|in)\s+(\w+(?:\s+\w+){0,3})',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0]
                issue = re.sub(r'\s+', ' ', match).strip()
                if len(issue) > 3:
                    issues.append(issue)
        
        return list(set(issues))  # Remove duplicates
    except Exception as e:
        print(f"Error extracting issues: {e}")
        return []

def normalize_issue(issue: str) -> str:
    """Normalize similar issues to a common form"""
    issue = issue.lower().strip()
    
    # Common synonyms and variations
    replacements = {
        'ui': 'interface',
        'ux': 'user experience',
        'frontend': 'front end',
        'backend': 'back end',
        'doesnt': 'does not',
        'dont': 'do not',
        'cant': 'cannot',
        'wont': 'will not',
    }
    
    for old, new in replacements.items():
        issue = issue.replace(old, new)
    
    return issue

def calculate_issue_urgency(issue_data: dict, total_negative: int) -> str:
    """Calculate urgency based on frequency and sentiment"""
    frequency = issue_data['count']
    avg_sentiment = issue_data['avg_sentiment_score']
    
    # Calculate frequency ratio
    frequency_ratio = frequency / max(total_negative, 1)
    
    # Urgency scoring
    # Critical: High frequency (>30%) OR very negative sentiment (<0.3) with multiple occurrences
    if frequency_ratio > 0.3 or (frequency >= 3 and avg_sentiment < 0.3):
        return "critical"
    # Moderate: Medium frequency (10-30%) OR negative sentiment with some occurrences
    elif frequency_ratio > 0.1 or (frequency >= 2 and avg_sentiment < 0.5):
        return "moderate"
    # Minor: Low frequency or less severe
    else:
        return "minor"

def generate_wordcloud(text: str) -> str:
    """Generate word cloud and return as base64 encoded image"""
    try:
        text_clean = re.sub(r"[^a-z\s]", "", text.lower())
        pos_words = set(opinion_lexicon.positive())
        neg_words = set(opinion_lexicon.negative())
        all_sentiment_words = pos_words.union(neg_words)
        sentiment_tokens = [w for w in text_clean.split() if w in all_sentiment_words]
        
        sia = SentimentIntensityAnalyzer()
        filtered_tokens = [
            w for w in sentiment_tokens
            if abs(sia.polarity_scores(w)["compound"]) >= 0.5
        ]
        
        sentiment_text = " ".join(filtered_tokens) if filtered_tokens else text_clean
        
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
        
        plt.figure(figsize=(12, 7))
        plt.imshow(wc, interpolation="bilinear")
        plt.axis("off")
        
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
app = Flask(_name_)
CORS(app)

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
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Read CSV file
        contents = file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        print(f"📁 Processing {len(df)} rows...")

        # Find review column
        if 'review' not in df.columns:
            possible_columns = ['comment', 'comments', 'text', 'feedback', 'response']
            review_column = None
            for col in possible_columns:
                if col in df.columns:
                    review_column = col
                    break
            if review_column is None:
                return jsonify({'error': 'No review column found'}), 400
            df = df.rename(columns={review_column: 'review'})

        # Process each review
        results = []
        all_text = ""
        negative_comments = []
        issue_tracker = defaultdict(lambda: {'count': 0, 'sentiment_scores': [], 'comment_ids': []})

        for idx, row in df.iterrows():
            review_text = str(row['review'])
            all_text += review_text + " "

            # Analyze sentiment
            sentiment_label, sentiment_score = sentiment_analysis(review_text)
            
            # Generate summary
            summary = generate_summary(review_text)

            # Extract issues only from negative comments
            issues = []
            if sentiment_label == "NEGATIVE":
                negative_comments.append((idx, review_text, sentiment_score))
                extracted_issues = extract_issues(review_text)
                issues = extracted_issues
                
                # Track issues
                for issue in extracted_issues:
                    normalized = normalize_issue(issue)
                    issue_tracker[normalized]['count'] += 1
                    issue_tracker[normalized]['sentiment_scores'].append(sentiment_score)
                    issue_tracker[normalized]['comment_ids'].append(str(idx))

            results.append({
                "id": str(idx),
                "originalComment": review_text,
                "summary": summary,
                "sentiment": sentiment_label.lower(),
                "sentimentScore": sentiment_score,
                "issues": issues,
                "urgency": "Not Applicable" if sentiment_label == "POSITIVE" else None  # Will be updated
            })

        print(f"✅ Processed {len(results)} comments")
        print(f"🔍 Found {len(negative_comments)} negative comments")
        print(f"📊 Identified {len(issue_tracker)} unique issues")

        # Calculate issue urgency and prepare issue summary
        issue_summary = []
        total_negative = len(negative_comments)
        
        for issue, data in issue_tracker.items():
            avg_sentiment = sum(data['sentiment_scores']) / len(data['sentiment_scores'])
            urgency = calculate_issue_urgency({
                'count': data['count'],
                'avg_sentiment_score': avg_sentiment
            }, total_negative)
            
            issue_summary.append({
                "issue": issue.title(),  # Capitalize for display
                "count": data['count'],
                "urgency": urgency,
                "averageSentimentScore": round(avg_sentiment, 2),
                "affectedComments": data['comment_ids']
            })

        # Sort issues by urgency (critical > moderate > minor) and then by count
        urgency_order = {"critical": 0, "moderate": 1, "minor": 2}
        issue_summary.sort(key=lambda x: (urgency_order[x['urgency']], -x['count']))

        # Assign urgency to comments based on their issues
        for result in results:
            if result['urgency'] is None and result['issues']:
                # Find the highest urgency among all issues in this comment
                comment_urgencies = []
                for issue in result['issues']:
                    normalized = normalize_issue(issue)
                    matching_issue = next((iss for iss in issue_summary if normalize_issue(iss['issue']) == normalized), None)
                    if matching_issue:
                        comment_urgencies.append(urgency_order[matching_issue['urgency']])
                
                if comment_urgencies:
                    highest_urgency_idx = min(comment_urgencies)
                    result['urgency'] = list(urgency_order.keys())[highest_urgency_idx]
                else:
                    result['urgency'] = "minor"
            elif result['urgency'] is None:
                result['urgency'] = "minor"

        # Calculate statistics
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
            "issueAnalysis": issue_summary,  # New: Detailed issue breakdown
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

ngrok.set_auth_token("32yKJmeiyqJ10luH7uHLnC4GBdH_28G88pNJojMTnnQ3qZzzd")

public_url = ngrok.connect(5000)
print(f"\n🌐 Your API is now available at: {public_url}")
print(f"🔗 Use this URL in your frontend: {public_url}/analyze")
print("\n📋 Next steps:")
print("1. Copy the URL above")
print("2. Update your frontend with this URL")
print("3. Start your Next.js frontend")
print("4. Upload CSV files through the frontend!")
print("\n⚠ Keep this cell running to keep the API active!")

app.run(host='0.0.0.0', port=5000, debug=False)