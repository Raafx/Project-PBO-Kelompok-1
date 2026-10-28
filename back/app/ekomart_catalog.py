"""Backward-compatible entry point for the Indonesian supermarket catalog."""

from app.indonesia_catalog import INDONESIAN_PRODUCTS as EKOMART_PRODUCTS
from app.indonesia_catalog import main
from app.indonesia_catalog import sync_indonesian_catalog as sync_ekomart_catalog

__all__ = ["EKOMART_PRODUCTS", "main", "sync_ekomart_catalog"]


if __name__ == "__main__":
    main()
