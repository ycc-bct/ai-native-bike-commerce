#!/usr/bin/env python3
"""把 BEFORE..AFTER 之間推到 main 的提交寫進 storefront/docs/CHANGELOG.md。

- 合併 PR：一行，開頭是 PR 連結，後面接 PR 裡每個提交的標題。
- 直接推到 main：一行一個提交，開頭是 commit 編號與作者。
- 影響範圍【】依改到的檔案自動判斷。
- 已經寫在 CHANGELOG 裡的 PR 或 commit（手寫過的）不重複寫。
- 只改了 CHANGELOG 本身的提交不記。
"""
import datetime, os, re, subprocess

PATH = "storefront/docs/CHANGELOG.md"
REPO = os.environ.get("REPO", "ycc-bct/ai-native-bike-commerce")
ZERO = "0" * 40


def git(*args):
    return subprocess.run(["git", *args], check=True, capture_output=True, text=True).stdout.strip()


def exists(sha):
    return bool(sha) and sha != ZERO and subprocess.run(
        ["git", "cat-file", "-e", sha + "^{commit}"], capture_output=True).returncode == 0


SCOPES = [  # (判斷函式, 標籤)，依序排列
    (lambda f: f == "customized.html" or f.startswith("assets/"), "客製車"),
    (lambda f: f.startswith("storefront/custom-studio/"), "客製介紹"),
    (lambda f: f.startswith(("storefront/css/", "storefront/js/")), "全站"),
    (lambda f: f == "storefront/index.html", "首頁"),
    (lambda f: f == "storefront/gravel.html", "列表頁"),
    (lambda f: f == "storefront/product.html", "商品頁"),
    (lambda f: f == "storefront/checkout.html", "結帳"),
    (lambda f: f.startswith("storefront/docs/") or f.endswith(".md"), "文件"),
]


def scope(files):
    tags = []
    for test, tag in SCOPES:
        if any(test(f) for f in files) and tag not in tags:
            tags.append(tag)
    if not tags and any(f.startswith("storefront/") for f in files):
        tags.append("全站")
    if len(tags) > 3:
        tags = ["全站"]
    return "".join(f"【{t}】" for t in tags) or "【其他】"


def changed(rev_range):
    out = git("diff", "--name-only", *rev_range)
    return [f for f in out.splitlines() if f]


def only_changelog(files):
    return files and all(f == PATH for f in files)


def main():
    before, after = os.environ.get("BEFORE", ""), os.environ.get("AFTER") or git("rev-parse", "HEAD")
    span = f"{before}..{after}" if exists(before) else f"{after}~1..{after}" if exists(after + "~1") else after
    text = open(PATH, encoding="utf-8").read()
    lines = []

    for sha in git("rev-list", "--first-parent", "--reverse", span).splitlines():
        parents = git("show", "-s", "--format=%P", sha).split()
        subject = git("show", "-s", "--format=%s", sha)
        m = re.match(r"Merge pull request #(\d+)", subject)
        if m and len(parents) == 2:
            n = m.group(1)
            if f"/pull/{n})" in text:
                continue
            files = changed([parents[0], sha])
            if only_changelog(files):
                continue
            titles = [l.split("\t", 1)[1] for l in git(
                "log", "--no-merges", "--reverse", "--format=%an\t%s",
                f"{parents[0]}..{parents[1]}").splitlines()
                if not l.startswith("github-actions[bot]\t")]
            pr_title = (git("show", "-s", "--format=%b", sha).splitlines() or [""])[0]
            body = "；".join(titles) or pr_title or subject
            lines.append(f"- [#{n}](https://github.com/{REPO}/pull/{n}){scope(files)}{body}")
        else:
            short = sha[:7]
            if f"`{short}`" in text or len(parents) > 1:
                continue
            files = changed([parents[0], sha]) if parents else []
            if only_changelog(files):
                continue
            author = git("show", "-s", "--format=%an", sha)
            lines.append(f"- `{short}`（{author}）{scope(files)}{subject}")

    if not lines:
        return
    lines.reverse()  # 由新到舊

    today = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).strftime("%Y-%m-%d")
    head = f"## {today}\n\n"
    first = text.index("\n## ") + 1  # 第一個日期標題
    if text.startswith(head, first):
        at = first + len(head)
        text = text[:at] + "\n".join(lines) + "\n" + text[at:]
    else:
        text = text[:first] + head + "\n".join(lines) + "\n\n" + text[first:]
    open(PATH, "w", encoding="utf-8").write(text)
    print("\n".join(lines))


if __name__ == "__main__":
    main()
