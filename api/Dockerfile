FROM python:3.12-slim
RUN apt-get update && apt-get install -y gcc python3-dev libpq-dev && apt-get clean
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "backend.py"]
