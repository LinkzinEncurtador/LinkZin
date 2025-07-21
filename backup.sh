#!/bin/bash
# Backup MongoDB e arquivos do projeto
DATA=$(date +%F)
BACKUP_DIR=/backups/linkzin/$DATA
mkdir -p $BACKUP_DIR
mongodump --uri="$DB_URI" --out $BACKUP_DIR/mongo
rsync -av --exclude 'node_modules' --exclude '.git' ./ $BACKUP_DIR/files
# Exemplo de envio para Google Drive com rclone:
# rclone copy $BACKUP_DIR remote:linkzin-backups/$DATA 