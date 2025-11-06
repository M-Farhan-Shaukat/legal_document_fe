import { NextResponse } from 'next/server';

/**
 * API endpoint for logging client-side errors
 * POST /api/log-error
 */
export async function POST(request) {
  try {
    const errorData = await request.json();
    
    // Validate required fields
    if (!errorData.message) {
      return NextResponse.json(
        { error: 'Error message is required' },
        { status: 400 }
      );
    }

    // Add server-side timestamp
    const logEntry = {
      ...errorData,
      serverTimestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // Log to console (in development) or your logging service
    if (process.env.NODE_ENV === 'development') {
      console.log('🚨 Client Error Logged:', logEntry);
    }

    // Here you can integrate with your preferred logging service:
    // - Send to your database
    // - Send to external services like Sentry, LogRocket, etc.
    // - Send to your monitoring system
    
    // Example integrations:
    
    // 1. Save to database (uncomment and modify as needed)
    // await saveErrorToDatabase(logEntry);
    
    // 2. Send to Sentry (uncomment and configure)
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureException(new Error(errorData.message), {
    //     extra: logEntry
    //   });
    // }
    
    // 3. Send to external logging service
    // if (process.env.EXTERNAL_LOG_ENDPOINT) {
    //   await fetch(process.env.EXTERNAL_LOG_ENDPOINT, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(logEntry)
    //   });
    // }

    return NextResponse.json({ 
      success: true, 
      message: 'Error logged successfully',
      id: generateErrorId()
    });

  } catch (error) {
    console.error('Failed to log client error:', error);
    
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}

/**
 * Generate a unique error ID for tracking
 */
function generateErrorId() {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Example function to save error to database
 * Uncomment and modify based on your database setup
 */
// async function saveErrorToDatabase(errorData) {
//   // Example with Prisma
//   // return await prisma.errorLog.create({
//   //   data: {
//   //     message: errorData.message,
//   //     stack: errorData.stack,
//   //     url: errorData.url,
//   //     userAgent: errorData.userAgent,
//   //     timestamp: new Date(errorData.timestamp),
//   //     metadata: JSON.stringify(errorData)
//   //   }
//   // });
//   
//   // Example with MongoDB
//   // const { MongoClient } = require('mongodb');
//   // const client = new MongoClient(process.env.MONGODB_URI);
//   // const db = client.db('your_database');
//   // return await db.collection('error_logs').insertOne(errorData);
// }
