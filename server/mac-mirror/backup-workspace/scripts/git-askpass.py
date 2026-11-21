#!/usr/bin/env python3
import pathlib,sys
if 'username' in sys.argv[1].lower():print('x-access-token')
else:print(pathlib.Path('/home/ubuntu/.config/banyuexuan-backup/github-token').read_text().strip())
