import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

from backend.config import settings
from backend.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    HealthResponse,
)
from backend.services.analyzer import analyzer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s - %(message)s"
)
logger = logging.getLogger("offershield.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting OfferShield Backend API...")
    logger.info("Gemini AI Configured: %s", settings.is_ai_configured)
    logger.info("CORS Allowed Origins: %s", settings.CORS_ORIGINS)
    yield
    logger.info("OfferShield Backend API shutting down.")


app = FastAPI(
    title="OfferShield API",
    description="AI-Powered Fake Internship and Job Offer Scam Detector Backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration for Frontend Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Format clear 422/400 validation error responses."""
    errors = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        msg = err.get("msg", "Validation error")
        errors.append(f"{loc}: {msg}" if loc else msg)
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Invalid request payload",
            "details": errors
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Catch unhandled errors and return a safe 500 without leaking secrets."""
    logger.error("Unhandled error processing request: %s", type(exc).__name__, exc_info=False)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred while analyzing the offer. Please try again."
        }
    )


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    tags=["System"]
)
async def health_check():
    """Health check endpoint to verify backend status and AI readiness."""
    return HealthResponse(
        status="ok",
        version="1.0.0",
        ai_configured=settings.is_ai_configured
    )


@app.post(
    "/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Internship Offer",
    tags=["Analysis"]
)
async def analyze_offer(payload: AnalyzeRequest):
    """
    Analyze a plain text internship or job offer to detect potential scam warning signs.
    
    Returns overall risk level (SAFE, SUSPICIOUS, HIGH_RISK), specific indicators,
    an objective explanation, and recommended next actions.
    """
    try:
        response = await analyzer.analyze(payload.text)
        return response
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error("Error during offer analysis: %s", type(e).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete analysis. Please check your input."
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
