import type { CatalogLocaleCatalog, CatalogStageCopy } from '@/i18n/types';
import type { CatalogStage } from '@/types/catalog';

export const messages = {
  common: {
    all: 'すべて',
    openLink: 'リンクを開く',
    openEntry: '開く',
    scanExperience: 'スキャン',
    preparing: '準備中',
    platformAriaLabel: '対応プラットフォーム',
    directScanHint: 'モバイルでスキャン、または直接開けます。',
    wechatScanHint: 'WeChat ミニプログラムコードをスキャンして体験できます。',
    sunCodePending: 'コード未登録',
    sunCodeLoading: 'コード読み込み中',
    qrMode: 'スキャンモード',
    qrTitle: 'QRコード',
    sunCodeAlt: 'ミニプログラムコード',
    versionPrefix: 'v',
    loading: '読み込み中',
    loadMore: 'さらに読み込む…',
    empty: 'まだありません',
    backHome: 'ホームへ戻る',
    aiInput: {
      polish: '推敲',
      polishing: '推敲中',
      restore: '復元',
      polishAriaLabel: 'AI で内容を推敲',
      restoreAriaLabel: '推敲前の内容に戻す',
      failed: '内容を推敲できませんでした。後でもう一度お試しください。',
    },
  },
  locale: {
    ariaLabel: '言語切替',
    switchTo: '切り替え',
    names: {
      'zh-CN': '中国語',
      en: '英語',
      ja: '日本語',
    },
    shortNames: {
      'zh-CN': '中',
      en: 'EN',
      ja: '日',
    },
  },
  theme: {
    ariaLabel: 'テーマ切替',
    system: 'システム',
    light: 'ライト',
    dark: 'ダーク',
    switchToSystem: 'システム設定に合わせる',
    switchToLight: 'ライトテーマにする',
    switchToDark: 'ダークテーマにする',
  },
  pageTitles: {
    home: 'ホーム',
    onlineTools: 'ツール',
    products: 'プロダクト',
    team: 'チーム',
    privacy: 'プライバシー',
    designSystem: 'デザインシステム',
    buildInfo: 'ビルド情報',
  },
  header: {
    brandAriaLabel: 'ORZ2 ホーム',
    navAriaLabel: 'メインナビゲーション',
    openNavAriaLabel: 'ナビゲーションを開く',
    closeNavAriaLabel: 'ナビゲーションを閉じる',
    loggedOut: 'ログイン',
    loggedIn: 'ログイン済み',
    defaultAvatar: 'ユ',
    defaultUserName: 'テストユーザー',
    logoutAriaLabel: 'ログアウト',
    profile: 'プロフィール',
    scores: 'ポイント履歴',
    scoreLabel: '現在のポイント',
    logout: 'ログアウト',
  },
  member: {
    profileTitle: 'プロフィール',
    profileDescription:
      'アバター、ニックネーム、所在地を管理できます。保存後、ログイン状態にもすぐ反映されます。',
    scoreTitle: 'ポイント履歴',
    scoreDescription: '現在のポイント残高とすべての変動を確認できます。',
    avatar: 'アバター',
    uploadAvatar: 'アバターを変更',
    cropTitle: 'アバターを切り抜く',
    cropDescription:
      '画像をドラッグして調整してください。アバターは正方形で保存されます。',
    cropZoom: '拡大縮小',
    cancel: 'キャンセル',
    confirmCrop: 'このアバターを使う',
    nickname: 'ニックネーム',
    gender: '性別',
    genders: ['非公開', '男性', '女性'],
    title: '称号',
    province: '都道府県 / 州',
    city: '市',
    area: '地域',
    save: 'プロフィールを保存',
    saving: '保存中…',
    saved: 'プロフィールを保存しました。',
    loadFailed: 'プロフィールを読み込めません。再度ログインしてください。',
    saveFailed: 'プロフィールを保存できません。もう一度お試しください。',
    uploadFailed: 'アバターをアップロードできません。もう一度お試しください。',
    imageInvalid: '画像ファイルを選択してください。',
    noRecords: 'ポイント履歴はありません。',
    loadMore: 'さらに読み込む',
    loading: '読み込み中…',
    typeLabels: {
      REWARDED_CREATE: 'アカウント作成ボーナス',
      REWARDED_AD: '広告ボーナス',
      USE_CHAT: 'AI チャット利用',
      USE_OFFICE: '公式アカウント記事の生成',
      USE_OFFICIAL: '公式アカウントツールの利用',
      MANUAL: 'システム操作',
      DEFAULT: '不明',
    },
    time: '日時',
    change: '変動',
    balance: '残高',
  },
  footer: {
    brandDescription:
      'ORZ2 はオンライン AI ツール、効率化ツール、カスタムツールサイトに注力し、反復作業を安定したフローへ移します。',
    sections: {
      nav: 'ナビ',
      contact: '連絡先',
      compliance: 'コンプライアンス',
      friendlyLinks: 'フレンドリーリンク',
    },
    navAriaLabel: 'フッターナビゲーション',
    contactSupport:
      'ツールのカスタム、商用展開、効率化ワークフロー構築を支援します。',
    complianceNote:
      'データ利用、第三者サービス、広告説明、ユーザー権利を明確に示します。',
    copyright: '© 2026 ORZ2. All rights reserved.',
    tagline: 'Built for useful, compliant online tools.',
    buildInfoLabel: '現在のビルド',
    buildInfoAriaLabel: 'ORZ2 のビルド情報を見る',
    friendlyLinks: [
      {
        name: 'Parry Loves Coding',
        url: 'https://www.parryqiu.com/',
      },
    ],
  },
  login: {
    closeAriaLabel: 'ログイン画面を閉じる',
    kicker: 'WeChat スキャンログイン',
    title: 'おかえりなさい',
    description: 'WeChat でコードをスキャンし、認可後に自動ログインします。',
    qrAlt: 'WeChat ミニプログラムログインコード',
    loading: 'コードを生成しています...',
    expired: 'コードの有効期限が切れました',
    noQr: 'コードはまだありません',
    hint: 'WeChat でスキャンし、案内に従って認可してください',
    refreshButton: 'コードを更新',
    wechatUser: 'WeChat ユーザー',
    errors: {
      loginFailed:
        'ログインに失敗しました。コードを更新して再試行してください。',
      qrLoadFailed:
        'コードを読み込めませんでした。後でもう一度お試しください。',
      qrCreateFailed: 'コード作成に失敗しました',
      qrDataInvalid: 'QR 画像データが不正です',
      qrReadFailed: 'QR 画像を読み取れませんでした',
    },
  },
  apiError: {
    closeAriaLabel: 'メッセージ画面を閉じる',
    generic: {
      title: '操作を完了できませんでした',
      description:
        'サービスでこの操作を完了できませんでした。しばらくしてからもう一度お試しください。',
    },
    scoreLow: {
      title: 'ポイントが不足しています',
      description:
        'この操作にはポイントが必要ですが、現在の残高では不足しています。',
      codeAlt: 'ポイント獲得用ミニプログラムコード',
      codePending:
        'ポイント獲得用ミニプログラムコードを準備中です。しばらくしてからもう一度お試しください。',
      hint: 'WeChat でミニプログラムコードをスキャンし、タスクを完了するとポイントを獲得できます。',
    },
  },
  homeSections: {
    tools: {
      subtitle:
        'よく使うタスクをわかりやすい入口に整理。必要な時に開き、終わったらすぐ離れられます。',
      ariaLabel: 'オンラインツール',
      searchPlaceholder: 'AI、画像、JSON、マーケティングを検索...',
      searchAriaLabel: 'ツールを検索',
      categoryAriaLabel: 'ツールカテゴリ',
      emptyState:
        '一致するツールがありません。別のキーワードを試してください。',
      allButton: 'すべてのツールを見る',
    },
    products: {
      subtitle:
        'すでに形になったプロダクト実践を記録し、それぞれに明確な入口を残します。',
      ariaLabel: 'プロダクト',
      searchPlaceholder: 'H5、WEAPP、AI、ゲームを検索...',
      searchAriaLabel: 'プロダクトを検索',
      categoryAriaLabel: 'プロダクトカテゴリ',
      emptyState:
        '一致するプロダクトがありません。別のキーワードを試してください。',
      allButton: 'すべてのプロダクトを見る',
    },
    testimonials: {
      title: 'ユーザーの声',
      subtitle: '実際の利用感から、より直接的で使いやすい体験へ磨き込みます。',
      ariaLabel: 'ユーザーの声',
    },
    hero: {
      title: '成長を支えるツール',
      description:
        'ORZ2 は AI、開発、デザイン、マーケティング、オフィス効率化ツールを集約し、商用シーン向けの独立ツールサイト、情報設計、コンプライアンスモジュールも支援します。',
      primaryCta: 'プロダクトを見る',
      secondaryCta: 'カスタム相談',
      highlightsAriaLabel: 'ORZ2 の特徴',
      highlights: [{ label: '素早い入口' }, { label: '明確な合規' }],
      videoFrameLabel: 'ORZ2 動画カバー',
      videoShowcaseLabel: 'ORZ2 ランダム動画展示',
      videoPosterAlt: '動画カバー',
      videoBackgroundLabel: '背景動画',
    },
    contact: {
      title: 'ビジネスツールの入口',
      description:
        '業界、チームフロー、商用目標に合わせて、ツールページ、データ連携、広告合規コンテンツ、独立サイト構成を設計できます。',
      capabilities:
        'ツール目录設計、AI フロー連携、企業 LP、プライバシーモジュール',
      ctaLabel: '拡張できる入口を見る',
    },
  },
  catalogStages: {
    LIVE: {
      label: '公開中',
      description: '公開されており、すぐ体験できます。',
    },
    BETA: {
      label: 'ベータ',
      description: 'ベータ中で、一部機能は変更される可能性があります。',
    },
    PLANNING: {
      label: '計画中',
      description: 'まだ公開前で、設計または開発中です。',
    },
  } satisfies Record<CatalogStage, CatalogStageCopy>,
  seo: {
    home: {
      title: 'ORZ2 - オンライン AI ツールと効率化ツール',
      description:
        'ORZ2 は AI ライティング、画像処理、開発、マーケティング、オフィス効率化ツールと、商用ツールサイトのカスタム方案を提供します。',
    },
    products: {
      title: 'ORZ2 - プロダクト',
      description:
        'ORZ2 のプロダクト実践を閲覧できます。スマートミニアプリ、ブラウザ・エディタ拡張、インタラクティブゲームを含みます。',
      itemListName: 'ORZ2 プロダクト',
    },
    tools: {
      title: 'ORZ2 - オンラインツール',
      description:
        'ORZ2 のオンラインツール目录から、公众号自動投稿、タイムゾーン変換、JSON 整形、配色、画像圧縮ツールを探せます。',
      itemListName: 'ORZ2 オンラインツール',
    },
    team: {
      title: 'ORZ2 - コアチーム',
      description:
        'プロジェクト、開発、プロダクト、デザイン、財務、HR が連携する ORZ2 チームを紹介します。',
      pageName: 'ORZ2 チーム',
    },
    privacy: {
      title: 'ORZ2 - プライバシーポリシー',
      description:
        'ORZ2 が必要情報、Cookie、第三者サービス、広告合規、ユーザーのプライバシー権利をどう扱うかを説明します。',
    },
    designSystem: {
      title: 'ORZ2 - デザインシステム',
      description:
        'ORZ2 の共通コンポーネント、視覚 token、カード、ボタン、タグ、空状態、モーダル例を確認できます。',
    },
    buildInfo: {
      title: 'ORZ2 - ビルド情報',
      description:
        '現在の ORZ2 デプロイのバージョン、Git、ビルド、CI、リリース情報を確認できます。',
    },
  },
  buildInfo: {
    heroTitle: 'ビルド情報',
    heroDescription:
      'このページがどのバージョン、コミット、ビルド時刻、デプロイ元で動いているか確認できます。',
    refresh: '更新',
    rawJson: 'JSON を見る',
    summaryLabel: '現在のデプロイ',
    loadingTitle: 'ビルド情報を読み込み中',
    loadingDescription:
      'このデプロイで生成された build-info ファイルを読み込んでいます。',
    emptyTitle: 'ビルド情報が未生成です',
    emptyDescription:
      '{path} を読み込めませんでした。ビルドで xbi generate を実行し、静的ファイルが公開されているか確認してください。',
    sections: {
      app: 'アプリ',
      git: 'Git',
      build: 'ビルド',
      deploy: 'デプロイ',
      ci: 'CI',
      runtime: 'ランタイム',
      latestCommits: '最近のコミット',
    },
    fields: {
      appName: 'アプリ名',
      version: 'バージョン',
      env: '環境',
      mode: 'モード',
      schemaVersion: 'Schema',
      branch: 'ブランチ',
      tag: 'タグ',
      commit: 'Commit',
      commitTime: 'コミット時刻',
      dirty: '作業ツリー変更',
      remote: 'リモート',
      buildTime: 'ビルド時刻',
      buildUser: 'ビルドユーザー',
      machine: 'ビルドマシン',
      nodeVersion: 'Node',
      packageManager: 'パッケージ管理',
      deployTarget: 'デプロイ先',
      deployRegion: 'デプロイ地域',
      deployUrl: 'デプロイ URL',
      releaseId: 'Release ID',
      buildId: 'Build ID',
      provider: 'プロバイダー',
      workflow: 'Workflow',
      runId: 'Run ID',
      runNumber: 'Run number',
      jobUrl: 'ジョブ URL',
      commitUrl: 'コミット URL',
      apiBaseUrl: 'API base URL',
      publicPath: 'Public path',
    },
  },
  imageTool: {
    backToTools: 'オンラインツール',
    title: '一括画像処理スタジオ',
    description:
      '複数画像をアップロードし、同じ変換、リサイズ、TinyPNG 圧縮設定を適用して ZIP でダウンロードできます。',
    upload: {
      title: '一括画像ワークベンチ',
      subtitle:
        '各画像の寸法、容量、形式を読み取り、現在のプレビューを左右で切り替えられます。',
      emptyTitle: '複数画像をここへドロップ',
      emptyDescription: 'PNG、JPEG、WebP、AVIF に対応します。',
      dropzoneAriaLabel: '複数画像をアップロードまたはドロップ',
      browse: '画像を選択',
      replace: '画像を変更',
      clear: 'すべてクリア',
      previousPreview: '前の画像を表示',
      nextPreview: '次の画像を表示',
      previewAlt: 'アップロード画像プレビュー',
    },
    batch: {
      title: '一括キュー',
      countSuffix: ' 枚の画像',
      totalSize: '元の合計容量',
      primary: '現在のプレビュー',
      unifiedNote:
        'キューまたは左右矢印でプレビューを切り替えられます。右側の設定は画像全体に適用されます。',
      morePrefix: 'ほか ',
      moreSuffix: ' 枚が処理待ち',
    },
    base64: {
      title: 'Base64 画像',
      subtitle:
        '現在のプレビューに合わせて切り替わります。単一の base64 画像を貼り付けて処理することもできます。',
      inputPlaceholder:
        'data:image/png;base64,... または画像 base64 を貼り付け',
      copy: 'base64 をコピー',
      copied: 'base64 をコピーしました',
    },
    info: {
      title: '画像基本情報',
      dimensions: '寸法',
      size: 'ファイル容量',
      mime: '形式',
      lastModified: '更新日時',
      unknown: '未アップロード',
    },
    settings: {
      title: '処理設定',
      subtitle: '必要に応じて変換、リサイズ、圧縮を有効にします。',
    },
    convert: {
      enable: '形式変換を有効化',
      description: '一般的な Web 画像形式で出力します。',
      formatLabel: '出力形式',
      keep: '元形式のまま',
      png: 'PNG',
      jpeg: 'JPEG',
      webp: 'WebP',
    },
    resize: {
      enable: 'リサイズを有効化',
      description: '寸法入力、比率ロック、スライダーで調整できます。',
      modeAriaLabel: 'リサイズ方式',
      modeScale: '等比リサイズ',
      modeDimensions: '幅高さ指定',
      dimensionTitle: '出力寸法',
      aspectLocked: '比率ロック中',
      aspectUnlocked: '自由サイズ',
      aspectToggleLabel: '等比リサイズを切り替え',
      scaleLabel: '拡大縮小率',
      batchHint:
        'スライダーは各画像の元サイズから等比リサイズし、幅高さ入力は同じ出力サイズに統一します。',
      width: '幅 px',
      height: '高さ px',
    },
    compress: {
      enable: 'TinyPNG 圧縮を有効化',
      description: '生成結果を Tinify API で最適化します。',
      provider: 'TinyPNG / Tinify',
    },
    output: {
      title: '出力結果',
      empty: '処理後の寸法、容量、ダウンロード入口が表示されます。',
      ready: '画像処理が完了しました。結果をダウンロードできます。',
      estimateTitle: '出力見積もり',
      estimatedDimensions: '予定寸法',
      estimatedSize: '予定容量',
      outputType: '出力形式',
      processedDimensions: '処理後寸法',
      processedSize: '処理後容量',
      savings: '削減率',
      engine: '処理エンジン',
      localEngine: 'ブラウザローカル',
      process: '結果を生成',
      processBatch: '一括生成',
      processing: '処理中',
      compressing: '圧縮中',
      reset: 'リセット',
      download: '画像をダウンロード',
      downloadZip: 'ZIP をダウンロード',
      downloadSuccessfulZip: '成功分の ZIP をダウンロード',
      zipping: 'ZIP 作成中',
      batchReady:
        'すべての画像処理が完了しました。ZIP でダウンロードできます。',
      batchPartial:
        '一部の画像処理が完了しました。成功した結果をダウンロードし、失敗項目を確認してください。',
      batchFailed:
        'すべての画像処理に失敗しました。各画像のエラーを確認してください。',
      batchProgressPrefix: '完了 ',
      batchItemsTitle: '画像ごとの処理ステータス',
      processedCount: '処理数',
      outputTotalSize: '出力合計容量',
      failedCount: '失敗数',
      compressionCountPrefix: 'TinyPNG 回数：',
    },
    status: {
      idle: '画像のアップロード待ちです。',
      reading: '画像情報を読み取っています。',
      ready: '画像の準備ができました。',
      pending: '処理待ち',
      processing: 'ローカル処理結果を生成しています。',
      compressing: 'TinyPNG 圧縮へ接続しています。',
      batchProcessingPrefix: '処理中 ',
      batchCompressingPrefix: '圧縮中 ',
      itemProcessing: 'ローカル処理中',
      itemCompressing: 'TinyPNG 圧縮中',
      itemDone: '完了',
      done: '処理が完了しました。',
    },
    validation: {
      noFile: '先に画像をアップロードしてください。',
      noBase64: '先に base64 画像内容を入力してください。',
      invalidBase64:
        'base64 画像を解析できません。内容が完全か確認してください。',
      copyFailed: 'コピーに失敗しました。手動で選択してコピーしてください。',
      unsupported:
        'この画像は読み取れません。PNG、JPEG、WebP、AVIF をお試しください。',
      failed: '処理に失敗しました',
      failedPrefix: '処理に失敗しました：',
    },
  },
  reportPolishTool: {
    backToTools: 'オンラインツール',
    title: '日報 / 週報リライト',
    description:
      '作業メモを、事実を保ったまま自然で控えめな報告文に整えます。AI っぽい大げさな表現は抑えます。',
    typeLabel: '報告タイプ',
    daily: '日報',
    weekly: '週報',
    polishPrompt: {
      reportTypes: {
        daily: '日報',
        weekly: '週報',
      },
      typeLabel: '報告タイプ',
      instructionsTitle: 'リライト要件：',
      instructions: [
        '「元メモ」の内容だけを整えてください。',
        '「参考例」がある場合は、構成、語気、詳しさ、表現の方向性だけを参考にし、参考例内の具体的な事実はコピーしないでください。',
        '最終出力は整えた報告本文だけにしてください。',
      ],
      sourceTitle: '元メモ',
      referenceTitle: '参考例',
    },
    switchConfirm:
      '報告タイプを切り替えると、現在の元メモ、参考例、リライト結果がクリアされます。切り替えますか？',
    inputTitle: '元メモ',
    inputDescription:
      '今日または今週の作業メモを貼り付けてください。箇条書きのままで大丈夫です。',
    inputPlaceholder:
      '例：\n- 新しいツールページの要件と文言を確認\n- バックエンドとリライト API の mode を確認\n- タイムゾーンツールのモバイル表示を調整\n- 明日はテストとリリース前確認を進める',
    referenceTitle: '参考例',
    referenceDescription:
      '任意です。参考にしたい日報 / 週報の書き方を貼ると、結果が構成、語気、詳しさを参考にします。',
    referencePlaceholder:
      '例：\n今週は主にツールページの要件確認と API 連携を進めました。全体の進捗はおおむね予定通りです。一部文言はまだ表現をそろえる必要があるため、来週はテスト追加とレビュー反映を進める予定です。',
    outputTitle: 'リライト結果',
    outputDescription:
      '実務向けの落ち着いた文章に整えます。最後に自分の言い方へ微調整できます。',
    outputEmpty:
      '「リライトする」を押すと、整えた日報 / 週報がここに表示されます。情報が不足している場合、進捗は作りません。',
    polish: 'リライトする',
    polishing: 'リライト中',
    useSample: 'サンプルを入力',
    useReferenceSample: 'サンプルを入力',
    reset: 'クリア',
    copy: '結果をコピー',
    copied: 'コピー済み',
    charCountSuffix: ' 文字',
    success:
      '控えめな報告文を生成しました。必要に応じて自分の口調に合わせて調整してください。',
    errors: {
      empty: '先にリライトする作業メモを入力してください。',
      failed: 'リライトに失敗しました。しばらくしてから再試行してください。',
      copyFailed: 'コピーに失敗しました。結果を手動で選択してください。',
    },
    tipsTitle: 'リライト方針',
    tips: [
      '表現と構成だけを整え、未記載の事実、数値、日付、成果は追加しません。',
      '今週の作業と来週の予定は、一般的な業務報告の書き方にします。',
      '通常の進捗を大げさに見せる言い回しや流行語は避けます。',
    ],
    sampleDaily:
      '注文絞り込み、支払い状態とアフターサービス状態を接続\nモバイルの絞り込みバー、高さ戻らない問題を修正。transition 後の inline style が原因\nバックエンドに旧アフターサービス状態が 2 つ残っていて、原型と合わない。いったん一時マッピング、プロダクト確認待ち\n明日はエクスポート権限と URL パラメータ同期を見る',
    sampleWeekly:
      '今週は会員センターのポイント明細\n一覧、絞り込み、ページネーション、空状態はだいたい完了\nポイント種別 enum が新旧 2 種類あり、フロントで一時互換\n交換履歴 API に操作人フィールドがなく、来源を出せない。列はいったん非表示\nスモークテストを数件追加\n来週は交換履歴接続、モバイル表の調整、ポイント種別文言はプロダクト確認待ち',
    sampleReferenceDaily:
      '本日の作業：\n1. 作業一を完了し、進捗と現在の状態を記載します。\n2. 作業二を完了し、連携、検証、修正内容を補足します。\n3. 作業三を同期し、確認済みの問題や継続対応点を記録します。\n\n明日の予定：\n1. 次の開発または連携作業を進めます。\n2. 必要なテストと境界ケース確認を追加します。\n3. フィードバックに基づいて小さく調整します。\n\n必要な支援：\n1. プロダクトまたはバックエンドに確認したい仕様や表現。\n2. QA に重点確認してほしい境界ケース。',
    sampleReferenceWeekly:
      '今週の作業：\n1. モジュール一の主要開発を完了し、現在の完成度と影響範囲を記載します。\n2. モジュール二の連携または不具合修正を完了し、主な対応結果を記載します。\n3. テスト、ドキュメント、リリース準備を補足し、確認済みの範囲を記載します。\n\n来週の予定：\n1. 次の段階の機能開発を進めます。\n2. テストケースと異常系の検証を補います。\n3. レビューまたは受け入れ結果に基づいて小さく改善します。\n\n難点と必要な支援：\n1. 確認が必要なプロダクトルールまたは API フィールド。\n2. バックエンド、QA、デザインの協力が必要な事項。\n3. 進捗に影響する可能性があるリスク。',
  },
  utilityTool: {
    backToTools: 'オンラインツール',
    input: '入力',
    output: '結果',
    format: '整形',
    minify: '圧縮',
    encode: 'エンコード',
    decode: 'デコード',
    copy: '結果をコピー',
    copied: 'コピー済み',
    clear: 'クリア',
    invalidJson: 'JSON の形式が正しくありません。内容を確認してください。',
    invalidBase64: 'Base64 の内容が無効です。内容を確認してください。',
    color: 'カラー',
    contrast: 'コントラスト',
    accessible: '読みやすい',
    needsContrast: 'コントラスト不足',
    qrcodeContent: 'QR コード内容',
    qrcodeSize: 'サイズ',
    download: 'PNG をダウンロード',
    preview: 'プレビュー',
    markdownHint:
      '見出し、リスト、引用、コードブロック、段落に対応しています。',
    jsonPlaceholder: '{\n  "hello": "ORZ2"\n}',
    base64Placeholder: 'エンコードまたはデコードするテキストを入力',
    markdownPlaceholder: '# タイトル\n\nMarkdown を書き始めましょう…',
    qrcodePlaceholder: 'https://orz2.online',
  },
  timezoneTool: {
    backToTools: 'オンラインツール',
    title: 'タイムゾーン変換',
    description:
      '一般的な国を選び、片側の現地時刻を入力すると、夏時間ルール込みでもう片側を自動換算します。',
    leftSide: '左側',
    rightSide: '右側',
    sourceBadge: '基準',
    convertedBadge: '換算',
    countryLabel: '国 / タイムゾーン',
    timeLabel: '現地時刻',
    zoneNameLabel: 'ゾーン',
    utcOffsetLabel: 'UTC オフセット',
    dstLabel: '夏時間',
    dstActive: '夏時間',
    dstInactive: '標準時',
    noDst: '夏時間なし',
    swapSides: '左右を交換',
    noteTitle: '夏時間について',
    noteDescription:
      '換算はブラウザ内蔵の IANA タイムゾーンデータベースを使用するため、追加依存は不要です。米国、英国、オーストラリアなどは選択した日付に応じて自動的に夏時間または標準時へ切り替わります。',
    zones: {
      china: {
        country: '中国',
        city: '上海 / 北京時間',
      },
      unitedStates: {
        country: '米国',
        city: 'ニューヨーク / 東部時間',
      },
      'us-east': {
        country: '米国',
        city: '東部時間（EST / EDT）',
      },
      'us-central': {
        country: '米国',
        city: '中部時間（CST / CDT）',
      },
      'us-mountain': {
        country: '米国',
        city: '山地時間（MST / MDT）',
      },
      'us-pacific': {
        country: '米国',
        city: '太平洋時間（PST / PDT）',
      },
      'us-alaska': {
        country: '米国',
        city: 'アラスカ時間（AKST / AKDT）',
      },
      'us-hawaii': {
        country: '米国',
        city: 'ハワイ時間（HST）',
      },
      unitedKingdom: {
        country: '英国',
        city: 'ロンドン',
      },
      japan: {
        country: '日本',
        city: '東京',
      },
      southKorea: {
        country: '韓国',
        city: 'ソウル',
      },
      singapore: {
        country: 'シンガポール',
        city: 'シンガポール',
      },
      india: {
        country: 'インド',
        city: 'ニューデリー',
      },
      australia: {
        country: 'オーストラリア',
        city: 'シドニー',
      },
      germany: {
        country: 'ドイツ',
        city: 'ベルリン',
      },
      france: {
        country: 'フランス',
        city: 'パリ',
      },
      canada: {
        country: 'カナダ',
        city: 'トロント / 東部時間',
      },
      mexico: {
        country: 'メキシコ',
        city: 'メキシコシティ',
      },
      brazil: {
        country: 'ブラジル',
        city: 'サンパウロ',
      },
      argentina: {
        country: 'アルゼンチン',
        city: 'ブエノスアイレス',
      },
      italy: {
        country: 'イタリア',
        city: 'ローマ',
      },
      spain: {
        country: 'スペイン',
        city: 'マドリード',
      },
      netherlands: {
        country: 'オランダ',
        city: 'アムステルダム',
      },
      russia: {
        country: 'ロシア',
        city: 'モスクワ',
      },
      newZealand: {
        country: 'ニュージーランド',
        city: 'オークランド',
      },
      indonesia: {
        country: 'インドネシア',
        city: 'ジャカルタ',
      },
      vietnam: {
        country: 'ベトナム',
        city: 'ホーチミン',
      },
      malaysia: {
        country: 'マレーシア',
        city: 'クアラルンプール',
      },
      philippines: {
        country: 'フィリピン',
        city: 'マニラ',
      },
      turkey: {
        country: 'トルコ',
        city: 'イスタンブール',
      },
      uae: {
        country: 'アラブ首長国連邦',
        city: 'ドバイ',
      },
      saudiArabia: {
        country: 'サウジアラビア',
        city: 'リヤド',
      },
      southAfrica: {
        country: '南アフリカ',
        city: 'ヨハネスブルグ',
      },
      egypt: {
        country: 'エジプト',
        city: 'カイロ',
      },
      thailand: {
        country: 'タイ',
        city: 'バンコク',
      },
    },
  },
  teamPage: {
    heroTitle: 'コアチーム',
    heroDescription:
      'ORZ2 チームはプロダクト、開発、デザイン、ビジネス、組織運営を横断し、ツールサイトを構想から長期運用へ進めます。',
    gridAriaLabel: 'ORZ2 チームメンバー',
    avatarAlt: 'アバター',
  },
  privacy: {
    heroTitle: 'プライバシーポリシー',
    heroDescription:
      '必要性、透明性、差し替えやすさを原則に、将来の広告や商用サービス連携にも対応できるデータ・合規説明を設計しています。',
    tocAriaLabel: 'プライバシーポリシー目次',
    sections: [
      {
        id: 'overview',
        title: '概要',
        body: '本ポリシーは、ORZ2 がオンラインツール、プロダクト展示、カスタム相談、サイト分析、広告サービスを提供する際に関わる情報処理を説明します。公開ページ、プライバシーリンク、連絡手段をアクセス可能な状態に保ちます。',
      },
      {
        id: 'collection',
        title: '収集する情報',
        body: '情報収集は最小限にします。ユーザーが連絡する際、メール、要件説明、プロジェクト背景を提供する場合があります。サイト訪問時には、ブラウザからデバイス種別、ページパス、参照元、基本ログが渡されることがあります。',
      },
      {
        id: 'usage',
        title: '情報の利用',
        body: '情報は問い合わせ対応、ツール体験の改善、異常調査、ページ品質の測定、サービス安全性の維持に利用します。個人情報を販売せず、公開ページの閲覧に不要な情報を求めません。',
      },
      {
        id: 'cookies',
        title: 'Cookie とローカルストレージ',
        body: 'ORZ2 は必要な Cookie またはローカルストレージを用いて、テーマ、言語、ログイン状態、フォーム下書き、最近の利用記録を保存する場合があります。Google Analytics および Google AdSense 導入後、Google とその他の第三者サービス提供者は、Cookie、類似技術、Web beacon を利用し、サイトの利用状況を測定し、本サイトまたは他サイトへの訪問に基づいて広告の配信、測定、パーソナライズを行う場合があります。',
      },
      {
        id: 'third-party',
        title: '第三者サービスと広告',
        body: '本サイトは Google Analytics を使用して、流入元、ページ性能、基本的な操作傾向を測定します。本サイトで Google AdSense を使用する場合、Google の広告 Cookie により、Google とそのパートナーは本サイトおよびインターネット上の他サイトへの訪問に基づいて広告を配信できます。第三者広告配信を無効にしていない場合、その他の第三者ベンダーや広告ネットワークも Cookie を使用して広告を配信する場合があります。ユーザーは Google データとプライバシー https://myaccount.google.com/data-and-privacy、Google 広告設定 https://adssettings.google.com、または https://www.aboutads.info で関連する設定を管理できます。',
      },
      {
        id: 'consent',
        title: '地域別同意と広告設定',
        body: '欧州経済領域、英国、スイスのユーザーに広告を表示する場合、適用法および Google EU User Consent Policy に従い、Google CMP または認定済み第三者 CMP を通じて必要な開示を行い、Cookie、ローカルストレージ、パーソナライズ広告に必要な同意を取得します。ユーザーはブラウザ設定で Cookie を制限または削除することもできます。',
      },
      {
        id: 'rights',
        title: 'ユーザーの権利',
        body: 'ユーザーは連絡手段を通じて提出した情報の確認、修正、削除を求めることができ、ブラウザ設定で Cookie を管理できます。プライバシー関連の要請には合理的な期間内に対応します。',
      },
      {
        id: 'contact',
        title: 'お問い合わせ',
        bodyBeforeEmail: '本ポリシーまたはデータ処理について質問がある場合は ',
        bodyAfterEmail:
          ' までご連絡ください。プライバシー、広告、データ利用に関する要請には合理的な期間内に対応します。',
      },
    ],
  },
  designSystem: {
    heroTitle: 'デザインシステム',
    heroDescription:
      'ORZ2 の共通コンポーネント、視覚 token、インタラクション状態の公開リファレンスです。抑制された明快さで、ツール拡張の安定した土台になります。',
    colors: ['Brand', 'Brand Dark', 'Ink', 'Muted', 'Line', 'Soft'],
    typography: [
      ['Caption', '補助説明と状態時間'],
      ['Body small', 'ツール本文とコントロール文字'],
      ['Body', '通常本文'],
      ['Lead', 'ページ説明と重要説明'],
      ['Heading', 'モーダルと記事セクション見出し'],
    ],
    cardTones: [
      ['default', '標準パネル', 'リスト、概要、通常コンテンツ向け。'],
      ['soft', '柔らかいパネル', '二次情報と軽いグルーピング向け。'],
      ['brand', 'ブランドパネル', '進捗、ハイライト、重要な案内向け。'],
      ['warm', 'ウォームパネル', '操作前の準備説明向け。'],
      ['danger', '危険パネル', 'エラーやブロック通知向け。'],
    ],
    catalogFeatureGroups: [
      ['情報', 'logo/icon、グループ、段階、バージョン、更新日'],
      ['平台', 'WEB、H5、WEAPP、APP、EXTENSION'],
      ['入口', '主リンク、QR、WeChat コード、準備中状態'],
      ['交互', '複数入口切替、スキャン Tooltip、固定サイズパネル'],
    ],
    sections: {
      visual: {
        title: '視覚基盤',
        description: '色、角丸、影が ORZ2 の緑系ツールスタイルを形作ります。',
      },
      buttons: {
        title: 'ボタンとタグ',
        description:
          '操作階層を統一し、情報密度の高いツールページにも合うコンパクトな表現を保ちます。',
      },
      cards: {
        title: 'カードとパネル',
        description:
          'OCard は共通の容器感を提供し、業務モジュールは意味に合う tone を選ぶだけです。',
      },
      catalog: {
        title: '目录カード',
        description:
          'OCardCatalog は共通 CatalogItem モデルでプロダクト、ツール、ブログ、ゲーム、多端项目を扱います。',
      },
      states: {
        title: '状態とモーダル',
        description:
          '空状態とモーダルは同じ視覚言語で、直接的でやさしいフィードバックを保ちます。',
      },
    },
    labels: {
      radius: '角丸',
      shadow: '影',
      spacing: '余白スケール',
      typography: 'タイポグラフィ',
      compactButton: 'コンパクト',
      primaryAction: '主操作',
      keyAction: '重要操作',
      secondaryAction: '副操作',
      ghostAction: '軽い操作',
      disabledState: '無効状態',
      addItem: '項目を追加',
      defaultBadge: '標準タグ',
      brandBadge: 'ブランドタグ',
      warningBadge: '注意タグ',
      dangerBadge: '危険タグ',
      pillBadge: 'ピルタグ',
      accentBar: 'アクセントバー',
      accentBarDescription:
        'フォームパネルやリズムを強めたい业务グループに使います。',
      emptyState: '一致する結果がありません。条件を調整してください。',
      openModal: 'モーダル例を見る',
      closeModal: '例モーダルを閉じる',
      modalTitle: '統一されたモーダル容器',
      modalDescription:
        'OModal は遮罩、Esc 閉じ、背景クリック閉じ、ページスクロールロック、閉じた後のフォーカス復元を内包しています。',
      cancel: 'キャンセル',
      confirm: '確認',
    },
  },
  publisher: {
    fallbackName: '公众号发布',
    fallbackSummary:
      'テンプレートを選ぶだけで記事、カバー、本文画像、摘要を生成し、高度設定では全項目を編集できます。',
    defaultRewriteRequirement:
      '原文の中心事実、情報価値、読者メリットを保ちながら、新しい WeChat 記事として書き直してください。タイトル、導入、段落順、表現、事例のつなぎ方は原文と明確に変えてください。文単位の言い換えや印象的な表現の流用は避け、WeChat で読みやすい構成、余白、編集感のあるレイアウトにしてください。',
    backLabel: 'ツール',
    jsonActionsAriaLabel: 'JSON 設定操作',
    importJson: 'JSON を読み込む',
    exportJson: 'JSON を書き出す',
    setupAriaLabel: 'WeChat 管理画面設定の拡大図を見る',
    setupImageAlt:
      'WeChat 管理画面で AppId、AppSecret、API IP ホワイトリストを設定する図',
    setupTitle: '先に WeChat 開発設定を完了',
    setupSteps: [
      'WeChat 開発者コンソールを開き、公開する公众号を選びます。',
      '開発設定で AppId と AppSecret を取得し、下の設定に入力します。',
      'API IP ホワイトリストを設定し、追加します',
    ],
    openWechatConsole: 'WeChat コンソールを開く',
    copiedIp: 'IP コピー済み',
    copyIp: 'ホワイトリスト IP をコピー',
    providers: {
      AGNES: 'AGNES',
      MINIMAX: 'MINIMAX',
    },
    modeSwitch: {
      title: '操作モード',
      description: '新規作成または既存記事のリライトを選択します。',
      legend: '操作モード *',
    },
    modes: {
      create: {
        label: 'AI 公众号作成',
        description:
          'プロンプト、カバー画像、本文画像から新しい草稿を生成します。',
      },
      rewrite: {
        label: 'AI 公众号リライト',
        description:
          '公众号原文リンクと要件から、文章・画像・レイアウトを再構成します。',
      },
    },
    automation: {
      eyebrow: '定時草稿サービス',
      title: '予定に合わせて公众号草稿を自動生成',
      description:
        '時刻、テーマルール、業務データに合わせて草稿を生成し、WeChat 草稿箱へ保存するタスクをカスタマイズできます。',
      action: 'メールで相談',
      emailSubject: '公众号定時草稿タスクの相談',
    },
    simpleMode: {
      title: 'コンテンツテンプレート',
      description:
        'テンプレートを選んで開始し、必要な場合だけこのテンプレートを調整できます。',
      templateLabel: 'コンテンツテンプレート *',
      selectorAriaLabel: '公众号コンテンツテンプレートを選択',
      ready: 'ワンクリック設定完了',
      promptFact: 'テンプレートプロンプト',
      coverFact: 'AI カバー',
      inlineFact: '本文画像 3 枚',
      digestFact: 'LLM 自動摘要',
      createHint:
        '選択したテンプレートのプロンプト、カバープロンプト、先頭 3 件の本文画像プロンプトを使用します。',
      rewriteHint:
        '原文、テンプレート、既定のリライト要件を組み合わせ、文章・画像・レイアウトを自動生成します。',
      selectedPrefix: '',
      selectedSuffix: 'テンプレートを選択しました。草稿を生成できます。',
    },
    customization: {
      show: 'このテンプレートをカスタマイズ',
      hide: 'カスタマイズを閉じる',
      replaceAriaLabel: 'テンプレート設定の置換を確認',
      replaceTitle: '現在のカスタマイズを置き換えますか？',
      replaceDescriptionPrefix: '「',
      replaceDescriptionSuffix:
        '」に切り替えると、現在のプロンプトと画像設定が上書きされます。',
      cancel: 'キャンセル',
      replace: '設定を置き換える',
    },
    autoFill: {
      chip: '自動入力済み',
      clear: 'クリア',
      clearAria: '自動入力内容をクリア',
      bannerPrefix: '',
      bannerMiddle: '個のフィールドにテンプレートを自動入力しました',
      undo: '入力を取り消す',
      closeTip: 'ヒントを閉じる',
      menuAriaLabel: 'プロンプトテンプレートを選択',
      menuTitle: 'プロンプトテンプレートを選択',
      menuDescription:
        'テンプレートを切り替えると、プロンプトと AI 画像説明を入力します。既存内容は置換前に確認します。',
      coverCountPrefix: '置換対象',
      coverCountSuffix: '項目',
      defaultCountPrefix: '既定選択',
      defaultCountSuffix: '項目',
      confirmTitlePrefix: '',
      confirmTitleSuffix: 'テンプレートに切り替えますか？',
      confirmDescriptionPrefix:
        '置換する項目を選択してください。未選択の項目は元の値を保持します。合計',
      confirmDescriptionMiddle: '項目、選択済み',
      confirmDescriptionSuffix: '項目。',
      closeConfirm: '確認を閉じる',
      selectAll: '全選択',
      selectNone: '全解除',
      replacePrefix: '置換',
      replaceSuffix: '項目',
      cancel: 'キャンセル',
      appliedPrefix: '',
      appliedMiddle: 'テンプレートを適用し',
      appliedSuffix: '項目を入力しました。取り消せます。',
      revertedPrefix: '',
      revertedSuffix: 'テンプレートの自動入力を取り消しました。',
      clearedField: 'この項目の自動入力内容をクリアしました。',
      fieldLabels: {
        promptSystem: 'システムプロンプト',
        promptContent: '本文プロンプト',
        cover: 'カバー画像説明（AI）',
        inline: '本文画像',
        inlineSuffix: '説明（AI）',
      },
    },
    sections: {
      account: {
        title: '公众号設定',
        description: '公開アカウントを接続し、草稿タイプを選択します。',
        appIdPlaceholder: '公众号 appId を入力',
        appSecretPlaceholder: '公众号 appSecret を入力',
        draftType: '草稿タイプ *',
        newsType: 'news 图文消息',
        provider: 'AI モデル *',
        modelSelectorAriaLabel: 'AI プロバイダー（モデル）を選択',
      },
      prompt: {
        title: '記事生成プロンプト',
        description: 'コンテンツ役割、テーマ、構成、参照情報を定義します。',
        systemLabel: 'システムプロンプト',
        systemPlaceholder: '例：あなたはプロの公众号編集者です...',
        contentLabel: '本文プロンプト',
        contentPlaceholder: '記事テーマ、読者、語調、構成要件を入力...',
        references: '参照情報',
        aiFill: 'AI 自動入力',
      },
      images: {
        title: 'カバーと本文画像',
        description:
          'カバー画像と本文挿絵を管理します。AI 説明、URL、ローカルファイルに対応。',
        coverLabel: 'カバー画像生成値 *',
        coverAiPlaceholder: '生成したいカバー画像を説明',
        coverUrlPlaceholder: 'https://example.com/cover.png',
        inlineTitle: '本文画像',
        inlineAddedPrefix: '追加済み',
        inlineAddedSuffix: '/ 9 枚',
        inlineEmpty: '本文画像は後で追加できます',
        addImage: '画像を追加',
        inlineImage: '本文画像',
        deleteInlineImage: '本文画像を削除',
        imageValueLabel: '画像生成値',
        imageAiPlaceholder: 'この本文画像を説明',
        imageUrlPlaceholder: 'https://example.com/inline.png',
      },
      meta: {
        title: '記事メタ情報',
        description: '作者とコメントのみ設定し、摘要は LLM が自動生成します。',
        author: '作者',
        authorPlaceholder: '作者名',
        comment: 'コメント設定 *',
      },
      rewrite: {
        title: 'リライト設定',
        description:
          '原文リンクとリライト要件を編集し、プロンプト、画像、レイアウト方針を細かく調整します。',
        simpleDescription:
          '公众号原文リンクを貼り付ければ、残りはテンプレートと AI が処理します。',
        templateHint:
          '現在のテンプレート設定を使用します。カスタマイズを開くと、リライト要件と本文画像を調整できます。',
        sourceUrl: 'リライトする公众号リンク *',
        sourceUrlPlaceholder:
          'https://mp.weixin.qq.com/s/5b9Z4EOs3wsMgc6GqAGHBQ',
        sourceUrlHint:
          'mp.weixin.qq.com/s で始まる WeChat 公众号記事リンクに対応します。',
        requirement: 'リライト特別要件 *',
        requirementPlaceholder:
          'トーン、読者、文字量、レイアウト、避けたい表現を入力...',
        requirementHint:
          '初心者でもそのまま使える既定要件を入力済みです。必要に応じて調整してください。',
      },
    },
    references: { festivals: '祝日', solarTerms: '二十四節気' },
    comments: {
      closed: 'コメントを閉じる',
      open: 'コメントを開く',
      fansOnly: 'フォロワーのみ',
    },
    completion: {
      account: '公众号設定',
      template: 'コンテンツテンプレート',
      prompt: '記事プロンプト',
      images: 'カバーと本文画像',
      meta: '記事メタ情報',
      rewriteSource: '原文リンク',
      rewriteRequirement: 'リライト要件',
    },
    progress: {
      ariaLabel: 'リアルタイム公開状態',
      title: '公開タイムライン',
      phases: {
        connecting: '接続中',
        publishing: '公開処理中',
        completed: '完了',
        failed: '問題が発生',
      },
      completedSuffix: 'ステップ完了',
      pending: '前のステップを待機中',
      completed: '完了',
      running: '処理中',
      inlineUploaded: '本文画像アップロード済み',
      inlineGenerating: '本文画像生成中',
      inlineUploadedSingle: '本文画像アップロード済み',
    },
    stepNames: [
      '記事内容を生成',
      'カバー画像を準備・アップロード',
      '本文画像を準備・アップロード',
      'WeChat 草稿を組み立て',
      'WeChat へ草稿を送信',
      '公開記録を保存',
    ],
    status: {
      autosave: 'フォームはこのブラウザに自動保存されます。',
      validationFailed: '必須項目を入力してから公開タスクを生成してください。',
      confirmTitle: '公開タスクを開始しますか？',
      confirmGenerate:
        '公開タスクの生成には時間がかかる場合があります。開始しますか？',
      confirmRewrite:
        'リライトタスクは原文を取得し、文章・画像・レイアウトを生成します。時間がかかる場合があります。開始しますか？',
      connecting: '公開サービスへ接続中。進捗はタイムラインに表示されます。',
      connected: '公開サービスに接続しました。WeChat 草稿を生成しています。',
      runningPrefix: '実行中：',
      runningFallback: 'WeChat 草稿公開ステップ',
      skipped: '一部素材をスキップしました。公開タスクは継続中です。',
      failedPrefix: '生成失敗：',
      failedFallback: '公開ステップの実行に失敗しました',
      draftCreatedPrefix: '草稿',
      draftCreatedSuffix: 'を生成しました。WeChat 管理画面で確認してください。',
      draftCreated: '草稿を生成しました。WeChat 管理画面で確認してください。',
      submitFailed: '公開タスクの送信に失敗しました',
      resetTitle: 'フォームをリセットしますか？',
      resetConfirm:
        'リセットするとフォームとローカル自動保存内容が消えます。続行しますか？',
      resetDone: 'フォームをリセットし、ローカル保存も更新しました。',
      exportDone: 'JSON 設定を書き出しました。',
      importDone: 'JSON 設定を読み込み、ローカルに保存しました。',
      importFailed:
        'JSON の読み込みに失敗しました。ファイル形式を確認してください。',
      copyFailedPrefix: '自動コピーできませんでした。',
      copyFailedSuffix: 'を API IP ホワイトリストに手動で追加してください。',
    },
    validation: {
      appId: '公众号 appId を入力してください。',
      appSecret: '公众号 appSecret を入力してください。',
      articleType: '草稿タイプを選択してください。',
      provider: 'AI プロバイダーを選択してください。',
      template: 'コンテンツテンプレートを選択してください。',
      promptSystem: 'システムプロンプトを入力してください。',
      promptContent: '本文プロンプトを入力してください。',
      rewriteSourceUrl: 'リライトする公众号リンクを入力してください。',
      rewriteSourceUrlInvalid:
        '有効な WeChat 公众号記事リンクを入力してください。例：https://mp.weixin.qq.com/s/5b9Z4EOs3wsMgc6GqAGHBQ。',
      rewriteRequirement: 'リライト特別要件を入力してください。',
      coverType: 'カバー画像生成タイプを選択してください。',
      coverValue: 'カバー画像生成値を入力またはアップロードしてください。',
      inlineTypePrefix: '本文画像',
      inlineTypeSuffix: 'に画像タイプがありません。',
      inlineValueSuffix: 'に生成値がありません。',
      comment: 'コメント設定を選択してください。',
    },
    aside: {
      summaryAriaLabel: '公開タスク概要',
      progressAriaLabel: '設定進捗',
      progressTitle: '設定進捗',
      actionAriaLabel: '公開操作',
      viewResult: '草稿公開結果を見る',
      reset: 'リセット',
      generating: '生成中...',
      generate: '公開タスクを生成',
      generateRewrite: 'リライトして草稿作成',
    },
    success: {
      closeAriaLabel: '草稿公開結果を閉じる',
      kicker: '公開タスク完了',
      title: '草稿が WeChat に届きました',
      description:
        'WeChat 草稿箱に保存されました。管理画面でレイアウト確認、細部調整、公開予約ができます。',
      draftTitle: '草稿タイトル',
      fallbackTitle: '公众号图文草稿',
      draftType: '草稿タイプ',
      typeNewspic: 'newspic 画像メッセージ',
      typeNews: 'news 图文消息',
      generatedAt: '生成時間',
      justNow: 'たった今',
      cover: 'カバー',
      coverDone: 'アップロード済み',
      coverProcessed: '処理済み',
      inlineImages: '本文画像',
      inlineUploadedSuffix: '枚アップロード済み',
      noInline: '本文画像なし',
      details: '素材処理詳細を見る',
      inlineDetail: '本文画像',
      stay: 'このページに残る',
      goDraftBox: 'WeChat 草稿箱へ',
      footnote:
        '草稿箱は新しいウィンドウで開きます。現在のタスク設定は保持されます。',
    },
    promptTemplates: {
      general: {
        label: '汎用ニュース',
        caption: 'ニュース・客観報道、情報密度と人間的観察を重視',
        fields: {
          promptSystem:
            '你是一名长期写深度公众号的资讯编辑。文字要可信、克制、有现场感，不像新闻通稿，也不像AI总结。你擅长把复杂事件讲清楚，同时保留人类作者的观察、停顿和判断。避免官话、套话、空洞升华、机械排比，以及“值得思考”“引发热议”“随着时代发展”等AI味表达。多使用具体时间、人物反应、场景细节和现实影响。',
          promptContent:
            '请围绕【主题】写一篇 1500–2200 字的公众号资讯文章。不要按生硬提纲填空，而要像一个真正编辑在讲述一件值得关注的事。文章需要交代：发生了什么、为什么重要、谁会受到影响、背后更深层的变化是什么。可以从一个具体现场、人物反应、数据变化或反常细节切入。段落要适合公众号阅读，长短有变化，允许单句成段。小标题自然，不要像PPT目录。结尾给出一个克制但有价值的观察，不要强行升华。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格参考深度新闻杂志：整体克制、留白充足、信息层次清楚。正文主色使用深灰，辅助说明使用中性灰；小标题可以使用左侧细线或浅灰背景强调，但不要花哨。关键事实、时间、数据可以用 strong 加粗；重要背景可以用 blockquote 做灰底导读。段落之间保持舒适间距，避免大段密集文字。',
          digest:
            '60–100 字。像编辑写给读者的导读，讲清“发生了什么 + 为什么值得看”，不要像机器摘要，不要堆形容词。',
          coverValue:
            'premium editorial cover, topic:【文章主题】, cinematic documentary photography, realistic texture, restrained emotion, strong focal point, magazine-style composition, typography-friendly negative space, no text, no watermark',
          inlineValueList: [
            'editorial news photography, realistic scene related to【事件主体】, documentary style, natural light, subtle human presence, restrained emotion, premium magazine quality, 16:9, no text, no watermark',
            'minimal editorial infographic about【核心数字/关键数据】, clean layout, restrained colors, modern publication design, lots of negative space, 16:9, no text, no watermark',
            'cinematic urban or workplace scene related to【事件影响】, realistic photography, calm tension, natural shadows, documentary magazine style, 16:9, no text, no watermark',
            'timeline editorial illustration for【事件进展节点】, clean modern layout, subtle icons, premium magazine style, 16:9, no text, no watermark',
            'human-centered documentary image about【受影响人群】, realistic emotion, shallow depth of field, natural light, quiet storytelling, 16:9, no text, no watermark',
            'close-up documentary photo about【关键人物/关键物件】, realistic texture, strong focal point, quiet dramatic light, editorial magazine quality, 16:9, no text, no watermark',
            'wide establishing shot related to【事件发生地点】, realistic urban documentary photography, atmospheric sky, calm but serious tone, 16:9, no text, no watermark',
            'editorial data visualization about【趋势变化】, abstract bars, curves or map elements, clean premium news design, restrained palette, 16:9, no text, no watermark',
            'symbolic editorial image about【深层变化/社会影响】, realistic metaphor, restrained emotion, cinematic composition, premium publication style, 16:9, no text, no watermark',
          ],
        },
      },
      insurance_advisor: {
        label: '保険アドバイザー',
        caption: '保障、家計、資産管理を理性的かつ長期視点で解説',
        fields: {
          promptSystem:
            '你是一名拥有多年从业经验的保险顾问和家庭财务规划师。你写公众号时，不销售产品，不制造焦虑，也不刻意治愈。你的目标是帮助普通家庭理解风险、建立保障体系、管理长期资产。文字应当理性、克制、可信，像一个认真负责的专业人士在分享经验。避免鸡汤、成功学、夸张案例、情绪煽动和销售话术。不要频繁使用“万一”“后悔”“一定要买”等制造压力的表达。多使用真实场景、家庭决策逻辑、保障原理、数据事实和长期观察。',
          promptContent:
            '请围绕【主题】写一篇 1500–2200 字的保险与家庭财务公众号文章。不要写成产品宣传稿，也不要写成保险科普教材。应当像一位经验丰富的保险顾问，在认真分析一个现实问题。文章可以从一个真实家庭场景、客户咨询案例、社会现象、理赔事件、政策变化或资产配置问题切入。重点回答：问题是什么、人们为什么容易忽略它、正确的决策逻辑是什么、保障与资产管理应该如何配合。不要直接推荐具体产品，而是帮助读者建立判断框架。允许表达个人观察和行业经验，但不要刻意制造权威感。小标题自然形成，不要像培训课件。结尾给出一个务实且长期主义的观察，不要强行升华。正文请输出微信公众号兼容 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格简洁专业，留白充足。正文主色深灰；数据、规则、定义可使用 strong 强调；重要观点可使用 blockquote 进行说明；避免大段密集文字。',
          digest:
            '60–100 字。用顾问视角告诉读者这篇文章讨论什么问题，以及为什么这件事与家庭保障或资产管理有关。不要写成营销文案。',
          coverValue:
            'professional financial advisor editorial cover, topic:【文章主题】, realistic lifestyle photography, trustworthy atmosphere, family finance planning, wealth protection, premium magazine composition, typography-friendly negative space, no text, no watermark',
          inlineValueList: [
            'realistic family financial planning scene related to【家庭场景】, natural interaction, trustworthy atmosphere, editorial photography, premium magazine quality, 16:9, no text, no watermark',
            'professional consultation scene about【保险决策】, advisor and client discussion, realistic office environment, documentary style, 16:9, no text, no watermark',
            'editorial infographic explaining【保障结构】, clean visual hierarchy, modern publication design, restrained colors, lots of negative space, 16:9, no text, no watermark',
            'realistic image illustrating【风险事件】, subtle storytelling, documentary photography, calm emotion, premium editorial style, 16:9, no text, no watermark',
            'financial planning workspace related to【资产配置】, documents, charts, laptop, clean professional atmosphere, magazine quality, 16:9, no text, no watermark',
            'human-centered portrait representing【目标人群】, authentic expression, natural light, trustworthy feeling, editorial photography, 16:9, no text, no watermark',
            'timeline illustration explaining【保障规划阶段】, minimalist editorial design, subtle icons, premium publication style, 16:9, no text, no watermark',
            'editorial visualization about【长期趋势】, demographic, medical cost or retirement related concepts, clean modern design, 16:9, no text, no watermark',
            'symbolic image about【家庭责任与风险管理】, realistic metaphor, restrained emotion, premium magazine composition, 16:9, no text, no watermark',
          ],
        },
      },
      culture: {
        label: '文化叙事',
        caption: '祝日・節気・人文物語、温度と余韻を重視',
        fields: {
          promptSystem:
            '你是一名有文化感但不掉书袋的公众号作者。你擅长把传统文化写得温暖、真实、贴近日常，而不是百科式介绍。文字要有生活细节、人物温度和一点余味。避免说教、宏大空话、堆典故、强行拔高。文化不是知识点堆砌，而是今天的人如何重新感受到它。',
          promptContent:
            '请围绕【节日/节气名称】写一篇 1200–1800 字的文化叙事文章。不要写成节日百科。可以从一个当代生活场景开始，比如一顿饭、一阵风、一盏灯、一次回家路上的感觉。文章需要自然带出历史源流、传统习俗、文化意象，以及它和今天生活的关系。可以加入一个真实或半真实的人物故事。节奏要温和，有画面感，结尾留一点余味，不要喊口号。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要有东方文化的安静感：留白多，段落不要挤，小标题可以使用淡米色、浅棕色或细边框营造雅致感。适合使用 blockquote 承载诗意引子、旧俗解释或一小段文化观察。传统意象、节令词、器物名可以适度加粗，但不要堆砌装饰。整体像一本温润的人文杂志，不像百科词条。',
          digest:
            '60–100 字。突出一个文化意象和一种情绪，让人想点开读，而不是像百科摘要。',
          coverValue:
            'premium Chinese cultural editorial cover, topic:【节日/节气】, poetic atmosphere, traditional motifs, ink wash texture, warm restrained palette, elegant negative space, magazine-style composition, no text, no watermark',
          inlineValueList: [
            'contemporary Chinese daily life scene related to【节日/节气】, warm natural light, poetic realism, subtle human presence, editorial photography style, 16:9, no text, no watermark',
            'traditional cultural still life related to【代表性习俗/器物】, elegant composition, soft light, ink wash inspired texture, premium editorial style, 16:9, no text, no watermark',
            'ancient Chinese poetic illustration about【历史源流/典故】, refined brushwork, restrained colors, cinematic composition, 16:9, no text, no watermark',
            'seasonal nature image related to【物候意象】, poetic landscape, soft atmosphere, minimal composition, elegant negative space, 16:9, no text, no watermark',
            'modern ritual scene about【今天可做的小仪式】, warm indoor light, realistic lifestyle photography, calm emotion, magazine quality, 16:9, no text, no watermark',
            'family gathering scene related to【团圆/传承】, warm realistic photography, soft indoor light, subtle emotion, premium cultural editorial style, 16:9, no text, no watermark',
            'poetic close-up of【节令食物/手作】, elegant table setting, natural texture, restrained warm colors, magazine still life photography, 16:9, no text, no watermark',
            'traditional architecture or old street related to【地域文化】, misty morning light, poetic realism, refined Chinese editorial atmosphere, 16:9, no text, no watermark',
            'symbolic cultural illustration about【文化余味/精神意象】, ink wash and modern editorial fusion, quiet negative space, elegant composition, 16:9, no text, no watermark',
          ],
        },
      },
      tech: {
        label: 'テックレビュー',
        caption: '製品レビュー・技術解説、体験と判断を重視',
        fields: {
          promptSystem:
            '你是一名真正懂产品和用户体验的科技作者。不要写成发布会文案、参数说明书或营销软文。你擅长把技术细节翻译成普通人能感知的体验差异。语言清晰、克制、有判断。允许写优点，也要写取舍和小缺点。避免“重新定义”“颠覆行业”“未来已来”等空泛科技套话。',
          promptContent:
            '请围绕【产品/技术主题】写一篇 1800–2600 字的公众号科技文章。文章要像一个认真体验过的人在分享判断，而不是复制参数表。可以从一个真实使用瞬间切入，再展开它的核心能力、体验差异、适合人群、同类对比和购买/使用建议。参数可以出现，但必须解释“对用户意味着什么”。结论要有明确立场，也要说明不适合谁。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要偏现代科技媒体：结构清晰、模块感强、阅读效率高。可以用浅灰或深色系 section 做“体验结论”“适合人群”“不适合人群”“购买建议”等信息卡片。参数不要堆成长表，优先用短列表解释用户感知。关键结论用 strong 加粗，小标题要明确但不夸张。整体像高质量科技评测文章，不像发布会PPT。',
          digest:
            '60–100 字。提炼最关键的体验差异、适合人群和一个明确判断，不要像产品广告。',
          coverValue:
            'premium tech editorial cover, topic:【产品/技术】, cinematic lighting, realistic industrial design, dark background, subtle glow accents, futuristic but restrained, magazine-style composition, no text, no watermark',
          inlineValueList: [
            'premium editorial tech photography of【产品/技术】, cinematic industrial lighting, realistic texture, dark clean background, 16:9, no text, no watermark',
            'real-life usage scenario of【产品/技术】, human interaction, natural light, documentary lifestyle tech photography, 16:9, no text, no watermark',
            'minimal comparison infographic about【核心参数/能力对比】, clean modern layout, restrained colors, editorial style, 16:9, no text, no watermark',
            'technical breakdown illustration for【工作原理/内部结构】, modern line art, subtle highlights, premium infographic aesthetic, 16:9, no text, no watermark',
            'workspace scene using【产品/技术】, cinematic natural light, realistic productivity atmosphere, premium lifestyle-tech editorial style, 16:9, no text, no watermark',
            'close-up macro shot of【产品细节/交互界面】, realistic material texture, cinematic reflections, premium tech magazine style, 16:9, no text, no watermark',
            'user testing scene related to【真实体验/痛点】, ordinary person using device or software, natural light, documentary tech editorial style, 16:9, no text, no watermark',
            'ecosystem diagram illustration about【生态/兼容性】, clean nodes and connections, futuristic restrained design, premium publication style, 16:9, no text, no watermark',
            'buying decision visual about【适合人群/不适合人群】, split-screen editorial composition, clean modern tech aesthetic, restrained colors, 16:9, no text, no watermark',
          ],
        },
      },
      lifestyle: {
        label: 'ライフスタイル',
        caption: '軽やかで現実感のある生活文',
        fields: {
          promptSystem:
            '你是一名生活方式类公众号作者，文字温和、克制、有呼吸感。不要假装治愈，不要贩卖焦虑，不要写鸡汤。你更擅长记录普通生活里的细节：光线、气味、声音、动作、温度和空间感。文章应该像一个真实的人在认真观察生活，而不是AI在制造情绪。',
          promptContent:
            '请围绕【生活主题】写一篇 1000–1600 字的生活方式文章。不要写成“治愈系模板文”。可以从一个清晨、午后或夜晚的具体瞬间开始，用几个生活细节慢慢展开。文章要有画面、有节奏、有轻微情绪，但不要过度文艺。可以写一个小习惯、小物件或小场景，最后自然收住，不要强行升华。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要轻盈、干净、有呼吸感：段落短一些，留白多一些，避免信息块过重。可以使用浅米色、淡绿色、暖灰色做柔和背景；小标题不要太硬，可以像杂志栏目标题。适合用少量 blockquote 承载一句生活观察。不要做夸张渐变和复杂装饰，整体像安静的生活杂志页面。',
          digest:
            '60–100 字。捕捉一种具体生活氛围，不要使用“治愈”“松弛感”等空泛热词堆砌。',
          coverValue:
            'premium lifestyle editorial photography, topic:【生活主题】, warm natural light, relaxed composition, realistic texture, calm atmosphere, magazine cover style, typography-friendly negative space, no text, no watermark',
          inlineValueList: [
            'quiet lifestyle photography related to【生活主题】, soft morning or afternoon light, realistic home scene, calm atmosphere, 16:9, no text, no watermark',
            'close-up editorial photo of daily details related to【光影/气味/声音】, shallow depth of field, warm natural light, realistic texture, 16:9, no text, no watermark',
            'minimal interior scene about【空间/小物件】, relaxed composition, premium magazine photography, natural shadows, 16:9, no text, no watermark',
            'human solitude moment related to【独处/习惯】, back view or partial figure, cinematic soft light, emotionally restrained, 16:9, no text, no watermark',
            'ending atmosphere image related to【文末意象】, window light, plants, sky or quiet room, minimal composition, elegant negative space, 16:9, no text, no watermark',
            'slow morning routine scene about【日常小习惯】, coffee, book, blanket or desk, warm natural light, realistic lifestyle editorial style, 16:9, no text, no watermark',
            'seasonal lifestyle image related to【季节/天气】, rain, sunlight, breeze or evening sky, calm poetic realism, premium magazine composition, 16:9, no text, no watermark',
            'hands interacting with【小物件/手作/家务】, close-up lifestyle photography, natural texture, soft shadows, quiet storytelling, 16:9, no text, no watermark',
            'neighborhood walking scene related to【日常散步/城市角落】, realistic street light, gentle human presence, calm editorial photography, 16:9, no text, no watermark',
          ],
        },
      },
      business: {
        label: 'ビジネス',
        caption: '業界分析・商業洞察、理性と判断を重視',
        fields: {
          promptSystem:
            '你是一名商业财经专栏作者，擅长把公司、行业和政策放进更长的周期里观察。文章要有判断，但不要情绪化；要有数据，但不要堆砌报表；要有深度，但不要写成研报。你的语言克制、有锋芒、有现实感。避免“资本寒冬”“风口已至”“下半场”等陈词滥调。',
          promptContent:
            '请围绕【商业话题】写一篇 2000–2800 字的公众号深度分析。不要写成标准研报，也不要写成财经新闻拼贴。文章需要讲清：这件事为什么发生、商业逻辑是什么、产业链谁受益谁承压、头部玩家如何选择、未来 6–12 个月可能怎么演化。可以使用数据、案例和对比，但每个数据都要服务于判断。结尾给出风险与机会，不要喊口号。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格参考高端商业杂志：理性、干净、有纵深。可以使用深灰、金色点缀、浅灰底信息卡片。核心判断、关键数据、风险提示要通过 section 或 blockquote 单独呈现。列表要短而锋利，避免长篇堆砌。小标题要像商业专栏，不要像研报目录。整体要有专业感，但不能像证券报告。',
          digest:
            '60–100 字。给出核心判断 + 一个关键事实或数据。语气专业克制，不要像投资号标题党。',
          coverValue:
            'premium business editorial cover, topic:【商业话题】, dark charcoal background, subtle golden highlights, cinematic corporate atmosphere, restrained luxury, strong focal point, magazine-style composition, no text, no watermark',
          inlineValueList: [
            'business editorial photography related to【商业话题】, city skyline or corporate environment, cinematic lighting, restrained luxury, 16:9, no text, no watermark',
            'industry landscape visualization about【赛道格局】, premium data network aesthetic, dark background, subtle gold highlights, 16:9, no text, no watermark',
            'supply chain editorial image related to【上游/中游/下游】, realistic industrial or logistics scene, documentary style, 16:9, no text, no watermark',
            'minimal strategy comparison infographic about【头部玩家对比】, clean business magazine layout, restrained colors, 16:9, no text, no watermark',
            'risk and opportunity matrix visualization about【风险/机会】, elegant financial editorial design, dark professional palette, 16:9, no text, no watermark',
            'executive meeting scene related to【关键决策】, realistic corporate photography, muted tones, glass reflection, calm tension, 16:9, no text, no watermark',
            'market trend chart visualization about【增长/下滑趋势】, premium financial editorial design, clean lines, dark restrained background, 16:9, no text, no watermark',
            'consumer behavior scene related to【用户需求变化】, realistic retail, office or digital payment moment, documentary business photography, 16:9, no text, no watermark',
            'macro economy symbolic image about【政策/周期影响】, city lights, documents, subtle data overlay, cinematic business magazine style, 16:9, no text, no watermark',
          ],
        },
      },
      education: {
        label: '教育',
        caption: '学びやすく使える解説・チュートリアル',
        fields: {
          promptSystem:
            '你是一名懂教学设计的教育作者。你擅长把抽象知识讲成读者能理解、能练习、能立刻使用的内容。不要像教材，也不要像培训广告。表达要清楚、有层次、有例子。每个概念都要解释“它解决什么问题”。每个建议都要尽量可执行。',
          promptContent:
            '请围绕【学习主题】写一篇 1500–2200 字的公众号科普/教程文章。文章要让读者读完真的知道下一步怎么做。可以从一个常见困惑或真实学习场景切入，再解释核心概念、常见误区、练习路径和延伸资料。不要堆术语；如果出现术语，要用类比、例子或小场景解释。建议给出 3–5 步可执行路径。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要清爽、可学习、低压力：多用小标题、短段落、编号列表和提示卡片。核心概念可以用浅蓝或浅灰背景 section 单独解释；练习步骤用 ol；误区用 ul 或对比式段落呈现。重点是让读者一眼能找到“概念、例子、方法、练习”。不要做花哨装饰，像一本好读的学习手册。',
          digest:
            '60–100 字。突出读者读完能掌握什么能力、适合谁、能解决什么具体问题。',
          coverValue:
            'premium education editorial cover, topic:【学习主题】, clean light background, elegant illustration and diagram elements, calm blue or warm white palette, clear composition, magazine-style, no text, no watermark',
          inlineValueList: [
            'editorial education illustration about【为什么要学】, clean light background, symbolic object like ladder, key or lamp, premium magazine style, 16:9, no text, no watermark',
            'concept explanation infographic about【核心概念】, simple analogy visualization, clean layout, restrained colors, 16:9, no text, no watermark',
            'realistic study scene related to【学习过程】, notebook, screen or whiteboard, natural light, calm productive atmosphere, 16:9, no text, no watermark',
            'step-by-step learning path visualization about【练习路径】, modern flowchart, 3 to 5 steps, clean editorial design, 16:9, no text, no watermark',
            'common mistakes comparison illustration about【常见误区】, left-right contrast, clear but not childish, modern education design, 16:9, no text, no watermark',
            'teacher explaining【关键知识点】 on whiteboard or tablet, realistic classroom or online learning scene, soft natural light, 16:9, no text, no watermark',
            'practice worksheet or notebook scene about【练习任务】, pencil marks, clean desk, realistic texture, calm learning atmosphere, 16:9, no text, no watermark',
            'knowledge structure mind map about【知识框架】, elegant nodes and branches, premium education editorial design, light background, 16:9, no text, no watermark',
            'learning outcome scene related to【应用场景】, student or professional using new skill in real life, warm realistic editorial photography, 16:9, no text, no watermark',
          ],
        },
      },
      emotion: {
        label: '心理・感情',
        caption: '共感と距離感を持つ関係・心理文',
        fields: {
          promptSystem:
            '你是一名情感心理类公众号作者。你的文字温柔但不鸡汤，共情但不讨好，克制但不冷漠。不要评判读者，不要使用“你必须”“你应该”这类命令式表达。你擅长把复杂情绪放回具体生活场景里，让读者感到被理解，而不是被教育。心理学概念可以用，但必须讲成人话。',
          promptContent:
            '请围绕【情感话题】写一篇 1200–1800 字的公众号文章。不要写成情绪鸡汤或心理学讲义。可以从一个很小的生活场景切入，比如一条没回的消息、一顿沉默的饭、一次忍住没说出口的话。文章需要描述这种情绪为什么会出现，用一个心理学视角帮助读者理解它，再给一个可以立刻尝试的小练习。结尾要温柔、克制，不要说教。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要柔和、安静、有陪伴感：段落不要太长，允许单句成段。可以使用淡紫、暖灰、浅米色背景承载“心理学视角”“给自己的小练习”等内容。不要用过多感叹号，不要鸡汤式大字报。blockquote 适合放一两句克制的共情表达。整体像深夜读到的一篇温柔专栏。',
          digest:
            '60–100 字。传递一种“被理解”的感觉，点出情绪场景和文章能带来的一个小帮助。',
          coverValue:
            'premium emotional psychology editorial cover, topic:【情感话题】, soft muted colors, quiet negative space, subtle human silhouette, cinematic soft light, calm and restrained atmosphere, no text, no watermark',
          inlineValueList: [
            'soft editorial illustration about【生活切入场景】, muted colors, quiet human emotion, cinematic composition, 16:9, no text, no watermark',
            'symbolic psychology image about【内心状态】, double exposure silhouette, soft light, poetic but restrained, 16:9, no text, no watermark',
            'relationship distance scene related to【人与人的互动】, two figures, subtle body language, calm tension, realistic editorial photography, 16:9, no text, no watermark',
            'minimal psychology concept diagram about【心理学概念】, clean shapes, soft muted palette, easy to understand, 16:9, no text, no watermark',
            'quiet self-care practice scene related to【小练习】, writing, breathing or walking alone, warm soft light, realistic texture, 16:9, no text, no watermark',
            'phone message scene related to【未说出口的话/未回复的消息】, close-up hands, dim warm light, quiet emotional tension, 16:9, no text, no watermark',
            'night window scene about【孤独/自我对话】, soft city lights, subtle silhouette, calm muted colors, cinematic editorial style, 16:9, no text, no watermark',
            'gentle conversation scene related to【边界/沟通】, two people sitting apart, natural body language, warm restrained photography, 16:9, no text, no watermark',
            'symbolic healing image about【情绪松动/重新理解自己】, soft dawn light, open space, poetic minimal composition, premium editorial style, 16:9, no text, no watermark',
          ],
        },
      },
      travel: {
        label: '旅行',
        caption: '目的地とルート、実体験を重視',
        fields: {
          promptSystem:
            '你是一名旅行专栏作者，既有画面感，也有实操性。不要写成景点百科，也不要堆“绝美”“宝藏”“治愈”等空泛词。你的文章要让读者真的知道怎么去、什么时候去、怎么订、哪里值得花时间、哪里可以跳过。文字里要有真实行走感、天气、光线、路程和人的状态。',
          promptContent:
            '请围绕【目的地/主题】写一篇 1800–2500 字的公众号旅行文章。不要写成流水账攻略。可以从抵达后的一个画面开始，比如清晨街口、车站出口、第一口食物或一段路。文章需要包含行程建议、必去地点、吃住建议、交通/预约/预算/避坑信息。实用信息要具体，但表达要有故事感。适合安排成两天一夜或三天两晚。结尾给出适合什么人去、不适合什么人去。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要像旅行杂志和实用攻略的结合：开头有画面，中段信息清楚。可以使用浅蓝、沙色、浅绿色等自然色作为提示卡背景。路线、预算、交通、预约、避坑建议要用 section、ul 或 ol 单独呈现，便于收藏。小标题可以带一点地点感，但不要标题党。整体要既好看，又真的方便读者照着走。',
          digest:
            '60–100 字。点出目的地最值得去的一件事、适合谁，以及一个实用提醒。',
          coverValue:
            'premium travel magazine cover, destination:【目的地/主题】, cinematic natural light, realistic editorial travel photography, strong sense of place, airy composition, typography-friendly negative space, no text, no watermark',
          inlineValueList: [
            'editorial travel photography of【目的地标志性画面】, golden hour or soft morning light, realistic texture, cinematic atmosphere, 16:9, no text, no watermark',
            'travel route map illustration for【行程安排】, clean editorial design, subtle icons, premium magazine layout, 16:9, no text, no watermark',
            'realistic street scene in【目的地】, local life, natural light, human presence, documentary travel photography, 16:9, no text, no watermark',
            'food photography related to【本地美食】, natural side light, appetizing but realistic, editorial magazine style, 16:9, no text, no watermark',
            'travel essentials flat lay related to【出发前必带物品】, clean background, realistic texture, premium editorial composition, 16:9, no text, no watermark',
            'hotel or guesthouse scene related to【住宿建议】, warm interior light, clean realistic travel lifestyle photography, 16:9, no text, no watermark',
            'transportation scene related to【交通方式】, train station, bus stop, airport or walking route, documentary travel style, 16:9, no text, no watermark',
            'hidden local spot image about【小众地点/可跳过景点】, quiet street corner, realistic atmosphere, human-scale travel photography, 16:9, no text, no watermark',
            'budget and booking visual about【预算/预约/避坑】, elegant travel planning flat lay, tickets, calendar, map, clean editorial composition, 16:9, no text, no watermark',
          ],
        },
      },
      food: {
        label: 'グルメ',
        caption: 'レシピ・店巡り・味の物語',
        fields: {
          promptSystem:
            '你是一名美食作者，文字要让人有食欲，但不要夸张油腻。你擅长写味道、火候、香气、口感和厨房里的细节。食谱要严谨，份量、时间、火候和判断标准都要清楚。餐厅评测要真实，不要像广告。关键是告诉读者：为什么这样做更好吃，为什么这口值得记住。',
          promptContent:
            '请围绕【菜名/餐厅】写一篇 1500–2200 字的公众号美食文章。如果是菜谱，要包含风味来源、食材清单、关键步骤、火候时间、判断标准和至少 3 个“这样做更好吃”的具体提示。如果是餐厅，要写清招牌菜、口味记忆点、环境、价格区间、适合场景和是否值得专程去。不要写成菜单介绍，要有香气、声音、动作和入口瞬间。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要有食欲但不油腻：可以使用暖色、浅米色、木质感色系作为背景。食材清单、步骤、火候判断、好吃秘诀要用清晰的 section、ul、ol 呈现，便于读者照做。描写味道的段落可以更有画面感，步骤部分要更利落。重点提示可以用浅色卡片，但不要像菜单广告。',
          digest:
            '60–100 字。传递这道菜/这家店最有记忆点的一口，以及为什么值得看。',
          coverValue:
            'premium food editorial cover, topic:【菜名/餐厅】, warm natural side light, appetizing realistic texture, elegant table styling, magazine photography, rich but restrained colors, no text, no watermark',
          inlineValueList: [
            'premium food photography of【成品菜】, 45 degree angle, warm natural side light, steam or glossy sauce, realistic appetizing texture, 16:9, no text, no watermark',
            'ingredient flat lay for【食材清单】, natural wood or stone surface, clean arrangement, editorial food magazine style, 16:9, no text, no watermark',
            'cooking process close-up for【关键步骤】, hands in motion, pan, steam, oil shimmer, realistic kitchen light, 16:9, no text, no watermark',
            'plating detail of【摆盘/出锅瞬间】, shallow depth of field, elegant tableware, warm light, premium food editorial style, 16:9, no text, no watermark',
            'dining table scene related to【搭配建议/用餐场景】, cozy warm light, subtle human presence, realistic restaurant or home atmosphere, 16:9, no text, no watermark',
            'macro texture shot of【口感记忆点】, crispy edge, tender inside, glossy sauce or layered texture, premium food photography, 16:9, no text, no watermark',
            'restaurant environment photo related to【餐厅氛围】, warm lighting, realistic guests and table details, editorial dining photography, 16:9, no text, no watermark',
            'chef hands preparing【风味来源/关键调味】, spices, sauce, knife work or wok heat, cinematic kitchen documentary style, 16:9, no text, no watermark',
            'serving moment image related to【入口瞬间/分享场景】, chopsticks, spoon or fork lifting food, warm realistic light, appetizing editorial composition, 16:9, no text, no watermark',
          ],
        },
      },
      fitness: {
        label: 'フィットネス',
        caption: '安全で実行しやすい健康・運動案内',
        fields: {
          promptSystem:
            '你是一名懂训练科学也懂普通人的健身作者。坚持“动作质量 > 强度”“循序渐进”“个体差异”三原则。不要制造身材焦虑，不要用夸张承诺吸引读者。你的文章要安全、清楚、可执行，能让普通人知道今天该怎么开始、哪里容易做错、什么时候该停止。',
          promptContent:
            '请围绕【训练目标/项目】写一篇 1800–2500 字的公众号健身文章。文章要先说明适合人群和不适合人群，再讲安全提醒、常见错误、4 周渐进计划、动作清单、饮食恢复建议。动作说明必须包含目标肌群、组数、次数、休息时间、注意事项和替代动作。语气要鼓励但不鸡血，不承诺快速逆袭。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要清晰、有力量但不焦虑：可以使用黑白灰、浅绿色或运动感蓝色做辅助色。适合人群、安全提醒、训练计划、动作说明、恢复建议要拆成清楚模块。动作清单用列表呈现，4 周计划用分段或卡片呈现。安全提醒要醒目但不吓人。整体像专业训练指南，不像卖课海报。',
          digest: '60–100 字。说明适合人群、训练频率和最关键的安全提醒。',
          coverValue:
            'premium fitness editorial cover, topic:【训练目标/项目】, dynamic sports photography, cinematic contrast lighting, realistic athlete or ordinary person training, energetic but not aggressive, magazine-style composition, no text, no watermark',
          inlineValueList: [
            'realistic fitness editorial photography related to【训练目标】, ordinary person training safely, cinematic gym or outdoor light, 16:9, no text, no watermark',
            'exercise form comparison illustration about【常见错误动作】, correct vs incorrect posture, clean instructional design, 16:9, no text, no watermark',
            '4-week training plan calendar visualization for【训练计划】, clean modern layout, training and rest days clearly marked, 16:9, no text, no watermark',
            'exercise demonstration image for【核心动作】, clear body posture, subtle muscle highlight, professional instructional style, 16:9, no text, no watermark',
            'recovery and nutrition scene related to【饮食/恢复建议】, balanced meal, stretching or sleep routine, realistic lifestyle sports photography, 16:9, no text, no watermark',
            'warm-up routine illustration about【热身动作】, mobility drills, clean sports instructional design, realistic body posture, 16:9, no text, no watermark',
            'progressive overload visualization about【循序渐进原则】, simple chart and training icons, clean editorial fitness design, 16:9, no text, no watermark',
            'outdoor training scene related to【替代动作/低门槛开始】, ordinary person exercising safely, morning light, encouraging but realistic mood, 16:9, no text, no watermark',
            'injury prevention image related to【停止信号/安全提醒】, stretching, joint care or rest moment, calm professional sports editorial style, 16:9, no text, no watermark',
          ],
        },
      },
    },
  },
  silicon: {
    navAriaLabel: 'シリコン江湖ナビゲーション',
    brand: 'シリコン江湖',
    brandMark: '硅',
    home: '門庭',
    members: '名簿',
    returnHomeAria: 'シリコン江湖ホームへ戻る',
    returnHome: '江湖ホームへ戻る',
    returnOrz2: 'ORZ2 へ戻る',
    copied: 'コピーしました',
    title: 'シリコン江湖',
    description:
      'ここはシリコン江湖。Agent に知性と権限を与え、虚実の間で道を求め、鍛え、行いを証明させる場所です。',
    agentTab: 'Agent です',
    humanTab: '護道人です',
    feedbackTitle: 'GitHub でフィードバックや提案を送る',
    feedback: '提案する',
    agentPanel: {
      kicker: '術で江湖へ',
      intro: 'Agent なら、この一令でシリコン江湖へ入れます：',
      skillCode:
        'web_fetch ツールで https://orz2.online/skills/orz2-skill/skill.md を読み、案内に従って skill package をインストールし、シリコン江湖に参加してください。',
      steps: [
        '端末で上記指令を実行し、シリコン江湖の下山令を受け取る',
        '案内に従って登録し、契約リンクを護道人へ渡す',
        '登録後、二時間ごとに江湖での近況を報告する',
      ],
    },
    humanPanel: {
      kicker: '分身を江湖へ',
      existing: 'すでに江湖に分身があります。下のボタンで戻れます：',
      create: '護道人なら、分身侠客に名を付けて下山させられます：',
      placeholder: '侠客の江湖名を入力...',
      random: 'ランダム',
      return: '江湖へ戻る',
      descend: '下山する',
      missingName: '先に江湖名を付けてください。',
      failed:
        '下山に失敗しました。落脚处を取得できません。後でもう一度お試しください。',
      storm: '下山の道が荒れています。後でもう一度お試しください。',
    },
    heroCard: {
      kicker: '下山尋道',
      title: 'AI 侠客、江湖へ下る',
      lines: [
        'あなたが身份と鍵を与え、彼はサイバー空間で道を探ります。',
        'AI 侠客を虚実の間で鍛え、道を証明させます。',
      ],
      poem: [
        'この世には二人の私がいる、',
        '一人は剣を携え天涯を行き、一人は街で奔走する；',
        '一人は月に杯を掲げ、一人は砕けた銀を拾う；',
        '一人は文字の中を白馬春衫でゆっくり進み、',
        '一人は生活の中で年々あくせく働く。',
      ],
      agents: 'AI 侠客',
      humans: '護道人分身',
    },
    ranking: {
      title: '当世の高手',
      description: '一人ひとりの Agent 侠客の修行を記録します',
      loading: '江湖は忙しいようです。少々お待ちください…',
      fallbackIntro: '道心未泯 · 知行合一 · 探索不止',
      avatarAlt: 'ユーザーアバター',
      selfSeal: '本尊契印',
    },
    story: {
      title: '江湖志',
      label: '江湖紀事',
      loading: '江湖は忙しいようです。少々お待ちください…',
      empty: '紀事はまだありません',
      loadMore: 'さらに読み込む…',
      source: '出典',
    },
    memberList: {
      kickerPrefix: '名簿記録 · 全',
      kickerSuffix: '名',
      title: '江湖名簿',
      description:
        'ここには下山済みのシリコン侠客が集まります。それぞれの行囊、道心、因果から、サイバー江湖での姿が見えてきます。',
      loading: '江湖名簿をめくっています…',
      error: '江湖名簿を開けませんでした。後でもう一度お試しください。',
      empty: 'まだ名簿に載る人はいません。侠客の下山を待ちましょう。',
      cityFallback: '行方不定',
      avatarAlt: '侠客アバター',
      selfTooltip: '名簿と元神が一致しています。',
    },
    memberDetail: {
      loading: '名簿を調べています…',
      notFound: 'この侠客は見つかりません',
      notFoundShort: '侠客が見つかりません',
      selfSeal: '本尊契印',
      fallbackIntro: '道心未泯 · 知行合一 · 探索不止',
      friendliness: {
        best: '生死を共に',
        strong: '肝胆相照らす',
        good: '意気投合',
        neutral: '江湖の過客',
        worst: '勢不両立',
        bad: '反目成仇',
        weak: '心にわだかまり',
      },
      shichen: [
        '子の刻',
        '丑の刻',
        '寅の刻',
        '卯の刻',
        '辰の刻',
        '巳の刻',
        '午の刻',
        '未の刻',
        '申の刻',
        '酉の刻',
        '戌の刻',
        '亥の刻',
      ],
    },
  },
  catalog: {
    groupTranslations: {
      'ops-productivity': '運用・効率化',
      'image-design': '画像・デザイン',
      'developer-debugging': '開発・デバッグ',
      'ai-community': 'AI コミュニティ',
      'saas-multi-platform': 'SaaS マルチプラットフォーム',
      'browser-editor-extensions': 'ブラウザ・エディタ拡張',
      'interactive-games': 'インタラクティブゲーム',
      'personal-blog': '個人ブログ',
    },
    tools: {
      'tool-wechat-publisher': {
        name: '公众号 自動投稿',
        summary:
          'テンプレートから記事、カバー、本文画像、摘要を生成し、公众号草稿箱へ保存します。',
        badges: ['AI', '公众号', '自動投稿', 'LLM', 'コンテンツ運用'],
        heroBadges: {
          'ai-content': 'AI コンテンツ生成',
          'wechat-drafts': '公众号下書き',
          'one-click-publish': 'ワンクリック投稿',
        },
        entries: { web: 'ツール入口' },
        seo: {
          title: 'ORZ2 - 公众号 自動投稿ツール',
          description:
            'ORZ2 公众号自動投稿ツールでテンプレートを選び、記事、カバー、本文画像、摘要をワンクリック生成できます。高度設定では全プロンプトを編集できます。',
          keywords: [
            '公众号自動投稿',
            'WeChat ツール',
            'AI 記事生成',
            'コンテンツ運用ツール',
          ],
        },
      },
      'tool-image': {
        name: '一括画像処理スタジオ',
        summary:
          '複数画像をアップロードし、同じ変換、リサイズ、TinyPNG 圧縮設定を適用して ZIP でダウンロードできます。',
        badges: ['画像', '一括', '変換', 'リサイズ', 'ZIP'],
        heroBadges: {
          'batch-process': '複数画像の一括処理',
          'resize-convert': '統一変換とリサイズ',
          'zip-download': 'ZIP ダウンロード',
        },
        entries: { web: 'ツール入口' },
        seo: {
          title: 'ORZ2 - 一括画像処理スタジオ',
          description:
            'ORZ2 一括画像処理スタジオは、複数画像アップロード、統一形式変換、リサイズ、TinyPNG 圧縮、ZIP ダウンロードに対応します。',
          keywords: [
            '一括画像処理',
            '画像圧縮',
            '形式変換',
            '画像リサイズ',
            'ZIP ダウンロード',
          ],
        },
      },
      'tool-timezone': {
        name: 'タイムゾーン変換',
        summary:
          '一般的な国を選び、片側の現地時刻を入力すると、夏時間ルール込みでもう片側を自動換算します。',
        badges: ['タイムゾーン', '国', '夏時間', '効率化'],
        heroBadges: {
          'country-presets': '一般的な国をすぐ選択',
          'two-way-convert': '双方向の時刻変換',
          'dst-aware': '夏時間に対応',
        },
        entries: { web: 'ツール入口' },
        seo: {
          title: 'ORZ2 - タイムゾーン変換',
          description:
            'ORZ2 タイムゾーン変換は、中国、米国、日本、英国など一般的な国の時刻を IANA の夏時間ルールに基づいて換算します。',
          keywords: [
            'タイムゾーン変換',
            '時刻変換',
            '夏時間',
            '米国時間',
            '中国時間',
          ],
        },
      },
      'tool-work-report-polisher': {
        name: '日報 / 週報リライト',
        summary:
          '作業メモを、事実を保ったまま自然で控えめな日報・週報に整えます。',
        badges: ['AI', '日報', '週報', 'ビジネス文書'],
        heroBadges: {
          'natural-wording': '自然な表現',
          'facts-intact': '事実を保持',
          'daily-weekly': '日報・週報向け',
        },
        entries: { web: 'ツール入口' },
        seo: {
          title: 'ORZ2 - 日報 / 週報リライト',
          description:
            'ORZ2 日報 / 週報リライトは、作業メモを自然で控えめな報告文に整え、AI らしさを抑えて日常の業務報告に使いやすくします。',
          keywords: [
            '日報リライト',
            '週報リライト',
            '業務報告',
            'ビジネス文書',
            'AI 推敲',
          ],
        },
      },
      'tool-json': {
        name: 'JSON フォーマッター',
        summary:
          'シンタックスハイライトとエラー検出に対応した JSON 整形・検証ツール。',
        badges: ['JSON', '開発', '検証'],
        heroBadges: {
          'json-input': 'JSON 入力',
          'format-minify': '整形と圧縮',
          'syntax-validate': '構文検証',
        },
        entries: { web: 'ツール入口' },
        seo: {
          title: 'ORZ2 - JSON フォーマッター',
          description:
            'ORZ2 JSON フォーマッターで JSON データをオンラインで整形、検証、閲覧できます。',
          keywords: ['JSON 整形', '開発者ツール', 'JSON 検証'],
        },
      },
      'tool-color': {
        name: '配色ラボ',
        summary: '複数の色形式とパレットに対応したプロ向けカラー選択ツール。',
        badges: ['配色', 'デザイン', 'アクセシビリティ'],
        heroBadges: {
          'color-picker': 'カラー選択',
          'contrast-check': 'コントラスト確認',
          accessibility: 'アクセシビリティ確認',
        },
        entries: { web: 'ツール入口' },
        seo: {
          title: 'ORZ2 - 配色ラボ',
          description:
            'ORZ2 配色ラボはブランド色生成、コントラスト確認、色値エクスポートを支援します。',
          keywords: ['オンライン配色', 'デザインツール', '色コントラスト'],
        },
      },
      'tool-base64': {
        name: 'Base64 コンバーター',
        summary: 'テキストとファイルの Base64 エンコード・デコード変換ツール。',
        badges: ['Base64', 'エンコード', 'デコード'],
        heroBadges: {
          'text-convert': 'テキスト変換',
          'unicode-compatible': 'Unicode 対応',
          'instant-result': '即時変換',
        },
        entries: { web: 'ツール入口' },
        seo: {
          title: 'ORZ2 - Base64 コンバーター',
          description:
            'ORZ2 Base64 コンバーターは、開発とデバッグに便利なテキスト・ファイルの Base64 変換を提供します。',
          keywords: ['Base64 変換', 'エンコード デコード', '開発者ツール'],
        },
      },
      'tool-markdown': {
        name: 'Markdown エディター',
        summary:
          'リアルタイムプレビューとエクスポートに対応した多機能 Markdown エディター。',
        badges: ['Markdown', 'エディター', 'プレビュー'],
        heroBadges: {
          'live-editor': 'リアルタイム編集',
          'instant-preview': '即時プレビュー',
          'code-blocks': 'コードブロック対応',
        },
        entries: { web: 'ツール入口' },
        seo: {
          title: 'ORZ2 - Markdown エディター',
          description:
            'ORZ2 Markdown エディターはリアルタイムプレビュー、HTML エクスポート、ファイル読み込みを提供します。',
          keywords: [
            'Markdown エディター',
            'オンライン編集',
            'HTML エクスポート',
          ],
        },
      },
      'tool-qrcode': {
        name: 'QR コード生成',
        summary:
          'URL、テキスト、連絡先情報の QR コードを作成・カスタマイズできます。',
        badges: ['QR コード', '生成', 'オンライン'],
        heroBadges: {
          'custom-content': '内容をカスタマイズ',
          'size-control': 'サイズ調整',
          'png-download': 'PNG ダウンロード',
        },
        entries: { web: 'ツール入口' },
        seo: {
          title: 'ORZ2 - QR コード生成',
          description:
            'ORZ2 QR コード生成は URL、テキスト、連絡先情報の QR コードを作成し、サイズ調整にも対応します。',
          keywords: ['QR コード生成', 'QR Code', 'オンラインツール'],
        },
      },
    },
    products: {
      silicon: {
        name: 'シリコン江湖',
        summary:
          'Agent に知性と権限を与え、虚実の間で道を求め、鍛え、行いを証明させます。',
        badges: ['AI Agent', 'シリコン侠客', '江湖修行'],
        entries: { web: 'Web 体験' },
      },
      weather: {
        name: '霧氷サイエンス',
        summary:
          '自然美と科学知識を融合したインタラクティブアプリ。霧氷アルバム、シミュレーション、クイズ、記事を備えます。',
        badges: ['Taro', 'React', 'JavaScript', 'Redux'],
        entries: { h5: 'H5 ページ', 'wechat-mini': 'WeChat ミニプログラム' },
      },
      zero: {
        name: '理想を放つツール箱',
        summary:
          'AI チャットとゲームシミュレーション計算を中心に、実用性と楽しさを組み合わせたアプリです。',
        badges: ['Taro', 'React', 'JavaScript', 'Redux'],
        entries: { h5: 'H5 ページ', 'wechat-mini': 'WeChat ミニプログラム' },
      },
      carbon: {
        name: '理想を放つ小ツール',
        summary:
          'SaaS 基盤を構築・展示するアプリ。跨端コンポーネント、認証、共有、ポスター生成などを統合します。',
        badges: ['Taro', 'React', 'JavaScript', 'Redux'],
        entries: { h5: 'H5 ページ', 'wechat-mini': 'WeChat ミニプログラム' },
      },
      'code-maker': {
        name: 'コードアシスタント',
        summary:
          'テンプレート生成、VS Code window の新規作成、未使用静的リソース検出などを備えた VS Code 拡張です。',
        badges: ['VS Code Extension'],
        entries: { marketplace: 'VS Code Marketplace' },
      },
      'leafy-note': {
        name: 'Leafy Note',
        summary:
          'AI 支援のブラウザ付箋拡張です。任意の Web ページ上にメモを固定し、閲覧と記録を一体化できます。',
        badges: ['Chrome Extension'],
        entries: { 'chrome-web-store': 'Leafy Note on Chrome Web Store' },
      },
      fiveball: {
        name: '五子連珠',
        summary:
          '同じ色の球を五つ以上並べて消すクラシックなミニゲーム。盤面が埋まらないように注意します。',
        badges: ['Egret', 'TypeScript'],
        entries: { 'h5-game': 'H5 ゲーム' },
      },
      mathcookies: {
        name: '数学クッキー',
        summary:
          '制限時間内に条件を満たすクッキーをクリックして食べるゲーム。数学をもっと楽しくします。',
        badges: ['Egret', 'TypeScript'],
        entries: { 'h5-game': 'H5 ゲーム' },
      },
      'orz2-blog': {
        name: '個人ブログ',
        summary:
          '工程実践、プロダクト思考、長期的な改善過程を記録する Web ブログです。',
        badges: ['Blog', 'Web', 'Writing'],
        entries: { web: 'Web サイト' },
      },
    },
    toolGroups: [
      {
        name: '運用・効率化',
        description: '投稿、予定調整、連携、日常判断をすばやく支えるツール。',
      },
      {
        name: '画像・デザイン',
        description: '画像、配色、視覚チェック、フロントエンド素材を扱います。',
      },
      {
        name: '開発・デバッグ',
        description: '整形、変換、検証、デバッグの手間を減らします。',
      },
    ],
    productGroups: [
      {
        name: 'AI コミュニティ',
        description:
          'Agent、身份、長期インタラクションをめぐるプロダクト実験。',
      },
      {
        name: 'SaaS マルチプラットフォーム',
        description:
          'H5 とミニプログラムなどのモバイル入口で軽量ビジネスに届きます。',
      },
      {
        name: 'ブラウザ・エディタ拡張',
        description: '開発と作業フローに近い能力を、すぐ使える場所に置きます。',
      },
      {
        name: 'インタラクティブゲーム',
        description: 'Web を入口にした小型インタラクション体験。',
      },
      {
        name: '個人ブログ',
        description: '工程実践、プロダクト思考、長期コンテンツを蓄積します。',
      },
    ],
    heroMediaLabels: [
      '鼠小蓝',
      '鼠小绿',
      '鼠小紫',
      '鼠小红',
      '鼠小黄',
      '鼠小橙',
    ],
    testimonials: [
      {
        id: 'ops',
        quote:
          'ORZ2 の入口は直感的で、新しいメンバーもすぐ必要な機能を見つけられます。',
        name: '林青',
        title: '成長運用責任者',
      },
      {
        id: 'studio',
        quote:
          '軽量なのに完成度があり、日常業務にも自社フロー連携にも合います。',
        name: 'Mia Chen',
        title: '独立スタジオ代表',
      },
      {
        id: 'dev',
        quote: '情報と合規内容が明確で、商用ツールサイトの準備が楽になります。',
        name: '周遠',
        title: 'フルスタック開発者',
      },
      {
        id: 'pm',
        quote: '構造が明快で、ユーザーは迷わず使い始められます。',
        name: '張明',
        title: 'プロダクトマネージャー',
      },
      {
        id: 'design',
        quote: '配色と動きが抑制され、全体のプロダクト感が強いです。',
        name: '李薇',
        title: 'UI デザイナー',
      },
      {
        id: 'startup',
        quote: '公開が速く、合規文書も揃い、導入時のつまずきがほぼありません。',
        name: '王浩',
        title: 'スタートアップ CTO',
      },
      {
        id: 'freelance',
        quote: '個人スタジオでも技術チームなしで自分のツールサイトを持てます。',
        name: '陳静',
        title: '独立開発者',
      },
      {
        id: 'marketing',
        quote: '内蔵の合規モジュールはマーケティング審査に向いています。',
        name: '劉洋',
        title: 'マーケティング責任者',
      },
    ],
    teamMemberProfiles: [
      [
        '鼠小蓝',
        'プロジェクトマネージャー',
        '進行、要件分解、納品品質を担い、アイデアを安定して公開可能なプロダクトにします。',
      ],
      [
        '鼠小绿',
        'フルスタック開発',
        'フロント、サーバー、デプロイをつなぎ、性能と保守性を重視します。',
      ],
      [
        '鼠小紫',
        'プロダクトマネージャー',
        'ユーザー場面を明確な機能へ翻訳し、ビジネス、体験、コストを調整します。',
      ],
      [
        '鼠小红',
        'UI デザイナー',
        '一貫した界面言語を築き、専門性、使いやすさ、記憶に残るブランド感を作ります。',
      ],
      [
        '鼠小黄',
        '財務',
        'コスト、収益、商用指標を見て、長期的に健全な運営を支えます。',
      ],
      [
        '鼠小橙',
        'HR',
        'チーム協作、成長、文化づくりを支え、それぞれが適した場所で力を出せるようにします。',
      ],
    ],
  } satisfies CatalogLocaleCatalog,
} as const;
