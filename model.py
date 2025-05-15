import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
import pickle

# Sample dataset
data = {'text': ['I love this product', 'This is terrible', 'Amazing quality', 'Worst experience'],
        'sentiment': ['positive', 'negative', 'positive', 'negative']}
df = pd.DataFrame(data)

# Convert text to numerical features
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(df['text'])
y = df['sentiment']

# Train a simple Naive Bayes model
model = MultinomialNB()
model.fit(X, y)

# Save the model
pickle.dump(model, open('sentiment_model.pkl', 'wb'))
pickle.dump(vectorizer, open('vectorizer.pkl', 'wb'))
