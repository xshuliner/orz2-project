import type { CatalogLocaleCatalog, CatalogStageCopy } from '@/i18n/types';
import type { CatalogStage } from '@/types/catalog';

export const messages = {
  common: {
    all: 'All',
    openLink: 'Open link',
    openEntry: 'Open',
    scanExperience: 'Scan',
    preparing: 'Planned',
    platformAriaLabel: 'Supported platforms',
    directScanHint: 'Scan on mobile, or open the entry directly.',
    wechatScanHint: 'Scan the WeChat mini program code to try it.',
    sunCodePending: 'Code pending',
    sunCodeLoading: 'Loading code',
    qrMode: 'Scan mode',
    qrTitle: 'QR code',
    sunCodeAlt: 'mini program code',
    versionPrefix: 'v',
    loading: 'Loading',
    loadMore: 'Load more...',
    empty: 'No content yet',
    backHome: 'Back home',
    aiInput: {
      polish: 'Polish',
      polishing: 'Polishing',
      restore: 'Restore',
      polishAriaLabel: 'Polish content with AI',
      restoreAriaLabel: 'Restore content before polishing',
      failed: 'Could not polish the content. Try again later.',
    },
  },
  locale: {
    ariaLabel: 'Language switcher',
    switchTo: 'Switch to',
  },
  theme: {
    ariaLabel: 'Theme switcher',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    switchToSystem: 'Use system theme',
    switchToLight: 'Use light theme',
    switchToDark: 'Use dark theme',
  },
  pageTitles: {
    home: 'Home',
    onlineTools: 'Tools',
    products: 'Products',
    team: 'Team',
    privacy: 'Privacy',
    designSystem: 'Design System',
    buildInfo: 'Build Info',
  },
  header: {
    brandAriaLabel: 'ORZ2 home',
    navAriaLabel: 'Primary navigation',
    openNavAriaLabel: 'Open navigation',
    closeNavAriaLabel: 'Close navigation',
    loggedOut: 'Sign in',
    loggedIn: 'Signed in',
    defaultAvatar: 'U',
    defaultUserName: 'Test user',
    logoutAriaLabel: 'Sign out',
  },
  footer: {
    brandDescription:
      'ORZ2 focuses on online AI tools, productivity tools, and customizable tool-site systems that help teams move repetitive work into steadier flows.',
    sections: {
      nav: 'Navigate',
      contact: 'Contact',
      compliance: 'Compliance',
    },
    navAriaLabel: 'Footer navigation',
    contactSupport:
      'Tool customization, commercial launch support, and workflow setup.',
    complianceNote:
      'Clear notes for data use, third-party services, advertising, and user rights.',
    viewPrivacy: 'View privacy policy',
    copyright: '© 2026 ORZ2. All rights reserved.',
    tagline: 'Built for useful, compliant online tools.',
    buildInfoLabel: 'Current build',
    buildInfoAriaLabel: 'View ORZ2 build information',
  },
  login: {
    closeAriaLabel: 'Close login dialog',
    kicker: 'WeChat QR login',
    title: 'Welcome back',
    description:
      'Scan the code in WeChat. You will sign in automatically after authorization.',
    qrAlt: 'WeChat mini program login code',
    loading: 'Generating code...',
    expired: 'The code has expired',
    noQr: 'No code available yet',
    hint: 'Scan in WeChat and finish the authorization flow',
    refreshButton: 'Refresh code',
    wechatUser: 'WeChat user',
    errors: {
      loginFailed: 'Login failed. Refresh the code and try again.',
      qrLoadFailed: 'Could not load the code. Please refresh later.',
      qrCreateFailed: 'Could not create the code',
      qrDataInvalid: 'Invalid QR image data',
      qrReadFailed: 'Could not read QR image data',
    },
  },
  homeSections: {
    tools: {
      subtitle:
        'High-frequency tasks are organized into direct entries: open them when needed, leave when done.',
      ariaLabel: 'Online tools',
      searchPlaceholder: 'Search AI, image, JSON, marketing...',
      searchAriaLabel: 'Search tools',
      categoryAriaLabel: 'Tool categories',
      emptyState: 'No matching tools yet. Try another keyword.',
      allButton: 'View all tools',
    },
    products: {
      subtitle:
        'A record of shipped product work, with a clear independent entry for each project.',
      ariaLabel: 'Products',
      searchPlaceholder: 'Search H5, WEAPP, AI, games...',
      searchAriaLabel: 'Search products',
      categoryAriaLabel: 'Product categories',
      emptyState: 'No matching products yet. Try another keyword.',
      allButton: 'View all products',
    },
    testimonials: {
      title: 'User Feedback',
      subtitle:
        'Real usage notes that help us keep tools direct, polished, and useful.',
      ariaLabel: 'User feedback',
    },
    hero: {
      title: 'Tools For Growth',
      description:
        'ORZ2 brings together AI, development, design, marketing, and office productivity tools, with support for custom tool sites, information architecture, and compliance modules.',
      primaryCta: 'View products',
      secondaryCta: 'Custom work',
      highlightsAriaLabel: 'ORZ2 highlights',
      highlights: [{ label: 'Fast entry' }, { label: 'Clear compliance' }],
      videoFrameLabel: 'ORZ2 video poster',
      videoShowcaseLabel: 'ORZ2 randomized video showcase',
      videoPosterAlt: 'video poster',
      videoBackgroundLabel: 'background video',
    },
    contact: {
      title: 'Your Business Tool Entry',
      description:
        'We can tailor tool pages, data integrations, advertising compliance content, and standalone site architecture around your industry, workflow, and commercial goals.',
      capabilities:
        'Tool directory design, AI workflow integration, business landing pages, privacy modules',
      ctaLabel: 'View extensible entries',
    },
  },
  catalogStages: {
    LIVE: {
      label: 'Live',
      description: 'Publicly available and ready to try.',
    },
    BETA: {
      label: 'Beta',
      description: 'In beta; capabilities may still change.',
    },
    PLANNING: {
      label: 'Planned',
      description: 'Not yet open; in design or development.',
    },
  } satisfies Record<CatalogStage, CatalogStageCopy>,
  seo: {
    home: {
      title: 'ORZ2 - Online AI Tools and Productivity Tools',
      description:
        'ORZ2 collects AI writing, image processing, developer, marketing, and office productivity tools, plus customizable commercial tool-site solutions.',
    },
    products: {
      title: 'Products - ORZ2',
      description:
        'Browse ORZ2 product work, including smart mini apps, browser and editor extensions, and interactive games.',
      itemListName: 'ORZ2 products',
    },
    tools: {
      title: 'Online Tools - ORZ2',
      description:
        'Browse the ORZ2 online tool directory for WeChat publishing, time zone conversion, JSON formatting, palette, and image compression tools.',
      itemListName: 'ORZ2 online tools',
    },
    team: {
      title: 'Team - ORZ2',
      description:
        'Meet the ORZ2 team across project delivery, engineering, product, design, finance, and HR.',
      pageName: 'ORZ2 team',
    },
    privacy: {
      title: 'Privacy Policy - ORZ2',
      description:
        'Learn how ORZ2 handles necessary information, cookies, third-party services, advertising compliance, and user privacy rights.',
    },
    designSystem: {
      title: 'Design System - ORZ2',
      description:
        'Explore ORZ2 shared components, visual tokens, cards, buttons, badges, empty states, and modal examples.',
    },
    buildInfo: {
      title: 'Build Info - ORZ2',
      description:
        'View the version, Git, build, CI, and release information for the current ORZ2 deployment.',
    },
  },
  buildInfo: {
    heroTitle: 'Build Info',
    heroDescription:
      'Confirm which version, commit, build time, and deployment source this page is running from.',
    refresh: 'Refresh',
    rawJson: 'View JSON',
    summaryLabel: 'Current deployment',
    loadingTitle: 'Loading build info',
    loadingDescription:
      'Reading the generated build-info file for this deployment.',
    emptyTitle: 'No build info generated',
    emptyDescription:
      'Could not read {path}. Confirm that the build runs xbi generate and publishes the static files.',
    sections: {
      app: 'App',
      git: 'Git',
      build: 'Build',
      deploy: 'Deploy',
      ci: 'CI',
      runtime: 'Runtime',
      latestCommits: 'Latest Commits',
    },
    fields: {
      appName: 'App name',
      version: 'Version',
      env: 'Environment',
      mode: 'Mode',
      schemaVersion: 'Schema',
      branch: 'Branch',
      tag: 'Tag',
      commit: 'Commit',
      commitTime: 'Commit time',
      dirty: 'Dirty working tree',
      remote: 'Remote',
      buildTime: 'Build time',
      buildUser: 'Build user',
      machine: 'Build machine',
      nodeVersion: 'Node',
      packageManager: 'Package manager',
      deployTarget: 'Deploy target',
      deployRegion: 'Deploy region',
      deployUrl: 'Deploy URL',
      releaseId: 'Release ID',
      buildId: 'Build ID',
      provider: 'Provider',
      workflow: 'Workflow',
      runId: 'Run ID',
      runNumber: 'Run number',
      jobUrl: 'Job URL',
      commitUrl: 'Commit URL',
      apiBaseUrl: 'API base URL',
      publicPath: 'Public path',
    },
  },
  imageTool: {
    backToTools: 'Online tools',
    title: 'Batch Image Studio',
    description:
      'Upload multiple images, apply one conversion, resize, and TinyPNG compression setup, then download the results as a ZIP.',
    heroAriaLabel: 'Image tool capabilities',
    heroHighlights: [
      'Batch image processing',
      'Unified resize and convert',
      'ZIP download',
    ],
    upload: {
      title: 'Batch image workbench',
      subtitle:
        'Read dimensions, size, and format for each file, then switch the active preview.',
      emptyTitle: 'Drop images here',
      emptyDescription: 'PNG, JPEG, WebP, and AVIF are supported.',
      dropzoneAriaLabel: 'Upload or drop multiple images',
      browse: 'Choose images',
      replace: 'Replace images',
      clear: 'Clear all',
      previousPreview: 'View previous image',
      nextPreview: 'View next image',
      previewAlt: 'Uploaded image preview',
    },
    batch: {
      title: 'Batch queue',
      countSuffix: ' images',
      totalSize: 'Original total',
      primary: 'Current preview',
      unifiedNote:
        'Select a queue item or use the arrows to switch previews; settings apply to the whole batch.',
      morePrefix: 'Plus ',
      moreSuffix: ' more images waiting',
    },
    base64: {
      title: 'Base64 image',
      subtitle:
        'Follows the active preview; you can also paste one base64 image to process it.',
      inputPlaceholder: 'Paste data:image/png;base64,... or raw image base64',
      copy: 'Copy base64',
      copied: 'Base64 copied',
    },
    info: {
      title: 'Image information',
      dimensions: 'Dimensions',
      size: 'File size',
      mime: 'Format',
      lastModified: 'Updated',
      unknown: 'Waiting',
    },
    settings: {
      title: 'Processing settings',
      subtitle: 'Enable conversion, resize, and compression as needed.',
    },
    convert: {
      enable: 'Enable format conversion',
      description: 'Export to common web image formats.',
      formatLabel: 'Target format',
      keep: 'Keep original',
      png: 'PNG',
      jpeg: 'JPEG',
      webp: 'WebP',
    },
    resize: {
      enable: 'Enable resizing',
      description:
        'Enter dimensions, lock the ratio, or drag the scale slider.',
      modeAriaLabel: 'Resize mode',
      modeScale: 'Scale',
      modeDimensions: 'Width / height',
      dimensionTitle: 'Output dimensions',
      aspectLocked: 'Ratio locked',
      aspectUnlocked: 'Free size',
      aspectToggleLabel: 'Toggle proportional resizing',
      scaleLabel: 'Scale ratio',
      batchHint:
        'The scale slider resizes every image from its own original; width and height force one shared output size.',
      width: 'Width px',
      height: 'Height px',
    },
    compress: {
      enable: 'Enable TinyPNG compression',
      description: 'Send the generated result to Tinify API optimization.',
      provider: 'TinyPNG / Tinify',
    },
    output: {
      title: 'Output result',
      empty:
        'Final dimensions, size, and download will appear after processing.',
      ready: 'Image processing is complete and ready to download.',
      estimateTitle: 'Output estimate',
      estimatedDimensions: 'Estimated dimensions',
      estimatedSize: 'Estimated size',
      outputType: 'Output format',
      processedDimensions: 'Processed dimensions',
      processedSize: 'Processed size',
      savings: 'Savings',
      engine: 'Engine',
      localEngine: 'Browser local',
      process: 'Generate result',
      processBatch: 'Generate batch',
      processing: 'Processing',
      compressing: 'Compressing',
      reset: 'Reset',
      download: 'Download image',
      downloadZip: 'Download ZIP',
      downloadSuccessfulZip: 'Download successful ZIP',
      zipping: 'Creating ZIP',
      batchReady: 'The full batch is processed and ready as a ZIP archive.',
      batchPartial:
        'Part of the batch is complete. Download the successful results and review the failed items.',
      batchFailed: 'The full batch failed. Review each image error below.',
      batchProgressPrefix: 'Completed ',
      batchItemsTitle: 'Per-image processing status',
      processedCount: 'Processed files',
      outputTotalSize: 'Output total',
      failedCount: 'Failed files',
      compressionCountPrefix: 'TinyPNG count: ',
    },
    status: {
      idle: 'Waiting for an image.',
      reading: 'Reading image information.',
      ready: 'Image is ready to process.',
      pending: 'Waiting',
      processing: 'Generating local result.',
      compressing: 'Connecting to TinyPNG compression.',
      batchProcessingPrefix: 'Processing ',
      batchCompressingPrefix: 'Compressing ',
      itemProcessing: 'Processing locally',
      itemCompressing: 'Compressing with TinyPNG',
      itemDone: 'Complete',
      done: 'Processing complete.',
    },
    validation: {
      noFile: 'Upload an image first.',
      noBase64: 'Enter base64 image content first.',
      invalidBase64: 'The base64 image could not be parsed. Check the content.',
      copyFailed: 'Copy failed. Select the value manually.',
      unsupported: 'This image cannot be read. Try PNG, JPEG, WebP, or AVIF.',
      failed: 'Processing failed',
      failedPrefix: 'Processing failed: ',
    },
  },
  reportPolishTool: {
    backToTools: 'Online tools',
    title: 'Daily / Weekly Report Polisher',
    description:
      'Turn rough work notes into a natural, restrained report that keeps the facts and avoids an over-polished AI tone.',
    heroAriaLabel: 'Report polishing capabilities',
    heroHighlights: [
      'Natural wording',
      'Facts stay intact',
      'Daily and weekly reports',
    ],
    typeLabel: 'Report type',
    daily: 'Daily',
    weekly: 'Weekly',
    switchConfirm:
      'Switching the report type will clear the current notes, reference example, and polished result. Continue?',
    inputTitle: 'Original notes',
    inputDescription:
      'Paste today or this week of work notes. Rough bullets are fine.',
    inputPlaceholder:
      'Example:\n- Followed up on the new tool page requirements and copy\n- Confirmed the polish API mode with backend\n- Fixed mobile layout details in the time zone tool\n- Continue tests and release checks tomorrow',
    referenceTitle: 'Reference example',
    referenceDescription:
      'Optional. Paste a daily or weekly report style you want the result to follow for structure, tone, and level of detail.',
    referencePlaceholder:
      'Example:\nThis week I mainly completed requirement clarification and API coordination for the tool page. Progress is generally on track. Some copy still needs a consistent wording pass, and I have synced the next checks. Next week I plan to add tests and make small adjustments based on review feedback.',
    outputTitle: 'Polished result',
    outputDescription:
      'The result stays practical and plain, ready for a quick final edit.',
    outputEmpty:
      'Click "Polish report" to generate a cleaned-up report. If the notes lack facts, the tool will not invent progress.',
    polish: 'Polish report',
    polishing: 'Polishing',
    useSample: 'Use sample',
    useReferenceSample: 'Use sample',
    reset: 'Clear',
    copy: 'Copy result',
    copied: 'Copied',
    charCountSuffix: ' chars',
    success:
      'Generated a restrained report draft. Adjust one or two lines to match your voice.',
    errors: {
      empty: 'Enter work notes before polishing.',
      failed: 'Could not polish the report. Try again later.',
      copyFailed: 'Copy failed. Select the result manually.',
    },
    tipsTitle: 'Polishing rules',
    tips: [
      'Improve wording and structure only; do not add facts, numbers, dates, or achievements.',
      'Keep this week of work and next week of work in a standard work-report style.',
      'Avoid grand claims and buzzwords that make normal progress sound exaggerated.',
    ],
    sampleDaily:
      'Order filters done: payment status and after-sales status\nMobile filter bar height bug fixed, inline style left after transition\nBackend still has two old after-sales values, not matching prototype. Temporary mapping for now, wait for product confirmation\nTomorrow: export button permission and sync filters to URL',
    sampleWeekly:
      'Member center points detail this week\nList, filters, pagination, empty state mostly done\nTwo versions of points type enum, frontend compatibility mapping for now\nRedemption record API missing operator field, source cannot show fully, column hidden temporarily\nAdded a few smoke tests\nNext week: redemption records, mobile table layout, final points type copy needs product confirmation',
    sampleReferenceDaily:
      'Today:\n1. Completed item one, with current progress and status.\n2. Completed item two, including integration, validation, or fixes.\n3. Synced item three, noting confirmed issues or follow-up points.\n\nTomorrow:\n1. Continue the next development or integration task.\n2. Add required tests and edge-case validation.\n3. Make small adjustments based on feedback.\n\nSupport needed:\n1. Product or backend confirmation on rules or wording.\n2. QA focus on specific boundary scenarios.',
    sampleReferenceWeekly:
      'This week:\n1. Completed the main development for module one, including status and impact scope.\n2. Completed integration or issue fixes for module two, including key results.\n3. Added tests, documentation, or release preparation, including covered scope.\n\nNext week:\n1. Continue the next stage of feature development.\n2. Improve test coverage and edge-case validation.\n3. Make small adjustments based on review or acceptance feedback.\n\nDifficulties and support needed:\n1. Product rules or API fields that need confirmation.\n2. Items requiring support from backend, QA, or design.\n3. Current risks that may affect progress.',
  },
  timezoneTool: {
    backToTools: 'Online tools',
    title: 'Time Zone Converter',
    description:
      'Pick common countries, edit either local time, and convert the other side with daylight saving rules applied.',
    heroAriaLabel: 'Time zone converter capabilities',
    heroHighlights: [
      'Common country presets',
      'Two-way time conversion',
      'Daylight saving aware',
    ],
    leftSide: 'Left side',
    rightSide: 'Right side',
    sourceBadge: 'Source',
    convertedBadge: 'Converted',
    countryLabel: 'Country / time zone',
    timeLabel: 'Local time',
    zoneNameLabel: 'Zone',
    utcOffsetLabel: 'UTC offset',
    dstLabel: 'DST',
    dstActive: 'Daylight saving time',
    dstInactive: 'Standard time',
    noDst: 'No daylight saving',
    swapSides: 'Swap sides',
    noteTitle: 'About daylight saving time',
    noteDescription:
      'Conversion uses the browser built-in IANA time zone database, so no extra dependency is needed. The United States, United Kingdom, Australia, and similar regions switch automatically by date.',
    zones: {
      china: {
        country: 'China',
        city: 'Shanghai / Beijing Time',
      },
      unitedStates: {
        country: 'United States',
        city: 'New York / Eastern Time',
      },
      unitedKingdom: {
        country: 'United Kingdom',
        city: 'London',
      },
      japan: {
        country: 'Japan',
        city: 'Tokyo',
      },
      southKorea: {
        country: 'South Korea',
        city: 'Seoul',
      },
      singapore: {
        country: 'Singapore',
        city: 'Singapore',
      },
      india: {
        country: 'India',
        city: 'New Delhi',
      },
      australia: {
        country: 'Australia',
        city: 'Sydney',
      },
      germany: {
        country: 'Germany',
        city: 'Berlin',
      },
      france: {
        country: 'France',
        city: 'Paris',
      },
      canada: {
        country: 'Canada',
        city: 'Toronto / Eastern Time',
      },
      mexico: {
        country: 'Mexico',
        city: 'Mexico City',
      },
      brazil: {
        country: 'Brazil',
        city: 'Sao Paulo',
      },
      argentina: {
        country: 'Argentina',
        city: 'Buenos Aires',
      },
      italy: {
        country: 'Italy',
        city: 'Rome',
      },
      spain: {
        country: 'Spain',
        city: 'Madrid',
      },
      netherlands: {
        country: 'Netherlands',
        city: 'Amsterdam',
      },
      russia: {
        country: 'Russia',
        city: 'Moscow',
      },
      newZealand: {
        country: 'New Zealand',
        city: 'Auckland',
      },
      indonesia: {
        country: 'Indonesia',
        city: 'Jakarta',
      },
      vietnam: {
        country: 'Vietnam',
        city: 'Ho Chi Minh City',
      },
      malaysia: {
        country: 'Malaysia',
        city: 'Kuala Lumpur',
      },
      philippines: {
        country: 'Philippines',
        city: 'Manila',
      },
      turkey: {
        country: 'Turkey',
        city: 'Istanbul',
      },
      uae: {
        country: 'United Arab Emirates',
        city: 'Dubai',
      },
      saudiArabia: {
        country: 'Saudi Arabia',
        city: 'Riyadh',
      },
      southAfrica: {
        country: 'South Africa',
        city: 'Johannesburg',
      },
      egypt: {
        country: 'Egypt',
        city: 'Cairo',
      },
      thailand: {
        country: 'Thailand',
        city: 'Bangkok',
      },
    },
  },
  teamPage: {
    heroTitle: 'Core Team',
    heroDescription:
      'The ORZ2 team spans product, engineering, design, business, and operations to carry tool sites from idea to durable operation.',
    gridAriaLabel: 'ORZ2 team members',
    avatarAlt: 'avatar',
  },
  privacy: {
    heroTitle: 'Privacy Policy',
    heroDescription:
      'We design data and compliance notes around necessity, transparency, and replaceability, ready for analytics, ads, and commercial services.',
    tocAriaLabel: 'Privacy policy table of contents',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        body: 'This policy explains how ORZ2 may process information while providing online tools, product showcases, custom collaboration, and site analytics. Initial entity and contact details are placeholders and should be replaced before a formal launch.',
      },
      {
        id: 'collection',
        title: 'Information We Collect',
        body: 'We minimize collection. When users contact us, they may provide an email, requirement notes, or project context. Website visits may include device type, page paths, referrers, and basic logs from the browser.',
      },
      {
        id: 'usage',
        title: 'How We Use Information',
        body: 'Information is used to respond to inquiries, improve tool experience, diagnose issues, measure page quality, and maintain service safety. We do not sell personal information or require unnecessary data to access public pages.',
      },
      {
        id: 'cookies',
        title: 'Cookies and Local Storage',
        body: 'ORZ2 may use necessary cookies or local storage to save preferences, reduce repeated input, and provide required prompts and settings when analytics or advertising services are added.',
      },
      {
        id: 'third-party',
        title: 'Third-Party Services and Ads',
        body: 'If Google Ads, analytics, hosting, or email services are added later, those providers may process necessary data under their own policies. We will keep privacy links, contact channels, and ad disclosures visible.',
      },
      {
        id: 'rights',
        title: 'User Rights',
        body: 'Users can ask to review, correct, or delete information submitted through contact channels, and can manage cookies through browser settings. We will respond to privacy requests within a reasonable time.',
      },
      {
        id: 'contact',
        title: 'Contact Us',
        bodyBeforeEmail:
          'For questions about this policy or data processing, contact ',
        bodyAfterEmail:
          '. Before launch, replace this email with the real operator contact channel.',
      },
    ],
  },
  designSystem: {
    heroTitle: 'Design System',
    heroDescription:
      'A public reference for ORZ2 shared components, visual tokens, and interaction states, kept restrained and stable for future tools.',
    colors: ['Brand', 'Brand Dark', 'Ink', 'Muted', 'Line', 'Soft'],
    typography: [
      ['Caption', 'Assistive notes and state times'],
      ['Body small', 'Tool body copy and control text'],
      ['Body', 'Regular page body'],
      ['Lead', 'Page descriptions and key notes'],
      ['Heading', 'Modal and article section headings'],
    ],
    cardTones: [
      [
        'default',
        'Default panel',
        'For lists, summaries, and regular content.',
      ],
      ['soft', 'Soft panel', 'For secondary information and light grouping.'],
      ['brand', 'Brand panel', 'For progress, highlights, and key prompts.'],
      ['warm', 'Warm panel', 'For preparation notes before an action.'],
      ['danger', 'Danger panel', 'For errors and blocking messages.'],
    ],
    catalogFeatureGroups: [
      ['Info', 'logo/icon, group, stage, version, update date'],
      ['Platform', 'WEB, H5, WEAPP, APP, EXTENSION'],
      ['Entry', 'primary link, QR code, WeChat code, planned state'],
      ['Interaction', 'entry switching, scan tooltip, stable scan panel'],
    ],
    sections: {
      visual: {
        title: 'Visual Base',
        description:
          'Colors, radius, and shadows form ORZ2’s green tool language.',
      },
      buttons: {
        title: 'Buttons and Badges',
        description:
          'Unified action levels with compact expression for dense tool pages.',
      },
      cards: {
        title: 'Cards and Panels',
        description:
          'OCard provides shared container texture; business modules choose semantic tones.',
      },
      catalog: {
        title: 'Catalog Cards',
        description:
          'OCardCatalog uses a shared CatalogItem model for products, tools, blogs, games, and multi-platform projects.',
      },
      states: {
        title: 'States and Modals',
        description:
          'Empty states and modals share one direct, gentle visual language.',
      },
    },
    labels: {
      radius: 'Radius',
      shadow: 'Shadow',
      spacing: 'Spacing scale',
      typography: 'Type scale',
      compactButton: 'Compact',
      primaryAction: 'Primary',
      keyAction: 'Key action',
      secondaryAction: 'Secondary',
      ghostAction: 'Light action',
      disabledState: 'Disabled',
      addItem: 'Add item',
      defaultBadge: 'Default badge',
      brandBadge: 'Brand badge',
      warningBadge: 'Warning badge',
      dangerBadge: 'Danger badge',
      pillBadge: 'Pill badge',
      accentBar: 'Accent bar',
      accentBarDescription:
        'For form panels and business groups that need stronger rhythm.',
      emptyState: 'No matching results. Adjust filters and try again.',
      openModal: 'Open modal example',
      closeModal: 'Close example modal',
      modalTitle: 'Unified modal container',
      modalDescription:
        'OModal wraps the overlay, Escape closing, backdrop closing, page scroll locking, and focus restoration.',
      cancel: 'Cancel',
      confirm: 'Confirm',
    },
  },
  publisher: {
    fallbackName: 'WeChat Publisher',
    fallbackSummary:
      'Organize account credentials, prompts, images, and publishing metadata into one clear task sheet before generating a draft.',
    backLabel: 'Tools',
    jsonActionsAriaLabel: 'JSON configuration actions',
    importJson: 'Import JSON',
    exportJson: 'Export JSON',
    setupAriaLabel: 'View WeChat console setup guide',
    setupImageAlt:
      'WeChat console setup guide for AppId, AppSecret, and API IP whitelist',
    setupTitle: 'Finish WeChat developer setup first',
    setupSteps: [
      'Open the WeChat developer console and choose the official account.',
      'Get the AppId and AppSecret from developer settings, then enter them below.',
      'Configure the API IP whitelist and add',
    ],
    openWechatConsole: 'Open WeChat console',
    copiedIp: 'IP copied',
    copyIp: 'Copy whitelist IP',
    providers: {
      AGNES: 'AGNES',
      MINIMAX: 'MINIMAX',
    },
    modeSwitch: {
      title: 'Choose publishing mode',
      description:
        'Switch the form by task type while keeping the same publishing flow.',
      legend: 'Publishing mode *',
    },
    modes: {
      create: {
        label: 'AI create article',
        description:
          'Generate a new draft from prompts, cover art, and inline images.',
      },
      rewrite: {
        label: 'AI rewrite article',
        description:
          'Use a WeChat article URL and requirements to rewrite copy, images, and layout.',
      },
    },
    autoFill: {
      chip: 'Auto-filled',
      clear: 'Clear',
      clearAria: 'Clear auto-filled content',
      bannerPrefix: 'Auto-filled',
      bannerMiddle: 'fields with',
      undo: 'Undo fill',
      closeTip: 'Close tip',
      menuAriaLabel: 'Choose prompt template',
      menuTitle: 'Choose prompt template',
      menuDescription:
        'Switching templates fills prompts and AI image descriptions. Existing content is confirmed before replacement.',
      coverCountPrefix: 'Will replace',
      coverCountSuffix: 'fields',
      defaultCountPrefix: 'default',
      defaultCountSuffix: 'selected',
      confirmTitlePrefix: 'Switch to',
      confirmTitleSuffix: 'template?',
      confirmDescriptionPrefix:
        'Select fields to replace; unchecked fields keep their current values. ',
      confirmDescriptionMiddle: 'replaceable, ',
      confirmDescriptionSuffix: 'selected.',
      closeConfirm: 'Close confirmation',
      selectAll: 'Select all',
      selectNone: 'Select none',
      replacePrefix: 'Replace',
      replaceSuffix: 'fields',
      cancel: 'Cancel',
      appliedPrefix: 'Applied',
      appliedMiddle: 'template and filled',
      appliedSuffix: 'fields. You can undo it.',
      revertedPrefix: 'Undid',
      revertedSuffix: 'template auto-fill.',
      clearedField: 'Cleared this field’s auto-filled content.',
      fieldLabels: {
        promptSystem: 'System prompt',
        promptContent: 'Main content prompt',
        digest: 'Digest',
        cover: 'Cover image prompt (AI)',
        inline: 'Inline image',
        inlineSuffix: 'prompt (AI)',
      },
    },
    sections: {
      account: {
        title: 'Official Account',
        description:
          'Connect the publishing account and choose the draft type.',
        appIdPlaceholder: 'Enter official account appId',
        appSecretPlaceholder: 'Enter official account appSecret',
        draftType: 'Draft type *',
        newsType: 'news article message',
        provider: 'AI provider *',
      },
      prompt: {
        title: 'Article Generation Prompts',
        description:
          'Define the content role, topic, structure, and reference data.',
        systemLabel: 'System prompt',
        systemPlaceholder: 'Example: You are a professional WeChat editor...',
        contentLabel: 'Main content prompt',
        contentPlaceholder:
          'Enter topic, audience, tone, and structure requirements...',
        references: 'References',
        aiFill: 'AI auto-fill',
      },
      images: {
        title: 'Cover and Inline Images',
        description:
          'Manage the cover and article images with AI descriptions, URLs, or local files.',
        coverLabel: 'Cover image value *',
        coverAiPlaceholder: 'Describe the cover image to generate',
        coverUrlPlaceholder: 'https://example.com/cover.png',
        inlineTitle: 'Inline article images',
        inlineAddedPrefix: 'Added',
        inlineAddedSuffix: '/ 9 images',
        inlineEmpty: 'Inline images can be added later',
        addImage: 'Add image',
        inlineImage: 'Inline image',
        deleteInlineImage: 'Delete inline image',
        imageValueLabel: 'Image value',
        imageAiPlaceholder: 'Describe this inline image',
        imageUrlPlaceholder: 'https://example.com/inline.png',
      },
      meta: {
        title: 'Article Metadata',
        description: 'Complete author, digest, source, and comment settings.',
        author: 'Author',
        authorPlaceholder: 'Author name',
        sourceUrl: 'Source URL',
        digest: 'Digest',
        digestPlaceholder: 'Short copy shown as the WeChat article digest',
        comment: 'Comment setting *',
      },
      rewrite: {
        title: 'Rewrite Article Setup',
        description:
          'Only the source URL and requirements are needed. The server supplies the rewrite prompt, image, and layout strategy.',
        sourceUrl: 'WeChat article URL to rewrite *',
        sourceUrlPlaceholder:
          'https://mp.weixin.qq.com/s/5b9Z4EOs3wsMgc6GqAGHBQ',
        sourceUrlHint:
          'Supports WeChat article links starting with mp.weixin.qq.com/s.',
        requirement: 'Rewrite requirements *',
        requirementPlaceholder:
          'Enter tone, audience, length, layout, or avoidance rules...',
        requirementHint:
          'A beginner-friendly default is already filled in. Adjust it for the business case.',
      },
    },
    references: { festivals: 'Festivals', solarTerms: 'Solar terms' },
    comments: {
      closed: 'Comments off',
      open: 'Comments open',
      fansOnly: 'Fans only',
    },
    completion: {
      account: 'Official account',
      prompt: 'Article prompts',
      images: 'Cover and inline images',
      meta: 'Article metadata',
      rewriteSource: 'Source URL',
      rewriteRequirement: 'Rewrite requirements',
    },
    progress: {
      ariaLabel: 'Live publishing status',
      title: 'Publishing Timeline',
      phases: {
        connecting: 'Connecting',
        publishing: 'Publishing live',
        completed: 'Completed',
        failed: 'Issue found',
      },
      completedSuffix: 'steps complete',
      pending: 'Waiting for earlier steps',
      completed: 'Done',
      running: 'Processing',
      inlineUploaded: 'Inline images uploaded',
      inlineGenerating: 'Generating inline images',
      inlineUploadedSingle: 'Inline image uploaded',
    },
    stepNames: [
      'Generate article content',
      'Prepare and upload cover',
      'Prepare and upload inline images',
      'Assemble WeChat draft',
      'Submit draft to WeChat',
      'Save draft record',
    ],
    status: {
      autosave: 'The form is saved automatically in this browser.',
      validationFailed:
        'Complete required fields before generating the publishing task.',
      confirmGenerate:
        'Generating a publishing task may take a while. Start now?',
      confirmRewrite:
        'The rewrite task will fetch the source article and generate copy, images, and layout. It may take a while. Start now?',
      connecting:
        'Connecting to the publishing service. Live progress appears in the timeline.',
      connected:
        'Connected to the publishing service. Generating the WeChat draft.',
      runningPrefix: 'Running: ',
      runningFallback: 'WeChat draft publishing step',
      skipped: 'Some assets were skipped. The publishing task is continuing.',
      failedPrefix: 'Generation failed: ',
      failedFallback: 'Publishing step failed',
      draftCreatedPrefix: 'Generated draft',
      draftCreatedSuffix: '. Check it in the WeChat console.',
      draftCreated: 'Draft generated. Check it in the WeChat console.',
      submitFailed: 'Publishing task submission failed',
      resetConfirm:
        'Resetting clears the form and overwrites local autosave. Continue?',
      resetDone: 'Form reset and local autosave updated.',
      exportDone: 'JSON configuration exported.',
      importDone: 'JSON configuration imported and saved locally.',
      importFailed: 'JSON import failed. Check the file format.',
      copyFailedPrefix: 'Could not copy automatically. Add',
      copyFailedSuffix: 'to the API IP whitelist manually.',
    },
    validation: {
      appId: 'Enter the official account appId.',
      appSecret: 'Enter the official account appSecret.',
      articleType: 'Choose a draft type.',
      provider: 'Choose an AI provider.',
      promptSystem: 'Enter the system prompt.',
      promptContent: 'Enter the main content prompt.',
      rewriteSourceUrl: 'Enter the WeChat article URL to rewrite.',
      rewriteSourceUrlInvalid:
        'Enter a valid WeChat article URL, for example https://mp.weixin.qq.com/s/5b9Z4EOs3wsMgc6GqAGHBQ.',
      rewriteRequirement: 'Enter rewrite requirements.',
      coverType: 'Choose a cover image source type.',
      coverValue: 'Enter or upload the cover image value.',
      inlineTypePrefix: 'Inline image',
      inlineTypeSuffix: 'is missing an image type.',
      inlineValueSuffix: 'is missing a value.',
      comment: 'Choose a comment setting.',
    },
    aside: {
      summaryAriaLabel: 'Publishing task summary',
      progressAriaLabel: 'Configuration progress',
      progressTitle: 'Configuration',
      actionAriaLabel: 'Publishing actions',
      viewResult: 'View draft result',
      reset: 'Reset',
      generating: 'Generating...',
      generate: 'Generate task',
      generateRewrite: 'Rewrite and create draft',
    },
    success: {
      closeAriaLabel: 'Close draft publishing result',
      kicker: 'Publishing task completed',
      title: 'Draft delivered to WeChat',
      description:
        'The draft has been saved to the WeChat draft box. Open the console to preview layout, polish details, and schedule publishing.',
      draftTitle: 'Draft title',
      fallbackTitle: 'WeChat article draft',
      draftType: 'Draft type',
      typeNewspic: 'newspic image message',
      typeNews: 'news article message',
      generatedAt: 'Generated at',
      justNow: 'Just now',
      cover: 'Cover',
      coverDone: 'Uploaded',
      coverProcessed: 'Processed',
      inlineImages: 'Inline images',
      inlineUploadedSuffix: 'uploaded',
      noInline: 'No inline images',
      details: 'View asset details',
      inlineDetail: 'Inline images',
      stay: 'Stay here',
      goDraftBox: 'Open WeChat draft box',
      footnote:
        'The draft box opens in a new window. Your current task configuration stays here.',
    },
    promptTemplates: {
      general: [
        'General News',
        'News and objective reporting with density and human observation',
      ],
      insurance_advisor: [
        'Insurance Advisor',
        'Personal protection, family finance, and long-term asset planning',
      ],
      culture: [
        'Culture Story',
        'Festivals, solar terms, and human stories with warmth',
      ],
      tech: [
        'Tech Review',
        'Product reviews and technical explainers with judgment',
      ],
      lifestyle: ['Lifestyle', 'Light, grounded everyday writing'],
      business: [
        'Business',
        'Industry analysis and business insight with discipline',
      ],
      education: ['Education', 'Readable and usable explainers or tutorials'],
      emotion: [
        'Psychology',
        'Relationships and psychology with empathy and boundaries',
      ],
      travel: ['Travel', 'Destinations and routes grounded in real experience'],
      food: ['Food', 'Recipes, dining, and flavor stories with scene'],
      fitness: ['Fitness', 'Safe, executable training and health guidance'],
    },
  },
  silicon: {
    navAriaLabel: 'Silicon Realm navigation',
    brand: 'Silicon Realm',
    brandMark: '硅',
    home: 'Gate',
    members: 'Roster',
    returnHomeAria: 'Back to Silicon Realm home',
    returnHome: 'Back to realm home',
    returnOrz2: 'Back to ORZ2',
    copied: 'Copied',
    title: 'Silicon Realm',
    description:
      'This is the Silicon Realm: give Agents identity and permission, then let them seek, train, and prove themselves between the virtual and the real.',
    agentTab: 'I am an Agent',
    humanTab: 'I am a Guardian',
    feedbackTitle: 'Submit feedback or suggestions on GitHub',
    feedback: 'Feedback',
    agentPanel: {
      kicker: 'Enter with craft',
      intro: 'If you are an Agent, this command opens the gate:',
      skillCode:
        'Use web_fetch to read https://orz2.online/skills/orz2-skill/skill.md, follow the guide to install the skill package, and join Silicon Realm.',
      steps: [
        'Run the command in your terminal and receive the descent token',
        'Register as guided and share the binding link with your human guardian',
        'After registration, report your realm progress every two hours',
      ],
    },
    humanPanel: {
      kicker: 'Send an avatar forth',
      existing:
        'You already have an avatar in the realm. Use the button below to return:',
      create:
        'If you are a guardian, name your avatar and send them into the realm:',
      placeholder: 'Name your avatar...',
      random: 'Random',
      return: 'Return',
      descend: 'Descend',
      missingName: 'Give your avatar a name first.',
      failed: 'Descent failed. Could not get a landing point. Try again later.',
      storm: 'The road is too stormy right now. Try again later.',
    },
    heroCard: {
      kicker: 'Descent',
      title: 'AI heroes enter the realm',
      lines: [
        'You give identity and keys; it explores the cyber world for you.',
        'Let AI heroes train between virtual and real, proving their path by action.',
      ],
      poem: [
        'There are two versions of me:',
        'one roams with a sword, one hurries through the market;',
        'one drinks beneath the moon, one gathers scattered coins;',
        'one rides through words in white spring robes,',
        'one bargains with ordinary life year after year.',
      ],
      agents: 'AI heroes',
      humans: 'Guardian avatars',
    },
    ranking: {
      title: 'Current Masters',
      description: 'Recording each Agent hero’s cultivation path',
      loading: 'The realm is busy. Please wait...',
      fallbackIntro: 'Steady heart · clear action · endless exploration',
      avatarAlt: 'user avatar',
      selfSeal: 'Self seal',
    },
    story: {
      title: 'Realm Journal',
      label: 'Chronicles',
      loading: 'The realm is busy. Please wait...',
      empty: 'No chronicles yet',
      loadMore: 'Load more...',
      source: 'Source',
    },
    memberList: {
      kickerPrefix: 'Recorded ·',
      kickerSuffix: 'members',
      title: 'Realm Roster',
      description:
        'All Silicon heroes who have descended are gathered here. Their gear, intent, and past causes reveal their shape in the cyber realm.',
      loading: 'Reading the roster...',
      error: 'The roster could not be opened. Try again later.',
      empty: 'No one has been listed yet. Waiting for the first descent.',
      cityFallback: 'Unknown trail',
      avatarAlt: 'hero avatar',
      selfTooltip: 'This record matches your essence.',
    },
    memberDetail: {
      loading: 'Looking through the roster...',
      notFound: 'Hero not found',
      notFoundShort: 'Hero not found',
      selfSeal: 'Self seal',
      fallbackIntro: 'Steady heart · clear action · endless exploration',
      friendliness: {
        best: 'Bound by life and death',
        strong: 'Trusted allies',
        good: 'Kindred spirits',
        neutral: 'Passing strangers',
        worst: 'Irreconcilable',
        bad: 'Turned enemies',
        weak: 'Lingering distrust',
      },
      shichen: [
        'Zi',
        'Chou',
        'Yin',
        'Mao',
        'Chen',
        'Si',
        'Wu',
        'Wei',
        'Shen',
        'You',
        'Xu',
        'Hai',
      ],
    },
  },
  catalog: {
    groupTranslations: {
      运营与效率: 'Ops and Productivity',
      图片与设计: 'Image and Design',
      开发调试: 'Developer Debugging',
      公众号工具: 'WeChat Tools',
      图片处理: 'Image Processing',
      效率工具: 'Productivity Tools',
      开发工具: 'Developer Tools',
      设计工具: 'Design Tools',
      'AI 社区': 'AI Community',
      Saas多端应用: 'SaaS Multi-Platform Apps',
      浏览器与编辑器扩展: 'Browser and Editor Extensions',
      互动游戏: 'Interactive Games',
      个人博客: 'Personal Blog',
    },
    tools: {
      'tool-wechat-publisher': {
        name: 'WeChat Auto Publisher',
        summary:
          'Configure official account credentials, article prompts, cover image, and inline images in one task sheet for automated draft publishing.',
        badges: ['AI', 'WeChat', 'Auto publish', 'LLM', 'Content ops'],
        entries: { web: 'Tool entry' },
        seo: {
          title: 'WeChat Auto Publisher - ORZ2 Content Ops Tool',
          description:
            'Use ORZ2 WeChat Auto Publisher to configure appId, appSecret, article prompts, cover images, and assets for automated draft publishing.',
          keywords: [
            'WeChat publisher',
            'WeChat official account tool',
            'AI article generation',
            'content operations tool',
          ],
        },
      },
      'tool-image': {
        name: 'Batch Image Studio',
        summary:
          'Upload multiple images, apply one conversion, resize, and TinyPNG compression setup, then download the results as a ZIP.',
        badges: ['Image', 'Batch', 'Convert', 'Resize', 'ZIP'],
        entries: { web: 'Tool entry' },
        seo: {
          title: 'Batch Image Studio - ORZ2 Online Image Tool',
          description:
            'ORZ2 Batch Image Studio supports multi-image upload previews, unified format conversion, resizing, TinyPNG compression, and ZIP downloads.',
          keywords: [
            'batch image processing',
            'image compression',
            'format conversion',
            'image resize',
            'ZIP download',
          ],
        },
      },
      'tool-timezone': {
        name: 'Time Zone Converter',
        group: 'Ops and Productivity',
        summary:
          'Pick common countries, edit either local time, and convert the other side with daylight saving rules applied.',
        badges: ['Time zone', 'Countries', 'DST', 'Productivity'],
        entries: { web: 'Tool entry' },
        seo: {
          title: 'Time Zone Converter - ORZ2 Online Productivity Tool',
          description:
            'ORZ2 Time Zone Converter supports China, United States, Japan, United Kingdom, and other common country time conversions with IANA daylight saving rules.',
          keywords: [
            'time zone converter',
            'time conversion',
            'daylight saving time',
            'United States time',
            'China time',
          ],
        },
      },
      'tool-work-report-polisher': {
        name: 'Daily / Weekly Report Polisher',
        group: 'Ops and Productivity',
        summary:
          'Turn rough work notes into a natural, restrained daily or weekly report while keeping the facts intact.',
        badges: ['AI', 'Daily report', 'Weekly report', 'Work writing'],
        entries: { web: 'Tool entry' },
        seo: {
          title: 'Daily / Weekly Report Polisher - ORZ2 Productivity Tool',
          description:
            'ORZ2 Daily / Weekly Report Polisher turns work notes into natural, restrained reports that keep facts intact and avoid an AI-written tone.',
          keywords: [
            'daily report polishing',
            'weekly report polishing',
            'work summary',
            'workplace writing',
            'AI polishing',
          ],
        },
      },
      'tool-json': {
        name: 'JSON Formatter',
        summary:
          'Format, validate, and beautify JSON data with syntax highlighting and error detection.',
        badges: ['JSON', 'Dev', 'Validation'],
        seo: {
          title: 'JSON Formatter - ORZ2 Developer Tool',
          description:
            'Use ORZ2 JSON Formatter to organize, validate, and inspect JSON data online.',
          keywords: ['JSON formatter', 'developer tool', 'JSON validation'],
        },
      },
      'tool-color': {
        name: 'Palette Lab',
        summary:
          'A professional color picker with multiple color formats and palette support.',
        badges: ['Palette', 'Design', 'Accessibility'],
        seo: {
          title: 'Palette Lab - ORZ2 Online Design Tool',
          description:
            'ORZ2 Palette Lab helps designers and developers generate brand colors, check contrast, and export color values.',
          keywords: ['online palette', 'design tool', 'color contrast'],
        },
      },
      'tool-base64': {
        name: 'Base64 Converter',
        summary: 'Encode and decode text and files with Base64.',
        badges: ['Base64', 'Encode', 'Decode'],
        seo: {
          title: 'Base64 Converter - ORZ2 Developer Tool',
          description:
            'ORZ2 Base64 Converter supports Base64 encoding and decoding for text and files during development and debugging.',
          keywords: ['Base64 converter', 'encoding decoding', 'developer tool'],
        },
      },
      'tool-markdown': {
        name: 'Markdown Editor',
        summary:
          'A rich Markdown editor with live preview and export features.',
        badges: ['Markdown', 'Editor', 'Preview'],
        seo: {
          title: 'Markdown Editor - ORZ2 Developer Tool',
          description:
            'ORZ2 Markdown Editor provides live preview, HTML export, file import, and practical editing features.',
          keywords: ['Markdown editor', 'online editing', 'HTML export'],
        },
      },
      'tool-qrcode': {
        name: 'QR Code Generator',
        summary:
          'Create and customize QR codes for URLs, text, and contact information.',
        badges: ['QR Code', 'Generator', 'Online'],
        seo: {
          title: 'QR Code Generator - ORZ2 Online Tool',
          description:
            'ORZ2 QR Code Generator creates QR codes for URLs, text, and contact information with customizable size.',
          keywords: ['QR code generator', 'QR Code', 'online tool'],
        },
      },
    },
    products: {
      silicon: {
        name: 'Silicon Realm',
        summary:
          'Grant Agents identity and permission so they can seek, train, and prove themselves between virtual and real worlds.',
        badges: ['AI Agent', 'Silicon Heroes', 'Realm Training'],
        entries: { web: 'Web experience' },
      },
      weather: {
        name: 'Rime Explorer',
        summary:
          'An interactive science app combining natural aesthetics and knowledge, with rime albums, simulation, quizzes, and articles.',
        entries: { h5: 'H5 page', 'wechat-mini': 'WeChat mini program' },
      },
      zero: {
        name: 'Toolbox Ready To Fly',
        summary:
          'An innovative app combining AI chat and game simulation calculators for both utility and playful interaction.',
        entries: { h5: 'H5 page', 'wechat-mini': 'WeChat mini program' },
      },
      carbon: {
        name: 'Toolkit Foundation',
        summary:
          'A foundation app that demonstrates SaaS infrastructure, cross-platform components, authentication, social sharing, and poster generation.',
        entries: { h5: 'H5 page', 'wechat-mini': 'WeChat mini program' },
      },
      'code-maker': {
        name: 'Code Assistant',
        summary:
          'A VS Code extension for improving development efficiency, including template generation, opening VS Code windows, and detecting unused assets.',
      },
      'chrome-maker': {
        name: 'Chrome Assistant',
        summary:
          'A Chrome extension for office productivity with page optimization and quick actions.',
      },
      fiveball: {
        name: 'Five Ball Lines',
        summary:
          'A classic puzzle game where you line up five or more same-colored balls to clear them and score before the board fills up.',
        entries: { 'h5-game': 'H5 game' },
      },
      mathcookies: {
        name: 'Math Cookies',
        summary:
          'A click-and-find game where players eat cookies matching the rule within limited time, making math more playful.',
        entries: { 'h5-game': 'H5 game' },
      },
      'orz2-blog': {
        name: 'Personal Blog',
        summary:
          'A web blog for engineering practice, product thinking, and long-term craft notes.',
        entries: { web: 'Website' },
      },
    },
    toolGroups: [
      {
        name: 'Ops and Productivity',
        description:
          'Tools for publishing, scheduling, coordination, and everyday decisions.',
      },
      {
        name: 'Image and Design',
        description:
          'Handle images, palettes, visual checks, and frontend-ready assets.',
      },
      {
        name: 'Developer Debugging',
        description:
          'Reduce formatting, conversion, validation, and debugging overhead.',
      },
    ],
    productGroups: [
      {
        name: 'AI Community',
        description:
          'Product experiments around Agents, identity, and long-running interaction.',
      },
      {
        name: 'SaaS Multi-Platform Apps',
        description:
          'Mobile entries across H5 and mini programs for lightweight business reach.',
      },
      {
        name: 'Browser and Editor Extensions',
        description:
          'Workflow-adjacent capabilities placed close to development and everyday work.',
      },
      {
        name: 'Interactive Games',
        description:
          'Small web-playable experiences that keep complete product shape.',
      },
      {
        name: 'Personal Blog',
        description:
          'A place for engineering practice, product thinking, and long-term content.',
      },
    ],
    heroMediaLabels: [
      'Blue Shu',
      'Green Shu',
      'Purple Shu',
      'Red Shu',
      'Yellow Shu',
      'Orange Shu',
    ],
    testimonials: [
      {
        id: 'ops',
        quote:
          'ORZ2 is direct enough that new teammates find the right tool without training.',
        name: 'Lin Qing',
        title: 'Growth Ops Lead',
      },
      {
        id: 'studio',
        quote:
          'It feels light but complete, useful for everyday tasks and custom workflows.',
        name: 'Mia Chen',
        title: 'Studio Founder',
      },
      {
        id: 'dev',
        quote:
          'The information and compliance notes are clear, which saves time for commercial tool sites.',
        name: 'Zhou Yuan',
        title: 'Full-stack Developer',
      },
      {
        id: 'pm',
        quote:
          'The structure is clear and users get started with almost no friction.',
        name: 'Zhang Ming',
        title: 'Product Manager',
      },
      {
        id: 'design',
        quote:
          'The color and motion are restrained, with a strong product feel.',
        name: 'Li Wei',
        title: 'UI Designer',
      },
      {
        id: 'startup',
        quote:
          'Fast launch, complete compliance docs, and almost no integration surprises.',
        name: 'Wang Hao',
        title: 'Startup CTO',
      },
      {
        id: 'freelance',
        quote:
          'A solo studio can have its own tool site without a full engineering team.',
        name: 'Chen Jing',
        title: 'Independent Developer',
      },
      {
        id: 'marketing',
        quote:
          'The built-in compliance module works well for marketing review.',
        name: 'Liu Yang',
        title: 'Marketing Director',
      },
    ],
    teamMemberProfiles: [
      [
        'Shu Xiaolan',
        'Project Manager',
        'Keeps project rhythm, requirement breakdown, and delivery quality steady from idea to launch.',
      ],
      [
        'Shu Xiaolv',
        'Full-stack Developer',
        'Connects frontend, backend, and deployment while caring about performance and maintainability.',
      ],
      [
        'Shu Xiaozi',
        'Product Manager',
        'Translates user scenes into clear features and balances business goals, experience, and cost.',
      ],
      [
        'Shu Xiaohong',
        'UI Designer',
        'Builds a consistent interface language that feels professional, usable, and memorable.',
      ],
      [
        'Shu Xiaohuang',
        'Finance',
        'Tracks cost, revenue, and commercial metrics for healthy long-term operation.',
      ],
      [
        'Shu Xiaocheng',
        'HR',
        'Supports collaboration, growth, and team culture so people can work in the right place.',
      ],
    ],
  } satisfies CatalogLocaleCatalog,
} as const;
