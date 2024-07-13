import logging
from typing import Dict


class OrchidLogFormatter(logging.Formatter):
    COLORS: Dict[int, str] = {
        logging.DEBUG: "\033[94m",  # Blue
        logging.INFO: "\033[92m",  # Green
        logging.WARNING: "\033[93m",  # Yellow
        logging.ERROR: "\033[91m",  # Red
        logging.CRITICAL: "\033[95m",  # Magenta
    }

    RESET: str = "\033[0m"

    def __init__(self, fmt: str, colors: Dict[int, str] = None):
        super().__init__(fmt)
        self.colors = colors or self.COLORS

    def format(self, record: logging.LogRecord) -> str:
        # Get the original formatted message
        log_message = super().format(record)

        # Add color based on the log level
        color = self.colors.get(record.levelno, self.RESET)
        return f"{color}{log_message}{self.RESET}"


def get_logger(name: str, colors: Dict[int, str] = None) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    handler = logging.StreamHandler()
    handler.setFormatter(
        OrchidLogFormatter("%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s", colors=colors)
    )
    logger.addHandler(handler)
    return logger
