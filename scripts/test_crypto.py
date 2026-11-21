#!/usr/bin/env python3
import pathlib,tempfile
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from crypto import encrypt,decrypt
with tempfile.TemporaryDirectory() as d:
 p=pathlib.Path(d);key=rsa.generate_private_key(public_exponent=65537,key_size=2048)
 (p/'key').write_bytes(key.private_bytes(serialization.Encoding.PEM,serialization.PrivateFormat.PKCS8,serialization.NoEncryption()))
 (p/'pub').write_bytes(key.public_key().public_bytes(serialization.Encoding.PEM,serialization.PublicFormat.SubjectPublicKeyInfo))
 data=b'round-trip'+b'\0'*2000000;(p/'source').write_bytes(data)
 encrypt(p/'source',p/'archive',p/'pub');decrypt(p/'archive',p/'restored',p/'key');assert (p/'restored').read_bytes()==data
 ciphertext=bytearray((p/'archive').read_bytes());ciphertext[-32]^=1;(p/'tampered').write_bytes(ciphertext)
 try:decrypt(p/'tampered',p/'bad-output',p/'key');raise AssertionError('Tampering accepted')
 except Exception as e:
  assert not isinstance(e,AssertionError)
 assert not (p/'bad-output').exists() and not (p/'bad-output.part').exists()
 print('PASS: streaming encrypted round-trip, tamper rejection and partial plaintext cleanup')
