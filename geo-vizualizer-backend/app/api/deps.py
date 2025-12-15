from collections.abc import Generator


def get_db() -> Generator[None, None, None]:
    """
    Placeholder dependency for a database session.
    Replace with real session management when a database is added.
    """
    try:
        yield
    finally:
        return


