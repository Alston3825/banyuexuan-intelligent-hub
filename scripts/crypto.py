#!/usr/bin/env python3
"""Streaming AES-256-GCM with RSA-OAEP-SHA256 key wrapping. No keys in logs."""
import argparse, base64, json, os, pathlib, struct, tempfile
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
MAGIC = b'BYXBACK1'
def encrypt(source, target, public):
    pub = serialization.load_pem_public_key(pathlib.Path(public).read_bytes())
    key, nonce = os.urandom(32), os.urandom(12)
    wrapped = pub.encrypt(key, padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None))
    header = json.dumps({'wrapped_key': base64.b64encode(wrapped).decode(), 'nonce': base64.b64encode(nonce).decode()}).encode()
    aad = MAGIC + struct.pack('>I', len(header)) + header
    enc = Cipher(algorithms.AES(key), modes.GCM(nonce)).encryptor(); enc.authenticate_additional_data(aad)
    with open(source, 'rb') as src, open(str(target)+'.part','wb') as dst:
        os.chmod(dst.name, 0o600); dst.write(aad)
        for chunk in iter(lambda: src.read(1024*1024), b''): dst.write(enc.update(chunk))
        dst.write(enc.finalize()); dst.write(enc.tag)
    os.replace(str(target)+'.part', target)
def decrypt(source, target, private):
    priv = serialization.load_pem_private_key(pathlib.Path(private).read_bytes(), password=None)
    partial = str(target)+'.part'
    try:
        with open(source,'rb') as src:
            prefix=src.read(12)
            if prefix[:8]!=MAGIC: raise ValueError('Invalid archive format')
            length=struct.unpack('>I',prefix[8:])[0]
            if length>65536: raise ValueError('Invalid header length')
            header=src.read(length); meta=json.loads(header)
            start=src.tell(); src.seek(-16,2); end=src.tell(); tag=src.read(16); src.seek(start)
            key=priv.decrypt(base64.b64decode(meta['wrapped_key']),padding.OAEP(mgf=padding.MGF1(hashes.SHA256()),algorithm=hashes.SHA256(),label=None))
            dec=Cipher(algorithms.AES(key),modes.GCM(base64.b64decode(meta['nonce']),tag)).decryptor(); dec.authenticate_additional_data(prefix+header)
            with open(partial,'wb') as dst:
                os.chmod(partial,0o600)
                remaining=end-start
                while remaining:
                    chunk=src.read(min(1024*1024,remaining))
                    if not chunk: raise ValueError('Truncated archive')
                    remaining-=len(chunk);dst.write(dec.update(chunk))
                dst.write(dec.finalize())
        os.replace(partial,target)
    finally:
        pathlib.Path(partial).unlink(missing_ok=True)
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['encrypt','decrypt']);p.add_argument('source');p.add_argument('target');p.add_argument('key');a=p.parse_args()
    (encrypt if a.mode=='encrypt' else decrypt)(a.source,a.target,a.key)
