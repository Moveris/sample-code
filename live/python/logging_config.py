import logging
from logging import Logger
from typing import Optional

primary_log_name = __name__.split(".")[0]


def get_logger(
    level: Optional[logging._Level] = logging.DEBUG,
    name=primary_log_name,
    log_to_file: bool = False,
) -> Logger:
    logger = logging.getLogger(name)

    logger.setLevel(level=level)
    if not logger.hasHandlers():
        stream = logging.StreamHandler()
        stream.setLevel(level=level)
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        stream.setFormatter(formatter)
        logger.addHandler(stream)
    if log_to_file:
        file_handler = logging.FileHandler(f"{name}.log")
        file_handler.setLevel(level=level)
        file_formatter = logging.Formatter(
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%m-%d-%Y %H:%M:%S",
        )
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
    return logger
