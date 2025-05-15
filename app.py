from flask import Flask, render_template, request, jsonify
from nltk.sentiment import SentimentIntensityAnalyzer
from transformers import pipeline
import nltk
import pandas as pd
import os
from deep_translator import GoogleTranslator

nltk.download('vader_lexicon')

app = Flask(__name__)

# Initialize models
sia = SentimentIntensityAnalyzer()
classifier = pipeline('sentiment-analysis')

# Hybrid Sentiment Detection Function
def hybrid_sentiment_analysis(text):
    score = sia.polarity_scores(text)['compound']
    if -0.2 < score < 0.2:  # If VADER is unsure, use BERT
        result = classifier(text)[0]
        label = result['label']
        return ("Positive 🙂", "positive") if label == "POSITIVE" else ("Negative 🙁", "negative")
    else:
        if score >= 0.5:
            return "Strongly Positive 😊", "positive"
        elif 0 < score < 0.5:
            return "Positive 🙂", "positive"
        elif score == 0:
            return "Neutral 😐", "neutral"
        elif -0.5 < score < 0:
            return "Negative 🙁", "negative"
        else:
            return "Strongly Negative 😡", "negative"

@app.route('/')
def home():
    return render_template('index.html')

# Individual Sentiment Analysis
@app.route('/analyze', methods=['POST'])
def analyze():
    text = request.form['text']
    sentences = [sentence.strip() for sentence in text.split('\n') if sentence.strip()]
    sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
    grouped_results = {
        "Strongly Positive 😊": [], "Positive 🙂": [], 
        "Neutral 😐": [], "Negative 🙁": [], "Strongly Negative 😡": []
    }

    for sentence in sentences:
        translated_text = GoogleTranslator(source='auto', target='en').translate(sentence)
        sentiment, category = hybrid_sentiment_analysis(translated_text)
        sentiment_counts[category] += 1
        grouped_results[sentiment].append(sentence)

    total = sum(sentiment_counts.values())
    percentages = {k: round((v / total) * 100, 2) if total > 0 else 0 for k, v in sentiment_counts.items()}

    overall_sentiment = "Neutral"
    if sentiment_counts["positive"] > sentiment_counts["negative"]:
        overall_sentiment = "Very Good"
    elif sentiment_counts["negative"] > sentiment_counts["positive"]:
        overall_sentiment = "Bad"

    return jsonify({
        "grouped_results": grouped_results,
        "summary": sentiment_counts,
        "percentages": percentages,
        "overall": overall_sentiment
    })

# Bulk Sentiment Analysis (CSV Upload)
@app.route('/bulk-analyze', methods=['POST'])
def bulk_analyze():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    file_path = os.path.join("uploads", file.filename)
    file.save(file_path)
    df = pd.read_csv(file_path)

    if 'text' not in df.columns:
        return jsonify({"error": "CSV must have a 'text' column"}), 400

    sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
    grouped_results = {
        "Strongly Positive 😊": [], "Positive 🙂": [], 
        "Neutral 😐": [], "Negative 🙁": [], "Strongly Negative 😡": []
    }

    for _, row in df.iterrows():
        text = str(row['text'])
        sentiment, category = hybrid_sentiment_analysis(text)
        sentiment_counts[category] += 1
        grouped_results[sentiment].append(text)

    total = sum(sentiment_counts.values())
    percentages = {k: round((v / total) * 100, 2) if total > 0 else 0 for k, v in sentiment_counts.items()}

    overall_sentiment = "Neutral"
    if sentiment_counts["positive"] > sentiment_counts["negative"]:
        overall_sentiment = "Very Good"
    elif sentiment_counts["negative"] > sentiment_counts["positive"]:
        overall_sentiment = "Bad"

    return jsonify({
        "grouped_results": grouped_results,
        "summary": sentiment_counts,
        "percentages": percentages,
        "overall": overall_sentiment
    })

if __name__ == '__main__':
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
    app.run(debug=True)

























































































# Old 2 code

# from flask import Flask, render_template, request, jsonify
# from nltk.sentiment import SentimentIntensityAnalyzer
# from transformers import pipeline
# import nltk
# import pandas as pd
# import os
# from deep_translator import GoogleTranslator

# nltk.download('vader_lexicon')

# app = Flask(__name__)

# # Initialize models
# sia = SentimentIntensityAnalyzer()
# classifier = pipeline('sentiment-analysis')

# # Hybrid Function: VADER + BERT fallback
# def hybrid_sentiment_analysis(text):
#     score = sia.polarity_scores(text)['compound']
#     if -0.2 < score < 0.2:
#         result = classifier(text)[0]
#         label = result['label']
#         if label == "POSITIVE":
#             return "Positive 🙂", "positive"
#         else:
#             return "Negative 🙁", "negative"
#     else:
#         if score >= 0.5:
#             return "Strongly Positive 😊", "positive"
#         elif 0 < score < 0.5:
#             return "Positive 🙂", "positive"
#         elif score == 0:
#             return "Neutral 😐", "neutral"
#         elif -0.5 < score < 0:
#             return "Negative 🙁", "negative"
#         else:
#             return "Strongly Negative 😡", "negative"

# # Home Page
# @app.route('/')
# def home():
#     return render_template('index.html')

# # Individual Sentiment Analysis
# @app.route('/analyze', methods=['POST'])
# def analyze():
#     text = request.form['text']
#     sentences = [sentence.strip() for sentence in text.split('\n') if sentence.strip()]
    
#     sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
#     grouped_results = {"Strongly Positive 😊": [], "Positive 🙂": [], "Neutral 😐": [], "Negative 🙁": [], "Strongly Negative 😡": []}

#     for sentence in sentences:
#         translated_text = GoogleTranslator(source='auto', target='en').translate(sentence)
#         sentiment, category = hybrid_sentiment_analysis(translated_text)
#         sentiment_counts[category] += 1
#         grouped_results[sentiment].append(sentence)

#     total = sum(sentiment_counts.values())
#     percentages = {key: round((value / total) * 100, 2) if total > 0 else 0 for key, value in sentiment_counts.items()}

#     overall_sentiment = "Neutral"
#     if sentiment_counts["positive"] > sentiment_counts["negative"]:
#         overall_sentiment = "Very Good"
#     elif sentiment_counts["negative"] > sentiment_counts["positive"]:
#         overall_sentiment = "Bad"

#     return jsonify({
#         "grouped_results": grouped_results,
#         "summary": sentiment_counts,
#         "percentages": percentages,
#         "overall": overall_sentiment
#     })

# # Bulk Sentiment Analysis (CSV Upload)
# @app.route('/bulk-analyze', methods=['POST'])
# def bulk_analyze():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file uploaded"}), 400

#     file = request.files['file']
#     if file.filename == '':
#         return jsonify({"error": "No selected file"}), 400

#     file_path = os.path.join("uploads", file.filename)
#     file.save(file_path)
#     df = pd.read_csv(file_path)

#     if 'text' not in df.columns:
#         return jsonify({"error": "CSV must have a 'text' column"}), 400

#     sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
#     grouped_results = {"Strongly Positive 😊": [], "Positive 🙂": [], "Neutral 😐": [], "Negative 🙁": [], "Strongly Negative 😡": []}

#     for _, row in df.iterrows():
#         text = str(row['text'])
#         sentiment, category = hybrid_sentiment_analysis(text)
#         sentiment_counts[category] += 1
#         grouped_results[sentiment].append(text)

#     total = sum(sentiment_counts.values())
#     percentages = {key: round((value / total) * 100, 2) if total > 0 else 0 for key, value in sentiment_counts.items()}

#     overall_sentiment = "Neutral"
#     if sentiment_counts["positive"] > sentiment_counts["negative"]:
#         overall_sentiment = "Very Good"
#     elif sentiment_counts["negative"] > sentiment_counts["positive"]:
#         overall_sentiment = "Bad"

#     return jsonify({
#         "grouped_results": grouped_results,
#         "summary": sentiment_counts,
#         "percentages": percentages,
#         "overall": overall_sentiment
#     })

# if __name__ == '__main__':
#     if not os.path.exists("uploads"):
#         os.makedirs("uploads")
#     app.run(debug=True)





# OLD COde

# from flask import Flask, render_template, request, jsonify
# from nltk.sentiment import SentimentIntensityAnalyzer
# from transformers import pipeline
# import nltk
# import pandas as pd
# import os
# from deep_translator import GoogleTranslator

# nltk.download('vader_lexicon')

# app = Flask(__name__)
# sia = SentimentIntensityAnalyzer()

# # Home Page
# @app.route('/')
# def home():
#     return render_template('index.html')

# # Function to categorize sentiment
# def categorize_sentiment(score):
#     if score >= 0.5:
#         return "Strongly Positive 😊", "positive"
#     elif 0 < score < 0.5:
#         return "Positive 🙂", "positive"
#     elif score == 0:
#         return "Neutral 😐", "neutral"
#     elif -0.5 < score < 0:
#         return "Negative 🙁", "negative"
#     else:
#         return "Strongly Negative 😡", "negative"

# # Individual Sentiment Analysis
# @app.route('/analyze', methods=['POST'])
# def analyze():
#     text = request.form['text']
    
#     # Split text into sentences
#     sentences = [sentence.strip() for sentence in text.split('\n') if sentence.strip()]
    
#     sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
#     grouped_results = {"Strongly Positive 😊": [], "Positive 🙂": [], "Neutral 😐": [], "Negative 🙁": [], "Strongly Negative 😡": []}

#     for sentence in sentences:
#      # Auto-detect and translate to English
#         translated_text = GoogleTranslator(source='auto', target='en').translate(sentence)
#         score = sia.polarity_scores(translated_text)['compound']
#         # score = sia.polarity_scores(sentence)['compound']
#         sentiment, category = categorize_sentiment(score)

#         sentiment_counts[category] += 1
#         grouped_results[sentiment].append(sentence)

#     # Calculate percentages
#     total = sum(sentiment_counts.values())
#     percentages = {key: round((value / total) * 100, 2) if total > 0 else 0 for key, value in sentiment_counts.items()}

#     # Determine overall sentiment
#     overall_sentiment = "Neutral"
#     if sentiment_counts["positive"] > sentiment_counts["negative"]:
#         overall_sentiment = "Very Good"
#     elif sentiment_counts["negative"] > sentiment_counts["positive"]:
#         overall_sentiment = "Bad"

#     return jsonify({"grouped_results": grouped_results, "summary": sentiment_counts, "percentages": percentages, "overall": overall_sentiment})

# # Bulk Sentiment Analysis (CSV Upload)
# @app.route('/bulk-analyze', methods=['POST'])
# def bulk_analyze():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file uploaded"}), 400

#     file = request.files['file']
#     if file.filename == '':
#         return jsonify({"error": "No selected file"}), 400

#     file_path = os.path.join("uploads", file.filename)
#     file.save(file_path)
#     df = pd.read_csv(file_path)

#     if 'text' not in df.columns:
#         return jsonify({"error": "CSV must have a 'text' column"}), 400

#     sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
#     grouped_results = {"Strongly Positive 😊": [], "Positive 🙂": [], "Neutral 😐": [], "Negative 🙁": [], "Strongly Negative 😡": []}

#     for _, row in df.iterrows():
#         text = str(row['text'])
#         # translated_text = GoogleTranslator(source='auto', target='en').translate(text)
#         # score = sia.polarity_scores(translated_text)['compound']
#         score = sia.polarity_scores(text)['compound']
#         sentiment, category = categorize_sentiment(score)

#         sentiment_counts[category] += 1
#         grouped_results[sentiment].append(text)

#     total = sum(sentiment_counts.values())
#     percentages = {key: round((value / total) * 100, 2) if total > 0 else 0 for key, value in sentiment_counts.items()}

#     overall_sentiment = "Neutral"
#     if sentiment_counts["positive"] > sentiment_counts["negative"]:
#         overall_sentiment = "Very Good"
#     elif sentiment_counts["negative"] > sentiment_counts["positive"]:
#         overall_sentiment = "Bad"

#     return jsonify({"grouped_results": grouped_results, "summary": sentiment_counts, "percentages": percentages, "overall": overall_sentiment})

# if __name__ == '__main__':
#     if not os.path.exists("uploads"):
#         os.makedirs("uploads")
#     app.run(debug=True)
