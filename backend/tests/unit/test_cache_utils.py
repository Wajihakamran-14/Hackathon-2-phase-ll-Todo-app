import pytest
from datetime import datetime, timedelta
from unittest.mock import patch
from src.utils.cache_utils import SimpleCache


class TestSimpleCache:
    """Unit tests for SimpleCache utility"""

    def test_set_and_get_value(self):
        """Test setting and getting a value from cache"""
        cache = SimpleCache()

        cache.set("key1", "value1")
        result = cache.get("key1")

        assert result == "value1"

    def test_get_nonexistent_key(self):
        """Test getting a non-existent key returns None"""
        cache = SimpleCache()

        result = cache.get("nonexistent_key")

        assert result is None

    def test_cache_expiration(self):
        """Test that cache values expire after TTL"""
        cache = SimpleCache()

        # Mock datetime to simulate time passing
        with patch('src.utils.cache_utils.datetime') as mock_datetime:
            # Set a value with 1-second TTL
            cache.set("expiring_key", "expiring_value", ttl_seconds=1)

            # Simulate time before expiration
            mock_datetime.now.return_value = datetime.now() + timedelta(seconds=0.5)
            result_before = cache.get("expiring_key")
            assert result_before == "expiring_value"

            # Simulate time after expiration
            mock_datetime.now.return_value = datetime.now() + timedelta(seconds=2)
            result_after = cache.get("expiring_key")
            assert result_after is None

    def test_delete_key(self):
        """Test deleting a key from cache"""
        cache = SimpleCache()

        cache.set("key_to_delete", "value_to_delete")
        assert cache.get("key_to_delete") == "value_to_delete"

        result = cache.delete("key_to_delete")
        assert result is True

        result = cache.get("key_to_delete")
        assert result is None

    def test_delete_nonexistent_key(self):
        """Test deleting a non-existent key returns False"""
        cache = SimpleCache()

        result = cache.delete("nonexistent_key")
        assert result is False

    def test_clear_cache(self):
        """Test clearing all cache entries"""
        cache = SimpleCache()

        cache.set("key1", "value1")
        cache.set("key2", "value2")

        assert cache.get("key1") == "value1"
        assert cache.get("key2") == "value2"

        cache.clear()

        assert cache.get("key1") is None
        assert cache.get("key2") is None

    def test_cleanup_expired(self):
        """Test cleaning up expired entries"""
        cache = SimpleCache()

        # Add some expired entries
        with patch('src.utils.cache_utils.datetime') as mock_datetime:
            mock_datetime.now.return_value = datetime.now()
            cache.set("expired1", "val1", ttl_seconds=1)
            cache.set("expired2", "val2", ttl_seconds=1)

            # Advance time to make entries expire
            mock_datetime.now.return_value = datetime.now() + timedelta(seconds=2)

            # Add a non-expired entry
            cache.set("valid", "val3", ttl_seconds=10)

            # Cleanup should remove expired entries
            removed_count = cache.cleanup_expired()
            assert removed_count == 2

            # Valid entry should still exist
            assert cache.get("valid") == "val3"

            # Expired entries should be gone
            assert cache.get("expired1") is None
            assert cache.get("expired2") is None

    def test_ttl_seconds_parameter(self):
        """Test that TTL is properly applied"""
        cache = SimpleCache()

        # Set a value with specific TTL
        cache.set("key_with_ttl", "value", ttl_seconds=10)
        result = cache.get("key_with_ttl")
        assert result == "value"