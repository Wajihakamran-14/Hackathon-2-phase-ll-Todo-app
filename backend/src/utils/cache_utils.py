from typing import Dict, Optional, Any
from datetime import datetime, timedelta
import asyncio
import threading


class SimpleCache:
    """
    A simple in-memory cache with TTL (Time To Live) for caching frequently accessed data.
    Thread-safe implementation for use in async environments.
    """

    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        """
        Get a value from the cache if it exists and hasn't expired.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found or expired
        """
        with self._lock:
            if key in self._cache:
                entry = self._cache[key]
                if datetime.now() < entry['expires_at']:
                    return entry['value']
                else:
                    # Entry has expired, remove it
                    del self._cache[key]
        return None

    def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None:
        """
        Set a value in the cache with TTL.

        Args:
            key: Cache key
            value: Value to cache
            ttl_seconds: Time to live in seconds (default 5 minutes)
        """
        with self._lock:
            expires_at = datetime.now() + timedelta(seconds=ttl_seconds)
            self._cache[key] = {
                'value': value,
                'expires_at': expires_at
            }

    def delete(self, key: str) -> bool:
        """
        Delete a key from the cache.

        Args:
            key: Cache key to delete

        Returns:
            True if key existed and was deleted, False otherwise
        """
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False

    def clear(self) -> None:
        """Clear all entries from the cache."""
        with self._lock:
            self._cache.clear()

    def cleanup_expired(self) -> int:
        """
        Remove all expired entries from the cache.

        Returns:
            Number of expired entries removed
        """
        with self._lock:
            now = datetime.now()
            expired_keys = [
                key for key, entry in self._cache.items()
                if now >= entry['expires_at']
            ]

            for key in expired_keys:
                del self._cache[key]

            return len(expired_keys)


# Global cache instance
cache = SimpleCache()