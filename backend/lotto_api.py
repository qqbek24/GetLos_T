"""
Lotto.pl API Client
Official API documentation: https://developers.lotto.pl/
"""
import httpx
import os
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

LOTTO_API_BASE_URL = "https://developers.lotto.pl/api/open/v1"
LOTTO_API_SECRET = os.getenv("LOTTO_API_SECRET_KEY", "")


class LottoAPIError(Exception):
    """Custom exception for Lotto API errors"""
    pass


async def get_last_results_for_lotto(limit: int = 10) -> List[Dict]:
    """
    Fetch the latest Lotto results from the official API
    
    Args:
        limit: Number of recent results to fetch (default 10)
    
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
    # Note: API might not support 'limit' parameter
    # If it fails, it will return only the last result per game type
    params = {
        "gameType": "Lotto"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=headers, params=params)
            
            # Log the request for debugging
            print(f"Lotto API Request: {url}")
            print(f"Params: {params}")
            print(f"Status: {response.status_code}")
            
            if response.status_code == 401:
                raise LottoAPIError("Unauthorized: Invalid API key")
            elif response.status_code == 404:
                print(f"API returned 404: {response.text}")
                return []  # No results found
            elif response.status_code != 200:
                error_text = response.text
                print(f"API Error Response: {error_text}")
                raise LottoAPIError(f"API request failed with status {response.status_code}: {error_text}")
            
            data = response.json()
            print(f"API returned data type: {type(data)}, length: {len(data) if isinstance(data, list) else 'N/A'}")
            return data if isinstance(data, list) else [data]
            
    except httpx.RequestError as e:
        raise LottoAPIError(f"Network error while fetching from Lotto API: {str(e)}")


async def get_results_by_date_range(
    date_from: datetime,
    date_to: Optional[datetime] = None
) -> List[Dict]:
    """
    Fetch Lotto results starting from a specific date
    
    Args:
        date_from: Start date (will fetch all draws from this date onwards)
        date_to: End date (optional, defaults to now, used for limiting results)
    
    Returns:
        List of draw results sorted by date (newest first)
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
    
    all_results = []
    
    # API uses pagination, fetch all pages
    # Start from page 1, get 100 results per page
    params = {
        "gameType": "Lotto",
        "drawDate": date_from.strftime("%Y-%m-%d"),  # Format: YYYY-MM-DD
        "index": 1,      # Page number (starts at 1)
        "size": 100,     # Results per page
        "sort": "drawDate",  # Sort by draw date
        "order": "DESC"      # Newest first
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=headers, params=params)
            
            if response.status_code == 401:
                raise LottoAPIError("Unauthorized: Invalid API key")
            elif response.status_code == 404:
                return []
            elif response.status_code != 200:
                raise LottoAPIError(f"API request failed with status {response.status_code}: {response.text}")
            
            data = response.json()
            
            # API may return single object or list
            if isinstance(data, list):
                all_results.extend(data)
            elif isinstance(data, dict):
                # Check if it's paginated response with 'items' field
                if 'items' in data:
                    all_results.extend(data['items'])
                else:
                    all_results.append(data)
            
            return all_results
            
    except httpx.RequestError as e:
        raise LottoAPIError(f"Network error: {str(e)}")


async def fetch_multiple_draws_by_dates(start_date: datetime, end_date: datetime) -> List[Dict]:
    """
    Fetch multiple lottery draws by generating draw dates
    
    Lotto draws happen on: Tuesday, Thursday, Saturday at 21:00
    This function generates all draw dates in the range and fetches them.
    
    Args:
        start_date: Starting date
        end_date: Ending date
    
    Returns:
        List of all draw results in the date range
    """
    if not LOTTO_API_SECRET or LOTTO_API_SECRET == "your_api_key_here":
        raise LottoAPIError("LOTTO_API_SECRET_KEY not configured")
    
    # Draw days: Tuesday=1, Thursday=3, Saturday=5
    draw_weekdays = {1, 3, 5}
    
    all_draws = []
    current = start_date
    
    url = f"{LOTTO_API_BASE_URL}/lotteries/draw-results/by-date-per-game"
    headers = {
        "accept": "application/json",
        "secret": LOTTO_API_SECRET
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        while current <= end_date:
            # Check if this day is a draw day
            if current.weekday() in draw_weekdays:
                params = {
                    "gameType": "Lotto",
                    "drawDate": current.strftime("%Y-%m-%d"),
                    "index": 1,
                    "size": 10,
                    "sort": "drawDate",
                    "order": "DESC"
                }
                
                try:
                    response = await client.get(url, headers=headers, params=params)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if isinstance(data, dict) and 'items' in data:
                            all_draws.extend(data['items'])
                        elif isinstance(data, list):
                            all_draws.extend(data)
                        elif isinstance(data, dict):
                            all_draws.append(data)
                    elif response.status_code != 404:
                        print(f"Warning: Failed to fetch draw for {current.strftime('%Y-%m-%d')}: {response.status_code}")
                
                except httpx.RequestError as e:
                    print(f"Warning: Network error for {current.strftime('%Y-%m-%d')}: {e}")
            
            # Move to next day
            current += timedelta(days=1)
    
    return all_draws


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
        # Skip if this is not a main Lotto game (e.g., LottoPlus)
        game_type = draw_data.get("gameType", "")
        if game_type != "Lotto":
            return None
        
        # Extract main numbers from results
        results = draw_data.get("results", [])
        if not results:
            return None
        
        # Get numbers from resultsJson field (API structure)
        numbers = []
        for result in results:
            if isinstance(result, dict):
                # Try resultsJson first (new API format)
                nums = result.get("resultsJson", [])
                if not nums:
                    # Fallback to numbers field (old format)
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
