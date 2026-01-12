"""
Lotto.pl API Client
Official API documentation: https://developers.lotto.pl/
"""
import httpx
import os
from typing import List, Dict, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

LOTTO_API_BASE_URL = "https://developers.lotto.pl/api/open/v1"
LOTTO_API_SECRET = os.getenv("LOTTO_API_SECRET_KEY", "")


class LottoAPIError(Exception):
    """Custom exception for Lotto API errors"""
    pass


async def get_last_results_for_lotto() -> List[Dict]:
    """
    Fetch the latest Lotto results from the official API
    
    Returns:
        List of draw results with structure:
        [
            {
                "drawSystemId": 12345,
                "drawDate": "2024-01-15T21:40:00Z",
                "gameType": "Lotto",
                "results": [1, 5, 12, 23, 34, 45],
                ...
            }
        ]
    
    Raises:
        LottoAPIError: If API key is missing or request fails
    """
    if not LOTTO_API_SECRET or LOTTO_API_SECRET == "your_api_key_here":
        raise LottoAPIError(
            "LOTTO_API_SECRET_KEY not configured. "
            "Get your API key from kontakt@lotto.pl and add it to .env file"
        )
    
    url = f"{LOTTO_API_BASE_URL}/lotteries/draw-results/last-results-per-game"
    headers = {
        "accept": "application/json",
        "secret": LOTTO_API_SECRET
    }
    params = {
        "gameType": "Lotto"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=headers, params=params)
            
            if response.status_code == 401:
                raise LottoAPIError("Unauthorized: Invalid API key")
            elif response.status_code == 404:
                return []  # No results found
            elif response.status_code != 200:
                raise LottoAPIError(f"API request failed with status {response.status_code}: {response.text}")
            
            data = response.json()
            return data if isinstance(data, list) else [data]
            
    except httpx.RequestError as e:
        raise LottoAPIError(f"Network error while fetching from Lotto API: {str(e)}")


async def get_results_by_date_range(
    date_from: datetime,
    date_to: Optional[datetime] = None
) -> List[Dict]:
    """
    Fetch Lotto results for a specific date range
    
    Args:
        date_from: Start date
        date_to: End date (optional, defaults to now)
    
    Returns:
        List of draw results
    """
    if not LOTTO_API_SECRET or LOTTO_API_SECRET == "your_api_key_here":
        raise LottoAPIError(
            "LOTTO_API_SECRET_KEY not configured. "
            "Get your API key from kontakt@lotto.pl and add it to .env file"
        )
    
    if date_to is None:
        date_to = datetime.now()
    
    url = f"{LOTTO_API_BASE_URL}/lotteries/draw-results/by-date-per-game"
    headers = {
        "accept": "application/json",
        "secret": LOTTO_API_SECRET
    }
    
    results = []
    
    # Note: API requires specific draw dates, so this is a simplified version
    # You may need to iterate through dates or use different endpoints
    params = {
        "gameType": "Lotto",
        "drawDate": date_from.isoformat(),
        "index": 1,
        "size": 100,
        "sort": "drawDate",
        "order": "DESC"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=headers, params=params)
            
            if response.status_code == 401:
                raise LottoAPIError("Unauthorized: Invalid API key")
            elif response.status_code == 404:
                return []
            elif response.status_code != 200:
                raise LottoAPIError(f"API request failed with status {response.status_code}")
            
            data = response.json()
            return data if isinstance(data, list) else [data]
            
    except httpx.RequestError as e:
        raise LottoAPIError(f"Network error: {str(e)}")


def parse_lotto_draw(draw_data: Dict) -> Optional[Dict]:
    """
    Parse Lotto API response and extract relevant data
    
    Args:
        draw_data: Raw draw data from API
    
    Returns:
        Parsed draw with structure: {
            "numbers": [1, 5, 12, 23, 34, 45],
            "draw_date": "2024-01-15",
            "draw_system_id": 12345
        }
    """
    try:
        # Extract main numbers from results
        results = draw_data.get("results", [])
        if not results:
            return None
        
        # Lotto has main numbers (usually first 6)
        numbers = []
        for result in results:
            if isinstance(result, dict):
                nums = result.get("numbers", [])
                if nums and len(nums) >= 6:
                    numbers = nums[:6]
                    break
            elif isinstance(result, int):
                numbers.append(result)
        
        if len(numbers) < 6:
            return None
        
        # Sort and validate numbers
        numbers = sorted([int(n) for n in numbers])
        if any(n < 1 or n > 49 for n in numbers):
            return None
        
        # Extract date
        draw_date_str = draw_data.get("drawDate", "")
        if draw_date_str:
            # Convert ISO format to YYYY-MM-DD
            draw_date = datetime.fromisoformat(draw_date_str.replace('Z', '+00:00')).strftime("%Y-%m-%d")
        else:
            draw_date = None
        
        return {
            "numbers": numbers,
            "draw_date": draw_date,
            "draw_system_id": draw_data.get("drawSystemId")
        }
        
    except (ValueError, KeyError, TypeError) as e:
        print(f"Error parsing draw data: {e}")
        return None
