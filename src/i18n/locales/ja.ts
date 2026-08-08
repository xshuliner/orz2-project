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
    articleSubscriptions: '記事購読',
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
      USE_OFFICIAL: '公式アカウントツールの利用',
      MANUAL: 'システム操作',
      DEFAULT: '不明',
    },
    time: '日時',
    change: '変動',
    balance: '残高',
  },
  articles: {
    listTitle: '記事購読',
    listDescription: '購読している AI 生成記事を確認できます。',
    detailTitle: '記事詳細',
    detailDescription: '生成された本文、要約、画像素材を確認できます。',
    createArticle: '記事を生成',
    backToList: '記事一覧へ戻る',
    loginTitle: '記事を見るにはログインしてください',
    loginDescription: 'ログインすると購読中の記事一覧を確認できます。',
    loginAction: 'ログイン',
    loading: '記事を読み込み中…',
    loadFailed: '記事を読み込めませんでした。後でもう一度お試しください。',
    detailLoadFailed:
      '現在この記事を読み込めません。後でもう一度お試しください。',
    retry: '再読み込み',
    loadMore: 'さらに読み込む',
    endOfList: 'すべての記事を読み込みました',
    refresh: '記事一覧を更新',
    emptyTitle: '購読中の記事はまだありません',
    emptyDescription: '作成または購読した記事がここに表示されます。',
    notFoundTitle: '記事が見つかりません',
    notFoundDescription:
      '記事が削除されたか、リンクが正しくない可能性があります。',
    untitled: '無題の記事',
    noSummary: '要約はありません',
    unknownAuthor: 'ORZ2 コンテンツアシスタント',
    copyAction: '内容をコピー',
    copyPanelTitle: 'コピーする内容を選択',
    actionPanelDescription: '項目を選ぶと操作を実行します',
    closeActionPanel: '操作パネルを閉じる',
    copyTitle: '記事タイトルをコピー',
    copyTitleDescription: 'この記事のタイトルのみコピーします',
    copyContent: '記事本文をコピー',
    copyContentDescription: 'タイトルを除く本文のみコピーします',
    copySummary: '要約をコピー',
    copySummaryDescription: '記事の概要をコピーします',
    copySuccess: 'クリップボードにコピーしました',
    copyFailed: 'コピーできませんでした。手動でコピーしてください。',
    downloadImages: '画像をダウンロード',
    downloadPanelTitle: '画像レイアウトを選択',
    downloadVertical: '縦版画像をすべてダウンロード',
    downloadHorizontal: '横版画像をすべてダウンロード',
    downloadDescription: 'カバー画像と本文内の全画像',
    downloadSuccess: '画像のダウンロードを開始しました',
    downloadFailed:
      'ダウンロードできませんでした。画像を開いて保存してください。',
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
    fallbackName: '記事公開',
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
      selectorAriaLabel: '記事コンテンツテンプレートを選択',
      ready: 'ワンクリック設定完了',
      promptFact: 'テンプレートプロンプト',
      coverFact: 'AI カバー',
      inlineFact: '本文画像',
      digestFact: 'LLM 自動摘要',
      createHint:
        '選択したテンプレートのプロンプト、カバープロンプト、すべての本文画像プロンプトを使用します。',
      rewriteHint:
        '原文、テンプレート、既定のリライト要件を組み合わせ、文章・画像・レイアウトを自動生成します。',
      selectedPrefix: '',
      selectedSuffix: 'テンプレートを選択しました。記事を公開できます。',
    },
    templates: {
      loading: '最新テンプレートを読み込んでいます…',
      cached:
        '最新テンプレートを取得できないため、直近のローカルキャッシュを使用しています。',
      failed: 'テンプレートを読み込めませんでした。再試行してください。',
      retry: '再読み込み',
      empty: '利用可能なテンプレートがありません',
    },
    customization: {
      show: 'このテンプレートをカスタマイズ',
      hide: 'カスタマイズを閉じる',
      customLabel: 'カスタムテンプレート',
      customDescription: '編集したプロンプトと画像設定を保存しています',
      cancel: 'キャンセル',
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
        description:
          '任意：両方の認証情報を入力すると、WeChat 草稿箱にも作成します。',
        appId: '公众号 appId',
        appSecret: '公众号 appSecret',
        appIdPlaceholder: '公众号 appId を入力',
        appSecretPlaceholder: '公众号 appSecret を入力',
        draftType: '草稿タイプ *',
        newsType: 'news 图文消息',
        provider: 'AI モデル *',
        modelSelectorAriaLabel: 'AI プロバイダー（モデル）を選択',
      },
      delivery: {
        title: '配信経路',
        description:
          '記事は常に保存されます。有効にした経路のみ配信を実行します。',
        selectionAriaLabel: '記事の配信経路を選択',
        required: 'どちらも任意です',
        wechat: {
          title: 'WeChat 草稿箱へ保存',
          description:
            '任意：AppID と AppSecret の両方を入力すると、記事を指定した公众号の草稿箱へ保存します。',
          selected: 'WeChat 草稿箱経路を有効化',
          unselected: 'WeChat 草稿箱経路を有効化',
          expand: 'WeChat 草稿箱経路を設定',
          collapse: 'WeChat 草稿箱設定を閉じる',
          setupTitle: 'WeChat 開発設定',
          setupDescription:
            '初回はこのガイドを使い、WeChat コンソールで開発設定を完了します。',
          credentialsTitle: '開発者認証情報',
          endpoint: '記事は WeChat 草稿箱へ保存されます',
        },
        email: {
          title: 'メールで送信',
          description:
            '任意：メールアドレスを入力すると、生成済みの記事を受信者へ送信します。',
          selected: 'メール経路を有効化',
          unselected: 'メール経路を有効化',
          expand: 'メール経路を設定',
          collapse: 'メール設定を閉じる',
          endpoint: '記事は入力済みの受信者へ送信されます',
        },
        finalReportEmails: '受信メールアドレス（一つまたは複数）',
        finalReportEmailsPlaceholder:
          'name@example.com。複数はカンマ、セミコロン、改行で区切ります',
        finalReportEmailsHint:
          'メール配信に公众号設定は不要です。複数のアドレスはカンマ、セミコロン、改行で区切ります。',
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
      delivery: '配信方法',
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
    status: {
      autosave: 'フォームはこのブラウザに自動保存されます。',
      validationFailed: '必須項目を入力してから公開タスクを生成してください。',
      confirmTitle: '公開タスクを開始しますか？',
      confirmGenerate:
        '公開タスクの生成には時間がかかる場合があります。開始しますか？',
      confirmRewrite:
        'リライトタスクは原文を取得し、文章・画像・レイアウトを生成します。時間がかかる場合があります。開始しますか？',
      connecting: '公開サービスへ接続中。進捗はタイムラインに表示されます。',
      connected: '公開サービスに接続しました。記事を生成しています。',
      restoring:
        '未完了の公開タスクが見つかりました。リアルタイム状態を復元しています。',
      restoreConnected:
        '公開タスクを復元しました。最新の進捗を同期しています。',
      restoreRetrying:
        '公開接続が中断されました。タスク状態へ再接続しています。',
      runningPrefix: '実行中：',
      runningFallback: '記事公開ステップ',
      skipped: '一部素材をスキップしました。公開タスクは継続中です。',
      failedPrefix: '生成失敗：',
      failedFallback: '公開ステップの実行に失敗しました',
      draftCreatedPrefix: '草稿',
      draftCreatedSuffix: 'を生成しました。WeChat 管理画面で確認してください。',
      draftCreated: '草稿を生成しました。WeChat 管理画面で確認してください。',
      articleCreated: '記事を生成して保存しました。',
      articleCreatedWithEmail:
        '記事を生成・保存し、指定メールアドレスへ送信しました。',
      published: '記事の公開処理が完了しました。',
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
      delivery:
        '公众号認証情報一式または受信メールを最低一つ入力してください。',
      finalReportEmails: '有効な受信メールアドレスを入力してください。',
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
      viewResult: '記事公開結果を見る',
      reset: 'リセット',
      generating: '生成中...',
      generate: '公開タスクを生成',
      generateRewrite: 'リライトして記事を公開',
    },
    success: {
      closeAriaLabel: '記事公開結果を閉じる',
      kicker: '公開タスク完了',
      titleArticle: '記事を生成して保存しました',
      titleWechat: '記事を WeChat 草稿箱に保存しました',
      titleEmail: '記事をメールで送信しました',
      titleBoth: 'すべての記事配信が完了しました',
      descriptionArticle:
        '記事は安全に保存されています。このページで設定を続けて調整できます。',
      descriptionWechat:
        'WeChat 管理画面でレイアウトを確認し、細部の調整や公開予約ができます。',
      descriptionEmail: '入力した受信先メールアドレスへ記事を送信しました。',
      descriptionBoth:
        '記事を保存し、WeChat 草稿箱への保存とメール送信も完了しました。',
      articleTitle: '記事タイトル',
      fallbackTitle: '生成した記事',
      wechatDelivery: 'WeChat 草稿箱',
      emailDelivery: 'メール送信',
      deliverySuccess: '完了',
      deliveryFailed: '未完了。後でもう一度お試しください',
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
      mediaId: 'WeChat 草稿 media_id',
      articleRecordId: '保存済み記事レコード',
      stay: 'このページに残る',
      viewArticle: '記事を見る',
      goDraftBox: 'WeChat 草稿箱へ',
      footnoteWechat:
        '草稿箱は新しいウィンドウで開きます。現在のタスク設定は保持されます。',
      footnoteArticle:
        '現在のタスク設定は保持され、再調整や再実行にそのまま使えます。',
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
      'tool-article-publisher': {
        name: '記事公開',
        summary:
          'テンプレートから記事、カバー、本文画像、摘要を生成し、メールまたは公众号草稿箱へ届けます。',
        badges: ['AI', '記事', '自動投稿', 'LLM', 'コンテンツ運用'],
        heroBadges: {
          'ai-content': 'AI コンテンツ生成',
          'wechat-drafts': '公众号下書き',
          'one-click-publish': 'ワンクリック投稿',
        },
        entries: { web: 'ツール入口' },
        seo: {
          title: 'ORZ2 - 記事公開ツール',
          description:
            'ORZ2 記事公開ツールでテンプレートを選び、記事、カバー、本文画像、摘要をワンクリック生成できます。高度設定では全プロンプトを編集でき、メールまたは公众号草稿箱に届けられます。',
          keywords: [
            '記事公開',
            'AI 記事公開ツール',
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
