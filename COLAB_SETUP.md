# 🚀 SIH Sentiment Analysis - Colab + Frontend Setup

## ⚡ **Quick Start (5 minutes total)**

### **Step 1: Setup Colab Backend (3 minutes)**

1. **Open Google Colab**: Go to [colab.research.google.com](https://colab.research.google.com)

2. **Upload the notebook**: 
   - Click "Upload" and select `colab_backend.ipynb`
   - Or create a new notebook and copy the code from the notebook

3. **Run all cells in order**:
   - Click "Runtime" → "Run all"
   - Wait for models to load (2-3 minutes)
   - **Copy the ngrok URL** from the last cell output

4. **Keep the last cell running** (don't stop it!)

### **Step 2: Update Frontend (1 minute)**

1. **Open** `app/api/analyze/route.ts`

2. **Replace the URL**:
   ```typescript
   // Change this line:
   const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "https://your-ngrok-url.ngrok.io/analyze"
   
   // To your actual ngrok URL:
   const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "https://abc123.ngrok.io/analyze"
   ```

3. **Save the file**

### **Step 3: Start Frontend (1 minute)**

```bash
# In your project directory
cd SIH-Sentiment
pnpm install
pnpm dev
```

4. **Open** `http://localhost:3000`

5. **Upload a CSV file** and see the magic! ✨

---

## 📋 **Detailed Instructions**

### **Colab Backend Setup**

#### **What the Colab notebook does:**
- ✅ Installs all required packages
- ✅ Downloads and loads ML models
- ✅ Creates a Flask API server
- ✅ Sets up ngrok tunnel for public access
- ✅ Processes CSV files with full ML analysis

#### **Expected output from Colab:**
```
🔄 Loading ML models... This may take a few minutes...
✅ Sentiment model loaded!
✅ Summarization model loaded!
✅ Urgency classification model loaded!
🎉 All models loaded successfully!

🚀 Starting Flask server...
📡 Setting up ngrok tunnel...

🌐 Your API is now available at: https://abc123.ngrok.io
🔗 Use this URL in your frontend: https://abc123.ngrok.io/analyze
```

### **Frontend Configuration**

#### **Option 1: Direct URL Update**
Edit `app/api/analyze/route.ts`:
```typescript
const pythonBackendUrl = "https://your-actual-ngrok-url.ngrok.io/analyze"
```

#### **Option 2: Environment Variable**
Create `.env.local`:
```bash
PYTHON_BACKEND_URL=https://your-actual-ngrok-url.ngrok.io/analyze
```

### **Testing the Connection**

1. **Test Colab API directly**:
   ```bash
   curl https://your-ngrok-url.ngrok.io/
   ```
   Should return: `{"message": "SIH Sentiment Analysis API is running!", "status": "healthy"}`

2. **Test with sample CSV**:
   - Create a CSV with a 'review' column
   - Upload through the frontend
   - Check Colab console for processing logs

---

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **1. Colab Session Timeout**
- **Problem**: Colab stops after 12 hours
- **Solution**: Re-run the last cell to restart the server

#### **2. ngrok URL Changes**
- **Problem**: URL changes each time you restart
- **Solution**: Update the frontend with the new URL

#### **3. CORS Errors**
- **Problem**: Frontend can't connect to Colab
- **Solution**: Make sure you're using the ngrok URL (https://) not localhost

#### **4. Model Loading Errors**
- **Problem**: Models fail to load
- **Solution**: Restart Colab runtime and run all cells again

#### **5. File Upload Issues**
- **Problem**: CSV upload fails
- **Solution**: Ensure CSV has a 'review' column (or 'comment', 'text', etc.)

### **Performance Tips:**

- **Keep Colab running**: Don't close the browser tab
- **Use smaller CSV files**: For faster processing
- **Check Colab logs**: Monitor the console for errors

---

## 📊 **What You Get**

### **Full ML Analysis:**
- ✅ **Sentiment Analysis**: RoBERTa model (85%+ accuracy)
- ✅ **Text Summarization**: BART model
- ✅ **Urgency Detection**: Zero-shot classification
- ✅ **Word Cloud**: Visual sentiment words
- ✅ **Comprehensive Analytics**: Charts and statistics

### **Real-time Processing:**
- ✅ **Live updates**: See processing in Colab console
- ✅ **Error handling**: Clear error messages
- ✅ **Progress tracking**: Know when analysis is complete

---

## 🎯 **For Demo/Presentation**

### **Before Demo:**
1. ✅ Run Colab notebook
2. ✅ Update frontend URL
3. ✅ Test with sample CSV
4. ✅ Keep Colab running

### **During Demo:**
1. ✅ Show the frontend interface
2. ✅ Upload a CSV file
3. ✅ Show real-time processing in Colab
4. ✅ Display comprehensive results

### **Backup Plan:**
- If Colab fails, use the lightweight local backend
- Keep both options ready

---

## 🚀 **Next Steps (After Demo)**

### **For Production:**
1. **Deploy to Google Cloud Run**: Permanent API
2. **Use Docker**: Containerized deployment
3. **Add authentication**: Secure the API
4. **Scale up**: Handle more requests

### **For Development:**
1. **Local setup**: Install models locally
2. **Database integration**: Store results
3. **Advanced features**: More analysis options
4. **UI improvements**: Enhanced visualizations

---

## 📞 **Support**

If you encounter any issues:
1. Check the Colab console for error messages
2. Verify the ngrok URL is correct
3. Ensure the frontend is pointing to the right URL
4. Test the API directly with curl

**Good luck with your demo! 🎉**
