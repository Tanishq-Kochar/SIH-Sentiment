from transformers import pipeline
import pandas as pd
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from nltk.corpus import opinion_lexicon
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk, re

# Load the classification pipeline with the specified model
pipe = pipeline("text-classification", model="cardiffnlp/twitter-roberta-base-sentiment-latest")

# Classify a new sentence
sentence = "I love this product! It's amazing and works perfectly."
result = pipe(sentence)

# Print the result
print(result)

def sentiment(Review):
  try:
    res = pipe(Review)  # truncate long text
    return res["label"], round(res["score"], 2)
  except:
    return "No Comment provided"

rev = pd.read_csv('reviews.csv')
rev['ratings'] = rev['review'].apply(lambda x: sentiment(x))


nltk.download('opinion_lexicon')
nltk.download('vader_lexicon')

# Load reviews


# Join all reviews into one string and clean
text = " ".join(rev["review"].astype(str)).lower()
text_clean = re.sub(r"[^a-z\s]", "", text)

# Get opinion words (positive + negative)
pos_words = set(opinion_lexicon.positive())
neg_words = set(opinion_lexicon.negative())
all_sentiment_words = pos_words.union(neg_words)

# Keep only words that are in opinion lexicon
sentiment_tokens = [w for w in text_clean.split() if w in all_sentiment_words]

# Filter with VADER for strong sentiment words
sia = SentimentIntensityAnalyzer()
filtered_tokens = [
    w for w in sentiment_tokens 
    if abs(sia.polarity_scores(w)["compound"]) >= 0.41
]

# Convert back to text for wordcloud
sentiment_text = " ".join(filtered_tokens)


wc = WordCloud(
    width=1000, height=600,
    background_color="white",
    colormap="viridis",
    prefer_horizontal=0.9,
    max_words=80,
    min_font_size=12,
    contour_color="black", contour_width=1,
    relative_scaling=0.5,
    normalize_plurals=True
).generate(sentiment_text)


plt.figure(figsize=(12, 7))
plt.imshow(wc, interpolation="bilinear")
plt.axis("off")
plt.show()

summarizer = pipeline("summarization",model="knkarthick/MEETING_SUMMARY")

def Summary(Text):
  try:
    return summarizer(Text)
  except:
    return "No Comment"

rev['summaries'] = rev['review'].apply(lambda x: Summary(x))

urgency_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# ----------------------------
# 3. Define Labels
# ----------------------------
urgency_labels = ["critical", "moderate", "minor"]

# ----------------------------
# 4. Functions
# ----------------------------


def detect_urgency(text, sentiment_label):
    # if positive, no urgency
    if sentiment_label == "POSITIVE":
        return "Not Applicable"
    
    # clean text
    text = re.sub(r"[^a-zA-Z0-9\s]", "", str(text))
    if not text.strip():
        return "minor"

    result = urgency_classifier(text, urgency_labels)
    return result["labels"][0]  # best match

# ----------------------------
# 5. Apply on comments
# ----------------------------
sentiments = rev["review"].apply(lambda x: sentiment(x))
rev["sentiment"] = sentiments.apply(lambda x: x[0])
rev["sentiment_score"] = sentiments.apply(lambda x: round(x[1], 2))

rev["urgency"] = rev.apply(lambda row: detect_urgency(row["review"], row["sentiment"]), axis=1)

# ----------------------------
# 6. Save / View Results
# ----------------------------