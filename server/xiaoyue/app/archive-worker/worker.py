import base64
import ctypes
import hashlib
import json
import logging
import os
import pathlib
import re
import signal
import time
from datetime import datetime, timezone

import psycopg
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from psycopg.types.json import Jsonb

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"), format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("wecom-archive")
RUNNING = True


def stop(*_):
    global RUNNING
    RUNNING = False


signal.signal(signal.SIGTERM, stop)
signal.signal(signal.SIGINT, stop)


class Slice(ctypes.Structure):
    _fields_ = [("buf", ctypes.c_void_p), ("length", ctypes.c_int)]


class MediaData(ctypes.Structure):
    pass


class FinanceSDK:
    def __init__(self, corp_id, secret, private_key):
        self.lib = ctypes.CDLL("/app/libWeWorkFinanceSdk_C.so")
        self.lib.NewSdk.restype = ctypes.c_void_p
        self.lib.Init.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_char_p]
        self.lib.GetChatData.argtypes = [ctypes.c_void_p, ctypes.c_ulonglong, ctypes.c_uint, ctypes.c_char_p, ctypes.c_char_p, ctypes.c_int, ctypes.POINTER(Slice)]
        self.lib.NewSlice.restype = ctypes.POINTER(Slice)
        self.lib.GetContentFromSlice.argtypes = [ctypes.POINTER(Slice)]
        self.lib.GetContentFromSlice.restype = ctypes.c_void_p
        self.lib.GetSliceLen.argtypes = [ctypes.POINTER(Slice)]
        self.lib.GetSliceLen.restype = ctypes.c_int
        self.lib.FreeSlice.argtypes = [ctypes.POINTER(Slice)]
        self.lib.DecryptData.argtypes = [ctypes.c_char_p, ctypes.c_char_p, ctypes.POINTER(Slice)]
        self.lib.NewMediaData.restype = ctypes.POINTER(MediaData)
        self.lib.GetMediaData.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_char_p, ctypes.c_char_p, ctypes.c_char_p, ctypes.c_int, ctypes.POINTER(MediaData)]
        self.lib.GetOutIndexBuf.argtypes = [ctypes.POINTER(MediaData)]
        self.lib.GetOutIndexBuf.restype = ctypes.c_void_p
        self.lib.GetIndexLen.argtypes = [ctypes.POINTER(MediaData)]
        self.lib.GetIndexLen.restype = ctypes.c_int
        self.lib.GetData.argtypes = [ctypes.POINTER(MediaData)]
        self.lib.GetData.restype = ctypes.c_void_p
        self.lib.GetDataLen.argtypes = [ctypes.POINTER(MediaData)]
        self.lib.GetDataLen.restype = ctypes.c_int
        self.lib.IsMediaDataFinish.argtypes = [ctypes.POINTER(MediaData)]
        self.lib.IsMediaDataFinish.restype = ctypes.c_int
        self.lib.FreeMediaData.argtypes = [ctypes.POINTER(MediaData)]
        self.lib.DestroySdk.argtypes = [ctypes.c_void_p]
        self.sdk = self.lib.NewSdk()
        if not self.sdk or self.lib.Init(self.sdk, corp_id.encode(), secret.encode()) != 0:
            raise RuntimeError("Finance SDK 初始化失败，请核对 CorpID、会话存档 Secret 和可信 IP")
        self.private_key = serialization.load_pem_private_key(private_key, password=None)

    def close(self):
        if self.sdk:
            self.lib.DestroySdk(self.sdk)
            self.sdk = None

    def chats(self, seq, limit=1000):
        out = self.lib.NewSlice()
        try:
            rc = self.lib.GetChatData(self.sdk, seq, limit, b"", b"", 30, out)
            if rc != 0:
                raise RuntimeError(f"GetChatData 返回错误码 {rc}")
            raw = ctypes.string_at(self.lib.GetContentFromSlice(out), self.lib.GetSliceLen(out))
            result = json.loads(raw)
            if result.get("errcode") != 0:
                raise RuntimeError(f"企业微信返回 {result.get('errcode')}: {result.get('errmsg')}")
            return result.get("chatdata", [])
        finally:
            self.lib.FreeSlice(out)

    def decrypt(self, item):
        key = self.private_key.decrypt(base64.b64decode(item["encrypt_random_key"]), padding.PKCS1v15())
        out = self.lib.NewSlice()
        try:
            rc = self.lib.DecryptData(key, item["encrypt_chat_msg"].encode(), out)
            if rc != 0:
                raise RuntimeError(f"DecryptData 返回错误码 {rc}")
            raw = ctypes.string_at(self.lib.GetContentFromSlice(out), self.lib.GetSliceLen(out))
            return json.loads(raw)
        finally:
            self.lib.FreeSlice(out)

    def download(self, sdk_file_id, destination, max_bytes):
        index = b""
        total = 0
        digest = hashlib.md5()
        temporary = destination.with_suffix(destination.suffix + ".part")
        with temporary.open("wb") as stream:
            while True:
                media = self.lib.NewMediaData()
                try:
                    rc = self.lib.GetMediaData(self.sdk, index, sdk_file_id.encode(), b"", b"", 60, media)
                    if rc != 0:
                        raise RuntimeError(f"GetMediaData 返回错误码 {rc}")
                    size = self.lib.GetDataLen(media)
                    chunk = ctypes.string_at(self.lib.GetData(media), size) if size else b""
                    total += len(chunk)
                    if total > max_bytes:
                        raise RuntimeError(f"媒体文件超过限制 {max_bytes} bytes")
                    stream.write(chunk)
                    digest.update(chunk)
                    finished = self.lib.IsMediaDataFinish(media) == 1
                    if not finished:
                        index = ctypes.string_at(self.lib.GetOutIndexBuf(media), self.lib.GetIndexLen(media))
                finally:
                    self.lib.FreeMediaData(media)
                if finished:
                    break
        os.replace(temporary, destination)
        return total, digest.hexdigest()


def db_connection():
    return psycopg.connect(
        host=os.getenv("PGHOST", "postgres"),
        dbname=os.environ["POSTGRES_DB"],
        user=os.environ["POSTGRES_USER"],
        password=os.environ["POSTGRES_PASSWORD"],
        connect_timeout=10,
    )


def media_descriptor(message):
    kind = message.get("msgtype", "unknown")
    body = message.get(kind)
    if not isinstance(body, dict) or not body.get("sdkfileid"):
        return None
    filename = body.get("filename") or f"{kind}.bin"
    extension = pathlib.Path(filename).suffix.lower()
    if not re.fullmatch(r"\.[a-z0-9]{1,10}", extension or ""):
        extension = ".bin"
    return kind, body, extension, filename


PERMITTED_REPAIR_ROOM = 'wrPPybcQAAh0UjrU0aSK-BdQpYi9kdFg'
MEDIA_ROOT = pathlib.Path('/archive-media')


class MediaIntegrityError(RuntimeError):
    pass


def verified_download(sdk, body, destination):
    # Never publish an unverified download, or replace a verified existing file.
    candidate = destination.with_suffix(destination.suffix + '.candidate')
    expected = str(body.get('md5sum', '')).lower()
    try:
        size, actual = sdk.download(body['sdkfileid'], candidate,
                                    int(os.getenv('MAX_MEDIA_BYTES', '209715200')))
        if expected and expected != actual:
            raise MediaIntegrityError('媒体 MD5 校验失败')
        os.replace(candidate, destination)
        return size, actual
    finally:
        candidate.unlink(missing_ok=True)
        candidate.with_suffix(candidate.suffix + '.part').unlink(missing_ok=True)


def pending_path(msgid):
    root = MEDIA_ROOT / '.pending'
    root.mkdir(mode=0o700, parents=True, exist_ok=True)
    return root / (hashlib.sha256(msgid.encode()).hexdigest() + '.json')


def defer_media(msgid, seq):
    path = pending_path(msgid)
    previous = json.loads(path.read_text()) if path.exists() else {}
    attempts = int(previous.get('attempts', 0)) + 1
    task = {'msgid': msgid, 'sequence': seq, 'attempts': attempts,
            'next_retry': time.time() + min(3600, 60 * 2 ** min(attempts - 1, 6)),
            'reason': 'md5_mismatch', 'room_id': PERMITTED_REPAIR_ROOM}
    temporary = path.with_suffix('.tmp')
    with temporary.open('w') as stream:
        os.chmod(temporary, 0o600)
        json.dump(task, stream)
    os.replace(temporary, path)


def store_attachment(conn, sdk, message_id, msgid, seq, message, sent_at):
    descriptor = media_descriptor(message)
    if not descriptor:
        return
    kind, body, extension, original_name = descriptor
    safe_id = hashlib.sha256(msgid.encode()).hexdigest()
    relative = f'{sent_at:%Y/%m/%d}/{safe_id}{extension}'
    destination = MEDIA_ROOT / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    try:
        size, md5sum = verified_download(sdk, body, destination)
    except MediaIntegrityError:
        if message.get('roomid') != PERMITTED_REPAIR_ROOM:
            raise
        # Durable before the message transaction can commit. A queued task whose
        # transaction rolled back remains pending until the normal batch replays.
        defer_media(msgid, seq)
        log.warning('附件校验未通过，已持久排队重下载 seq=%d', seq)
        return
    with conn.cursor() as cur:
        cur.execute(
            '''INSERT INTO xiaoyue.attachments
              (message_id, media_type, original_name, storage_provider, storage_key, metadata)
            SELECT %s,%s,%s,'local',%s,%s
            WHERE NOT EXISTS (
              SELECT 1 FROM xiaoyue.attachments WHERE message_id=%s AND storage_key=%s
            )''',
            (message_id, kind, original_name, relative,
             Jsonb({'bytes': size, 'md5': md5sum}), message_id, relative))


def retry_pending_media(sdk):
    # Bounded work per polling cycle; persistent backoff survives restarts.
    for path in sorted((MEDIA_ROOT / '.pending').glob('*.json')):
        task = json.loads(path.read_text())
        if task.get('room_id') != PERMITTED_REPAIR_ROOM or task['next_retry'] > time.time():
            continue
        with db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute('''SELECT id,raw_payload,message_time FROM xiaoyue.messages
                    WHERE external_message_id=%s AND conversation_id=%s''',
                    (task['msgid'], PERMITTED_REPAIR_ROOM))
                row = cur.fetchone()
            if row is None:
                continue
            try:
                store_attachment(conn, sdk, row[0], task['msgid'], task['sequence'], row[1], row[2])
                with conn.cursor() as cur:
                    cur.execute('SELECT EXISTS(SELECT 1 FROM xiaoyue.attachments WHERE message_id=%s)', (row[0],))
                    stored = cur.fetchone()[0]
                conn.commit()
                if stored:
                    path.unlink(missing_ok=True)
                    log.info('待重试附件重新下载并校验通过 seq=%d', task['sequence'])
            except Exception:
                conn.rollback()
                defer_media(task['msgid'], task['sequence'])
                log.warning('待重试附件暂未恢复 seq=%d', task['sequence'])
        break


def store_message(conn, sdk, encrypted, message):
    msgid = message.get("msgid") or encrypted.get("msgid")
    if not msgid:
        raise RuntimeError("消息缺少 msgid")
    seq = int(encrypted["seq"])
    msgtype = message.get("msgtype", "unknown")
    sender = message.get("from") or "unknown"
    sent_at = datetime.fromtimestamp(int(message.get("msgtime", 0)) / 1000, tz=timezone.utc)
    content = message.get(msgtype) if isinstance(message.get(msgtype), dict) else {}
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO xiaoyue.messages
              (external_message_id, sequence_number, conversation_id, sender_id,
               sender_type, message_type, message_time, content, raw_payload, public_key_version)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (external_message_id) DO UPDATE SET
              sequence_number = EXCLUDED.sequence_number
            RETURNING id
            """,
            (msgid, seq, message.get("roomid") or None, sender, "unknown", msgtype,
             sent_at, Jsonb(content), Jsonb(message), int(encrypted.get("publickey_ver", 0))),
        )
        message_id = cur.fetchone()[0]

    store_attachment(conn, sdk, message_id, msgid, seq, message, sent_at)


def run():
    corp_id = os.environ["WECOM_CORP_ID"]
    expected_key_version = int(os.environ["WECOM_PUBLIC_KEY_VERSION"])
    secret = pathlib.Path("/run/secrets/wecom_archive_secret").read_text().strip()
    private_key = pathlib.Path("/run/secrets/wecom_private_key.pem").read_bytes()
    sdk = FinanceSDK(corp_id, secret, private_key)
    heartbeat = pathlib.Path("/tmp/archive-worker-heartbeat")
    try:
        while RUNNING:
            try:
                with db_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT last_sequence FROM xiaoyue.archive_state WHERE singleton=TRUE FOR UPDATE")
                        seq = int(cur.fetchone()[0])
                    batch = sdk.chats(seq)
                    if batch:
                        for encrypted in batch:
                            version = int(encrypted.get("publickey_ver", 0))
                            if version != expected_key_version:
                                raise RuntimeError(f"消息需要公钥版本 {version}，当前只配置了版本 {expected_key_version}")
                            store_message(conn, sdk, encrypted, sdk.decrypt(encrypted))
                        new_seq = max(int(item["seq"]) for item in batch)
                        with conn.cursor() as cur:
                            cur.execute("UPDATE xiaoyue.archive_state SET last_sequence=%s, updated_at=NOW() WHERE singleton=TRUE", (new_seq,))
                        conn.commit()
                        log.info("成功处理 %d 条消息，游标 %d -> %d", len(batch), seq, new_seq)
                heartbeat.touch()
                retry_pending_media(sdk)
                time.sleep(1 if batch else 5)
            except Exception as exc:
                log.error("本轮拉取失败：%s", exc)
                heartbeat.touch()
                time.sleep(15)
    finally:
        sdk.close()


if __name__ == "__main__":
    run()
