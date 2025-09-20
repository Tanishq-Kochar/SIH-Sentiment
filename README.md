# SIH Sentiment Analysis Platform

A comprehensive sentiment analysis platform for eConsultation analysis, built with Next.js frontend and Python FastAPI backend.

## Features

- **CSV File Upload**: Drag and drop interface for uploading stakeholder comments
- **AI-Powered Sentiment Analysis**: Uses RoBERTa model for accurate sentiment classification
- **Text Summarization**: Automatic summarization of comments using MEETING_SUMMARY model
- **Urgency Detection**: Zero-shot classification to identify critical, moderate, and minor issues
- **Word Cloud Visualization**: Interactive word cloud generation from sentiment words
- **Comprehensive Analytics**: Detailed charts and statistics for sentiment and urgency analysis
- **Modern UI**: Built with Next.js, TypeScript, and Tailwind CSS

## Project Structure

```
SIH-Sentiment/
├── app/                    # Next.js app directory
│   ├── api/analyze/       # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── analysis-results.tsx
│   ├── file-upload.tsx
│   ├── header.tsx
│   └── ui/               # UI components
├── backend/              # Python FastAPI backend
│   ├── main.py          # FastAPI server
│   ├── requirements.txt # Python dependencies
│   └── start_backend.py # Startup script
└── public/              # Static assets
```

## Prerequisites

- **Node.js** (version 18 or higher)
- **Python** (version 3.8 or higher)
- **pnpm** package manager

## Quick Start

### 1. Install Frontend Dependencies

```bash
cd SIH-Sentiment
pnpm install
```

### 2. Start the Backend Server

```bash
cd backend
python start_backend.py
```

The backend will:
- Install all required Python dependencies
- Download necessary ML models (this may take a few minutes on first run)
- Start the FastAPI server on `http://localhost:8000`

### 3. Start the Frontend

In a new terminal:

```bash
cd SIH-Sentiment
pnpm dev
```

The frontend will be available at `http://localhost:3000`

## Usage

1. **Upload CSV File**: 
   - Ensure your CSV has a column named 'review' (or 'comment', 'comments', 'text', 'feedback', 'response')
   - Drag and drop your CSV file or click to browse

2. **View Analysis Results**:
   - **Sentiment Overview**: See distribution of positive, negative, and neutral comments
   - **Urgency Analysis**: Identify critical, moderate, and minor issues
   - **Word Cloud**: Visual representation of key sentiment words
   - **Comment Summaries**: AI-generated summaries with sentiment and urgency scores

## API Endpoints

### Backend (FastAPI)

- `GET /` - Health check
- `POST /analyze` - Analyze CSV file and return comprehensive results

### Frontend (Next.js)

- `POST /api/analyze` - Proxy endpoint that forwards requests to Python backend

## Data Structure

The analysis returns the following data structure:

```typescript
{
  sentimentAnalysis: {
    positive: number,
    negative: number,
    neutral: number,
    totalComments: number
  },
  summaries: Array<{
    id: string,
    originalComment: string,
    summary: string,
    sentiment: "positive" | "negative" | "neutral",
    sentimentScore: number,
    urgency: string
  }>,
  wordCloud: {
    image: string,  // Base64 encoded PNG
    format: "base64"
  },
  urgencyAnalysis: {
    critical: number,
    moderate: number,
    minor: number,
    notApplicable: number
  },
  averageSentimentScore: number
}
```

## Models Used

- **Sentiment Analysis**: `cardiffnlp/twitter-roberta-base-sentiment-latest`
- **Text Summarization**: `knkarthick/MEETING_SUMMARY`
- **Urgency Classification**: `facebook/bart-large-mnli`
- **Word Cloud**: NLTK opinion lexicon + VADER sentiment analysis

## Development

### Frontend Development

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run linter
```

### Backend Development

```bash
cd backend
python main.py    # Start FastAPI server directly
```

## Troubleshooting

### Common Issues

1. **Model Download Issues**: 
   - Ensure stable internet connection
   - Models are downloaded on first run and cached locally

2. **Memory Issues**:
   - Large CSV files may require more RAM
   - Consider processing in batches for very large datasets

3. **CORS Issues**:
   - Backend is configured to allow requests from `http://localhost:3000`
   - Update CORS settings in `backend/main.py` if needed

### Performance Tips

- Models are loaded once at startup
- Word cloud generation may take time for large datasets
- Consider using GPU acceleration for faster processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Smart India Hackathon (SIH) 2025.

## Support

For issues and questions, please create an issue in the repository or contact the development team.
