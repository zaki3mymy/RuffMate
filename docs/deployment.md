# デプロイガイド

RuffMateは、GitHub Actionsを使って`zaki3mymy.github.io`リポジトリの`docs/RuffMate/`ディレクトリに自動デプロイされます。

## デプロイ先

- **URL**: https://zaki3mymy.github.io/RuffMate/
- **リポジトリ**: https://github.com/zaki3mymy/zaki3mymy.github.io
- **ディレクトリ**: `docs/RuffMate/`

## デプロイフロー

`main`ブランチにpushすると、以下のフローで自動デプロイされます:

1. **ビルド**: Ruffからルール情報を取得し、Astroでビルド
2. **デプロイ**: `zaki3mymy.github.io`リポジトリの`main`ブランチの`docs/RuffMate/`に直接push

## セキュリティ: Deploy Keyの設定

別リポジトリへのデプロイには、**Deploy Key（SSH鍵）**を使用します。これにより、最小権限の原則に従い、安全にデプロイできます。

### 初回セットアップ手順

#### 1. SSH鍵ペアを生成

ローカル環境で以下のコマンドを実行します:

```bash
ssh-keygen -t ed25519 -C "github-actions-ruffmate" -f ruffmate_deploy_key
```

**重要**: パスフレーズは設定しないでください（GitHub Actionsで使用するため）。

実行すると、以下の2つのファイルが生成されます:
- `ruffmate_deploy_key` - 秘密鍵（非公開）
- `ruffmate_deploy_key.pub` - 公開鍵

#### 2. 公開鍵を`zaki3mymy.github.io`に登録

1. https://github.com/zaki3mymy/zaki3mymy.github.io/settings/keys にアクセス
2. **Add deploy key**をクリック
3. 以下を入力:
   - **Title**: `RuffMate Deploy Key`
   - **Key**: `ruffmate_deploy_key.pub`の内容をコピー&ペースト
   - **Allow write access**: ✅ **必ずチェックを入れる**（これがないとpushできません）
4. **Add key**をクリック

#### 3. 秘密鍵をRuffMateリポジトリに登録

1. https://github.com/zaki3mymy/RuffMate/settings/secrets/actions にアクセス
2. **New repository secret**をクリック
3. 以下を入力:
   - **Name**: `ACTIONS_DEPLOY_KEY`（大文字小文字を正確に）
   - **Secret**: `ruffmate_deploy_key`（秘密鍵）の内容をコピー&ペースト
4. **Add secret**をクリック

#### 4. ローカルの鍵ファイルを削除

セキュリティのため、ローカルに残った鍵ファイルを削除します:

```bash
rm ruffmate_deploy_key ruffmate_deploy_key.pub
```

### 確認

`main`ブランチに何かpushして、GitHub Actionsが正常に動作するか確認してください:

1. https://github.com/zaki3mymy/RuffMate/actions にアクセス
2. 最新のワークフロー実行を確認
3. 全てのステップが成功（✅）していることを確認
4. https://zaki3mymy.github.io/RuffMate/ にアクセスして、デプロイされているか確認

### トラブルシューティング

#### デプロイが失敗する場合

**エラー: `Permission denied (publickey)`**

- 秘密鍵が正しく登録されているか確認
- シークレット名が`ACTIONS_DEPLOY_KEY`（大文字）であることを確認
- 公開鍵に**Allow write access**が有効になっているか確認

**エラー: `refusing to allow a Personal Access Token to create or update workflow`**

- Deploy Keyを使用している場合、このエラーは発生しません
- PATを使用している場合は、Deploy Keyに切り替えてください

**デプロイは成功するがサイトが更新されない**

- `zaki3mymy.github.io`リポジトリの`docs/RuffMate/`ディレクトリにファイルが配置されているか確認
- GitHub Pagesの設定が正しいか確認（Settings > Pages）

## ワークフロー詳細

### トリガー

```yaml
on:
  push:
    branches:
      - main
```

`main`ブランチへのpushで自動実行されます。

### ステップ

1. **Checkout**: RuffMateリポジトリをクローン
2. **Setup Node.js**: Node.js 20をセットアップ
3. **Install dependencies**: `npm ci`で依存関係をインストール
4. **Fetch Ruff rules**: `npm run fetch-rules`でRuffからルール情報を取得
5. **Build**: `npm run build`でAstroビルド
6. **Deploy**: `peaceiris/actions-gh-pages@v4`で`zaki3mymy.github.io`にデプロイ

### デプロイ設定

```yaml
- name: Deploy to zaki3mymy.github.io
  uses: peaceiris/actions-gh-pages@v4
  with:
    deploy_key: ${{ secrets.ACTIONS_DEPLOY_KEY }}
    external_repository: zaki3mymy/zaki3mymy.github.io
    publish_branch: main
    publish_dir: ./dist
    destination_dir: docs/RuffMate
    keep_files: true
```

**パラメータ説明**:
- `deploy_key`: Deploy Key（秘密鍵）
- `external_repository`: デプロイ先リポジトリ
- `publish_branch`: デプロイ先ブランチ（`main`）
- `publish_dir`: デプロイするディレクトリ（`./dist`）
- `destination_dir`: デプロイ先ディレクトリ（`docs/RuffMate`）
- `keep_files`: `docs/RuffMate`以外のファイルを保持（`true`）

## 手動デプロイ

緊急時や、ワークフローを使わずに手動でデプロイする場合:

```bash
# 1. ビルド
npm run build

# 2. zaki3mymy.github.ioをクローン
cd ..
git clone git@github.com:zaki3mymy/zaki3mymy.github.io.git
cd zaki3mymy.github.io

# 3. 既存ファイルを削除
rm -rf docs/RuffMate/*

# 4. ビルドファイルをコピー
cp -r ../RuffMate/dist/* docs/RuffMate/

# 5. コミット&プッシュ
git add docs/RuffMate
git commit -m "Deploy RuffMate manually"
git push origin main
```

## セキュリティベストプラクティス

### ✅ 推奨: Deploy Key

- リポジトリ単位の権限制御
- 有効期限なし
- 最小権限の原則に従う
- GitHub ActionsのSecretで安全に管理

### ❌ 非推奨: Personal Access Token (PAT)

- アカウント全体への広範なアクセス権限
- 有効期限管理が必要
- リポジトリ単位の権限制御ができない
- 漏洩時の影響が大きい

## 参考リンク

- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
- [GitHub Deploy Keys](https://docs.github.com/en/developers/overview/managing-deploy-keys)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
