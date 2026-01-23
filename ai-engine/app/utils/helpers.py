"""Utility helper functions."""

from typing import Any, Dict, Optional
import hashlib
import secrets


def generate_id(prefix: str = "") -> str:
    """
    Generate a unique ID.
    
    Args:
        prefix: Optional prefix for the ID
        
    Returns:
        Unique identifier string
    """
    unique = secrets.token_hex(16)
    return f"{prefix}{unique}" if prefix else unique


def sanitize_github_username(username: str) -> str:
    """
    Sanitize GitHub username.
    
    Args:
        username: Raw username input
        
    Returns:
        Sanitized username
    """
    # Remove @ if present
    username = username.strip().lstrip('@')
    # Remove whitespace
    username = username.replace(' ', '')
    return username


def calculate_hash(data: str) -> str:
    """
    Calculate SHA-256 hash of data.
    
    Args:
        data: String to hash
        
    Returns:
        Hexadecimal hash string
    """
    return hashlib.sha256(data.encode()).hexdigest()


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate text to maximum length.
    
    Args:
        text: Text to truncate
        max_length: Maximum length
        suffix: Suffix to append if truncated
        
    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix
