"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field, field_validator
from typing import Literal, List, Optional
from datetime import datetime


class Numbers(BaseModel):
    """Schema for 6 numbers validation"""
    numbers: List[int] = Field(..., min_length=6, max_length=6)
    
    @field_validator("numbers")
    @classmethod
    def validate_numbers(cls, v):
        # Check range
        if any(n < 1 or n > 49 for n in v):
            raise ValueError("All numbers must be in range 1-49")
        
        # Check uniqueness
        if len(set(v)) != 6:
            raise ValueError("All numbers must be unique")
        
        return sorted(v)


class Stats(BaseModel):
    """Statistics about historical draws"""
    total_draws: int
    total_picks: int
    coverage_pct: float
    freq: List[int]  # frequency array, index 0 = number 1, etc.
    min_sum: int
    max_sum: int
    avg_sum: float
    most_frequent: List[tuple[int, int]]  # [(number, count), ...]
    least_frequent: List[tuple[int, int]]


class DrawResponse(BaseModel):
    """Response for single draw"""
    id: int
    numbers: List[int]
    key: str
    created_at: datetime
    source: Optional[str] = None
    
    class Config:
        from_attributes = True


class PickResponse(BaseModel):
    """Response for single pick"""
    id: int
    numbers: List[int]
    key: str
    strategy: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class GenerateRequest(BaseModel):
    """Request to generate new pick"""
    strategy: Literal["random", "hot", "cold", "balanced", "combo_based", "ai"] = "random"
    count: int = Field(default=1, ge=1, le=10)


class UploadResponse(BaseModel):
    """Response after CSV upload"""
    success: bool
    total_processed: int
    new_draws: int
    duplicates: int
    message: str


class SyncLottoResponse(BaseModel):
    """Response after syncing with Lotto.pl API"""
    success: bool
    new_draws: int
    latest_draw_date: Optional[str] = None
    message: str
    error: Optional[str] = None


class ManualDrawRequest(BaseModel):
    """Request to manually add draw(s)"""
    draws: List[dict] = Field(..., min_length=1)  # [{"numbers": [1,2,3,4,5,6], "date": "2024-01-15"}]
    
    @field_validator("draws")
    @classmethod
    def validate_draws(cls, v):
        for draw in v:
            # Validate numbers
            if "numbers" not in draw:
                raise ValueError("Each draw must have 'numbers' field")
            
            numbers = draw["numbers"]
            if not isinstance(numbers, list) or len(numbers) != 6:
                raise ValueError("Each draw must have exactly 6 numbers")
            
            if any(n < 1 or n > 49 for n in numbers):
                raise ValueError("All numbers must be in range 1-49")
            
            if len(set(numbers)) != 6:
                raise ValueError("All numbers must be unique")
            
            # Date is optional but must be valid format if provided
            if "date" in draw and draw["date"]:
                date_str = draw["date"]
                if not isinstance(date_str, str):
                    raise ValueError("Date must be a string")
        
        return v


class BackupResponse(BaseModel):
    """Response after backup/restore operation"""
    success: bool
    count: int
    message: str
    error: Optional[str] = None


# Strategy type
Strategy = Literal["random", "hot", "cold", "balanced", "combo_based", "ai"]
