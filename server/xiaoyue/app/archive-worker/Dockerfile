FROM python:3.13-slim-bookworm
WORKDIR /app
RUN sed -i 's|deb.debian.org|mirrors.cloud.tencent.com|g' /etc/apt/sources.list.d/debian.sources \
 && apt-get update \
 && apt-get install -y --no-install-recommends libssl3 libcurl4 ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir \
      --index-url https://mirrors.cloud.tencent.com/pypi/simple \
      --trusted-host mirrors.cloud.tencent.com \
      -r requirements.txt
COPY --chmod=0444 worker.py ./worker.py
COPY --chmod=0555 libWeWorkFinanceSdk_C.so ./libWeWorkFinanceSdk_C.so
USER 65532:65532
CMD ["python", "/app/worker.py"]
