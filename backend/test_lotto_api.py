"""
Test script for Lotto.pl API integration
Run this to test your API key before using it in the application
"""
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import after loading env vars
from lotto_api import get_last_results_for_lotto, parse_lotto_draw, LottoAPIError


async def test_lotto_api():
    """Test Lotto.pl API connection and key"""
    
    print("=" * 60)
    print("🧪 Test połączenia z API Lotto.pl")
    print("=" * 60)
    print()
    
    # Check if API key is configured
    api_key = os.getenv("LOTTO_API_SECRET_KEY", "")
    
    if not api_key or api_key == "your_api_key_here":
        print("❌ BŁĄD: LOTTO_API_SECRET_KEY nie jest skonfigurowany!")
        print()
        print("Aby uzyskać klucz API:")
        print("1. Napisz na: kontakt@lotto.pl")
        print("2. Dodaj klucz do pliku backend/.env")
        print("3. Uruchom ten skrypt ponownie")
        print()
        return
    
    print(f"✅ Znaleziono klucz API: {api_key[:10]}...{api_key[-10:]}")
    print()
    print("📡 Próba połączenia z API Lotto.pl...")
    print()
    
    try:
        # Fetch last results
        results = await get_last_results_for_lotto()
        
        if not results:
            print("⚠️  Brak wyników z API (może nie było ostatnich losowań)")
            return
        
        print(f"✅ Pobrano {len(results)} losowanie(ń)")
        print()
        
        # Parse and display results
        for i, draw_data in enumerate(results[:3], 1):  # Show max 3 results
            print(f"--- Losowanie {i} ---")
            
            parsed = parse_lotto_draw(draw_data)
            
            if parsed:
                print(f"📅 Data: {parsed['draw_date']}")
                print(f"🎱 Liczby: {', '.join(map(str, parsed['numbers']))}")
                print(f"🔑 ID: {parsed['draw_system_id']}")
            else:
                print("⚠️  Nie udało się sparsować danych")
                print(f"Raw data: {draw_data}")
            
            print()
        
        print("=" * 60)
        print("✅ Test zakończony pomyślnie!")
        print("=" * 60)
        print()
        print("Możesz teraz użyć przycisku 'Synchronizuj z Lotto.pl' w aplikacji.")
        
    except LottoAPIError as e:
        print("❌ BŁĄD API:")
        print(f"   {str(e)}")
        print()
        
        if "Unauthorized" in str(e):
            print("💡 Możliwe przyczyny:")
            print("   - Nieprawidłowy klucz API")
            print("   - Klucz wygasł lub został dezaktywowany")
            print("   - Sprawdź czy klucz w .env jest prawidłowy")
        elif "Network error" in str(e):
            print("💡 Możliwe przyczyny:")
            print("   - Brak połączenia z internetem")
            print("   - API Lotto.pl jest niedostępne")
            print("   - Firewall blokuje połączenie")
        
        print()
    
    except Exception as e:
        print(f"❌ Nieoczekiwany błąd: {str(e)}")
        print()


if __name__ == "__main__":
    asyncio.run(test_lotto_api())
