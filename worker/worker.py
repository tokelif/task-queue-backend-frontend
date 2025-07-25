import pika
import time
import logging
import json
import psycopg2
import os
import subprocess
import requests
import socket
from bs4 import BeautifulSoup

# Configures logging with detailed output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Environment variables set up database and RabbitMQ connections with Docker service defaults
DB_HOST = os.getenv("DB_HOST", "db")
DB_NAME = os.getenv("DB_NAME", "task_queue_db")
DB_USER = os.getenv("DB_USER", "user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "user")
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")

# Connects to PostgreSQL database with error handling
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        return conn
    except psycopg2.Error as error:
        logger.error(f"Database connection failed: {error}")
        raise

# Processes tasks received from RabbitMQ
def process_task(channel, method, properties, body):
    logger.info(f"Received task: {body}")
    try:
        data = json.loads(body)
        task_id = data.get("task_id")
        task_type = data.get("task_type")
        task_data = data.get("task_data")
        result = None

        if not task_id or not task_type or not task_data:
            raise ValueError("Task ID, type, or data is missing")

        if task_type == "ping":
            try:
                process = subprocess.run(
                    ["ping", "-c", "1", "-W", "3", task_data],
                    capture_output=True, text=True
                )
                result = process.stdout if process.returncode == 0 else process.stderr
            except subprocess.SubprocessError as error:
                result = f"Ping failed: {error}"

        elif task_type == "dns_lookup":
            try:
                ip_list = socket.gethostbyname_ex(task_data)
                result = f"IP addresses for {task_data}: {', '.join(ip_list[2])}"
            except socket.gaierror as error:
                result = f"DNS lookup failed: {error}"

        elif task_type == "katana":
            try:
                logger.info(f"Running katana for URL: {task_data}")
                process = subprocess.run(
                    ["katana", "-u", task_data, "-o", "katana_output.txt"],
                    capture_output=True, text=True, timeout=300
                )
                logger.info(f"Katana process return code: {process.returncode}")
                logger.info(f"Katana stdout: {process.stdout}")
                logger.info(f"Katana stderr: {process.stderr}")
                if process.returncode == 0:
                    with open("katana_output.txt", "r") as file:
                        urls = [line.strip() for line in file.readlines() if line.strip()]
                    url_count = len(urls)
                    result = f"Found {url_count} URLs at {task_data}"
                else:
                    result = f"Katana error: {process.stderr}"
                    logger.error(result)
                # Cleanup katana output file
                if os.path.exists("katana_output.txt"):
                    os.remove("katana_output.txt")
            except subprocess.TimeoutExpired as timeout_error:
                result = f"Katana timed out: {timeout_error}"
                logger.error(result)
                if os.path.exists("katana_output.txt"):
                    os.remove("katana_output.txt")
            except Exception as error:
                result = f"Katana failed: {error}"
                logger.error(result)
                if os.path.exists("katana_output.txt"):
                    os.remove("katana_output.txt")

        elif task_type == "online_word_count":
            try:
                data_dict = json.loads(task_data)
                url = data_dict.get("url")
                word = data_dict.get("word")
                if not url or not word:
                    result = "Both url and word are required"
                else:
                    response = requests.get(url, timeout=10)
                    response.raise_for_status()
                    soup = BeautifulSoup(response.text, 'html.parser')
                    text = soup.get_text(separator=' ')
                    count = text.lower().count(word.lower())
                    result = f"The word '{word}' appears {count} times at {url}"
            except requests.RequestException as error:
                result = f"Online word count failed: {error}"

        elif task_type == "command":
            try:
                process = subprocess.run(
                    task_data,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                result = process.stdout if process.returncode == 0 else process.stderr
            except subprocess.SubprocessError as error:
                result = f"Command failed: {error}"

        elif task_type == "http_get":
            try:
                response = requests.get(task_data, timeout=10)
                response.raise_for_status()
                result = response.text[:1000]
            except requests.RequestException as error:
                result = f"HTTP GET failed: {error}"

        # Updates task status and result in the database
        if result is not None:
            logger.info(f"Updating DB for task_id={task_id} with status='completed' and result length={len(str(result))}")
            conn = get_db_connection()
            try:
                with conn.cursor() as cursor:
                    cursor.execute(
                        "UPDATE tasks SET status = %s, result = %s WHERE task_id = %s",
                        ("completed", result, task_id)
                    )
                    logger.info(f"DB update affected rows: {cursor.rowcount}")
                    conn.commit()
                logger.info(f"Task completed: {task_id}")
                channel.basic_ack(delivery_tag=method.delivery_tag)
            except psycopg2.Error as db_error:
                logger.error(f"DB update error for task_id={task_id}: {db_error}")
                channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
            finally:
                conn.close()
        else:
            logger.warning(f"No result generated for task_id={task_id}")
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

    except json.JSONDecodeError as json_error:
        logger.error(f"Invalid JSON in task body: {json_error}")
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    except Exception as error:
        logger.error(f"Unexpected error processing task {task_id}: {error}")
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

# Runs the worker in a continuous loop with reconnection logic
def main():
    while True:
        try:
            logger.info("Attempting to connect to RabbitMQ...")
            connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
            channel = connection.channel()
            channel.queue_declare(queue='task_queue', durable=True)
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue='task_queue', on_message_callback=process_task)
            logger.info("Worker started, listening for tasks...")
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError as rabbit_error:
            logger.warning(f"RabbitMQ connection failed: {rabbit_error}. Retrying in 5 seconds...")
            time.sleep(5)
        except KeyboardInterrupt:
            logger.info("Worker stopped by user.")
            break
        except Exception as error:
            logger.error(f"Unexpected error in worker loop: {error}")
            time.sleep(5)

if __name__ == "__main__":
    main()