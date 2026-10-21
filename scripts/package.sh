#!/usr/bin/env bash
# 打包 PaperMate 制品：dist/papermate_<VERSION>.tar.gz
#   内含顶层目录 papermate_<VERSION>/
#     ├── papermate-backend.jar
#     ├── frontend/            ← CRA 构建产物
#     └── BUILD_INFO           ← name/version/build_no/run_id/commit/java/node
#   并生成同名 .sha256。
#
# 用法：scripts/package.sh <VERSION> <BUILD_NO> <RUN_ID> <COMMIT>
# 测试应在调用本脚本之前完成（本脚本只构建、不打测试）。
set -euo pipefail

VERSION=${1:?用法: scripts/package.sh <VERSION> <BUILD_NO> <RUN_ID> <COMMIT>}
BUILD_NO=${2:?}
RUN_ID=${3:?}
COMMIT=${4:?}

NAME=papermate
PKG=${NAME}_${VERSION}
DIST=dist
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== 构建后端（跳过测试）=="
(cd backend && mvn -B -ntp -DskipTests package)
JAR=$(ls backend/target/*.jar | grep -v 'original' | head -n 1)

echo "== 构建前端 =="
(cd frontend && NODE_OPTIONS=--openssl-legacy-provider npm run build)

echo "== 组装制品 =="
rm -rf "$DIST/$PKG"
mkdir -p "$DIST/$PKG"
cp "$JAR" "$DIST/$PKG/$NAME-backend.jar"
cp -r frontend/build "$DIST/$PKG/frontend"

JAVA_VER=$(java -version 2>&1 | head -n 1 | sed -E 's/.*"([^"]+)".*/\1/')
NODE_VER=$(node -v | sed 's/^v//')
printf 'name=%s\nversion=%s\nbuild_no=%s\nrun_id=%s\ncommit=%s\njava=%s\nnode=%s\n' \
  "$NAME" "$VERSION" "$BUILD_NO" "$RUN_ID" "$COMMIT" "$JAVA_VER" "$NODE_VER" \
  > "$DIST/$PKG/BUILD_INFO"

tar --sort=name --owner=0 --group=0 --numeric-owner --mtime=@0 \
  -C "$DIST" -cf - "$PKG" | gzip -n > "$DIST/$PKG.tar.gz"
(cd "$DIST" && sha256sum "$PKG.tar.gz" > "$PKG.tar.gz.sha256")

echo "== 完成 =="
cat "$DIST/$PKG/BUILD_INFO"
sha256sum "$DIST/$PKG.tar.gz"
