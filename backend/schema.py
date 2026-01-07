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
        if any(n < 1 or n > 52 for n in v):
            raise ValueError("All numbers must be in range 1-52")
        
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
    strategy: Literal["random", "hot", "cold", "balanced", "combo_based"] = "random"
    count: int = Field(default=1, ge=1, le=10)


class UploadResponse(BaseModel):
    """Response after CSV upload"""
    success: bool
    total_processed: int
    new_draws: int
    duplicates: int
    message: str


# Strategy type
Strategy = Literal["random", "hot", "cold", "balanced", "combo_based"]
