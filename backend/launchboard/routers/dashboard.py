from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import DashboardStats
from crud import get_dashboard_stats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardStats)
def dashboard(db: Session = Depends(get_db)):
    return get_dashboard_stats(db)
