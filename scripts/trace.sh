#!/usr/bin/env bash
# 追溯一个制品：只凭制品包本身，回答“它来自哪次提交”。
#
# 用法：scripts/trace.sh <制品.tar.gz> [仓库目录] [主干分支]
#   仓库目录  默认当前目录；需要已 git fetch，包含制品里记录的提交
#   主干分支  默认 origin/main
#
# 检查三件事，任何一件不通过则以非零状态退出：
#   1. 同目录下有 .sha256 文件时，制品内容与它一致
#   2. 制品内的 BUILD_INFO 记录的提交确实存在于仓库
#   3. 该提交在主干的历史上（不是只存在于某个未合并分支的提交）
set -euo pipefail

asset=${1:?用法: scripts/trace.sh <制品.tar.gz> [仓库目录] [主干分支]}
repo=${2:-.}
main_ref=${3:-origin/main}
fail=0

[ -f "$asset" ] || { echo "找不到制品：$asset" >&2; exit 2; }

echo "== 1. 校验和"
sumfile="$asset.sha256"
if [ -f "$sumfile" ]; then
  if ! (cd "$(dirname "$asset")" && sha256sum -c "$(basename "$sumfile")"); then
    echo "校验和不一致：制品已损坏或被改动，停止追溯。" >&2
    exit 1
  fi
else
  echo "（没有 $(basename "$sumfile")，跳过）"
fi

echo "== 2. 制品里的 BUILD_INFO"
info=$(tar -xzOf "$asset" --wildcards '*/BUILD_INFO') || { echo "制品里没有 BUILD_INFO" >&2; exit 2; }
echo "$info"
get() { printf '%s\n' "$info" | sed -n "s/^$1=//p" | head -n 1; }
commit=$(get commit)
version=$(get version)
build_no=$(get build_no)
run_id=$(get run_id)
[ -n "$commit" ] && [ "$commit" != "unknown" ] || { echo "BUILD_INFO 没有有效的 commit" >&2; exit 2; }

echo "== 3. 提交 $commit"
if ! git -C "$repo" cat-file -e "$commit^{commit}" 2>/dev/null; then
  echo "仓库里找不到这个提交（先 git fetch --all --tags？）" >&2
  exit 1
fi
git -C "$repo" log -1 --format='作者: %an <%ae>%n时间: %cI%n标题: %s' "$commit"

if git -C "$repo" merge-base --is-ancestor "$commit" "$main_ref" 2>/dev/null; then
  echo "主干: 该提交在 $main_ref 的历史上"
else
  echo "主干: 该提交不在 $main_ref 的历史上（或找不到 $main_ref）" >&2
  fail=1
fi

tags=$(git -C "$repo" tag --points-at "$commit")
echo "指向它的 tag: ${tags:-（无）}"
echo "版本号: $version    构建号: $build_no"

url=$(git -C "$repo" remote get-url origin 2>/dev/null || true)
url=${url%.git}
case "$url" in
  git@github.com:*) url="https://github.com/${url#git@github.com:}" ;;
esac
case "$url" in
  https://github.com/*)
    echo "提交页面（含关联的 PR）: $url/commit/$commit"
    case "$run_id" in
      ''|*[!0-9]*)
        echo "构建它的运行: BUILD_INFO 里没有有效的 run_id，只能到 $url/actions 按构建号 $build_no 去找" \
             "（ci 与 release 的构建号各自从 1 计数，要先判断是哪个工作流）"
        ;;
      *) echo "构建它的运行: $url/actions/runs/$run_id" ;;
    esac
    ;;
  *)
    echo "（origin 不是 GitHub 地址，无法给出提交页面链接）"
    ;;
esac

exit $fail
