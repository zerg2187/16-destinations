# 16Destinations

MBTI診断のような感覚で、グループの旅行方向性を決めるためのアンケート作成アプリです。

> A simple travel-survey app for groups. Create custom questions, collect answers on a 1–7 scale, and visualize preferences to decide your trip style.

## 機能

- **グループ作成**
  - グループ名・説明、参加メンバー、7段階スケールの質問を自由に設定
  - グループパスワード・管理者パスワードでアクセスを制限
- **アンケート回答**
  - メンバーごとに直感的なスライダーで回答
  - 6桁の編集用パスワードで後から回答を修正可能
- **結果の可視化**
  - ドットプロットと平均マーカーでグループの傾向を一目で確認
  - 各メンバーの回答をホバーで確認可能
- **管理者ダッシュボード**
  - 回答状況の確認、メンバーの追加・名前変更・削除

## 技術スタック

- [Next.js](https://nextjs.org/) 16 (App Router)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [shadcn/ui](https://ui.shadcn.com/)
- [Firebase](https://firebase.google.com/)
  - Cloud Firestore
  - Firebase Authentication
  - Firebase Admin SDK
- [Vercel](https://vercel.com/)（ホスティング）

## ローカル開発

### 必要条件

- Node.js 20+
- Firebase プロジェクト

### セットアップ

```bash
# 依存関係をインストール
npm install

# 環境変数を設定
# .env.local を作成し、以下の変数を設定してください
```

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK（ローカル開発時のみ必要）
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

```bash
# 開発サーバーを起動
npm run dev
```

[http://localhost:3000/new](http://localhost:3000/new) を開いてグループを作成してください。

### Firebase セットアップ

1. Firebase プロジェクトを作成
2. Firestore Database を有効化（推奨リージョン: `asia-northeast1`）
3. Authentication を有効化（匿名認証を推奨）
4. `firebase.json` / `firestore.rules` / `firestore.indexes.json` をデプロイ

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## セキュリティについて

- パスワードは SHA-256 ハッシュ化して Firestore の `secrets` サブコレクションに保存
- `firestore.rules` で `secrets` コレクションへのクライアントアクセスを完全に遮断
- 書き込みはすべて Next.js Server Actions 経由で Firebase Admin SDK が実行
- 機密情報は `.env.local` で管理し、リポジトリには含めない

## デプロイ

Vercel へのデプロイを推奨します。

```bash
vercel
```

環境変数は Vercel ダッシュボードから設定してください。

## ライセンス

MIT
