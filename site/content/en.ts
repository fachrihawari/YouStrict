import type { LandingContent } from './types';

const content = {
  lang: 'en',
  htmlLang: 'en',
  switchLabel: 'ID',
  switchName: 'Bahasa Indonesia',
  skip: 'Skip to content',

  meta: {
    title: 'YouStrict — YouTube for kids, without the algorithm',
    description:
      'Only videos from channels you approve, for as long as you allow. No search, no recommendations, no endless autoplay.',
    ogTitle: 'YouTube for kids, without the algorithm.',
    ogDescription: 'Parent-picked channels, a time limit, and a PIN lock. For Android TV, phones, and tablets.',
  },

  nav: {
    label: 'Main navigation',
    features: 'Features',
    how: 'How it works',
    catalog: 'Catalog',
    install: 'Install',
    faq: 'FAQ',
    source: 'GitHub',
    download: 'Download',
    menu: 'Open menu',
    close: 'Close menu',
  },

  hero: {
    eyebrow: 'Android TV · Phone · Tablet',
    titleHtml: 'YouTube for kids,<br><em>without the algorithm.</em>',
    lead: 'Only videos from channels you approve, for as long as you allow. No search, no recommendations, and no endless scroll.',
    ctaPrimary: 'Download APK',
    ctaSecondary: 'See the source',
    note: 'Free · No account · Data stays on the device',
    stats: {
      channels: 'channels',
      videos: 'videos',
      updated: 'updated',
    },
    tv: {
      all: 'All',
      label: 'Living room TV',
      timerLabel: 'Time left',
      timer: '12:34',
      lockKicker: 'Session over',
      lockTitle: "Time's up",
      lockBody: 'Enter the PIN to continue.',
      pinLabel: 'PIN',
    },
  },

  compare: {
    eyebrow: 'The problem',
    title: 'YouTube is built to keep you watching. YouStrict is built to stop.',
    lead: "It's not about bad content. It's about an engine that keeps offering the next video.",
    badTitle: 'Regular YouTube',
    badItems: [
      'One video ends, autoplay takes over.',
      'Recommendations lead to videos you never picked.',
      'Search can open anything.',
      'No time limit, unless you are the one to stop it.',
    ],
    goodTitle: 'With YouStrict',
    goodItems: [
      'Only channels you have approved.',
      'No search, no recommendations, no links out.',
      'A timer runs, with warnings at 5 and 1 minute.',
      "When time's up, the screen locks with a PIN.",
    ],
    footnote: "The session ends. Your child knows what to expect, and you don't have to argue.",
  },

  features: {
    eyebrow: 'Features',
    title: 'Full control, without the fuss.',
    lead: 'Everything lives in a parent area protected by a PIN.',
    items: [
      {
        icon: 'shield',
        title: 'You choose the channels',
        body: 'Only channels you approve show up. New channels stay off until you turn them on.',
      },
      {
        icon: 'search-off',
        title: 'No search',
        body: 'No search box, no recommendations, and no links out to YouTube.',
      },
      {
        icon: 'clock',
        title: 'A limit from 5 to 180 minutes',
        body: 'Pick a length, see when the session ends, and let the timer do the work.',
      },
      {
        icon: 'lock',
        title: 'PIN lock',
        body: "When time is up, the app locks. Leaving a session also needs the PIN.",
      },
      {
        icon: 'filter',
        title: 'Video filters',
        body: 'Hide videos with blocked words, or videos that run too long.',
      },
      {
        icon: 'history',
        title: '30 days of history',
        body: 'See what was watched, then hide a video or turn off a channel right from the history.',
      },
      {
        icon: 'refresh',
        title: 'Daily sync',
        body: 'The catalog refreshes automatically. The list is cached on the device, so it still works offline.',
      },
      {
        icon: 'remote',
        title: 'Remote friendly',
        body: 'Every button works with a D-pad. No mouse, no touch needed.',
      },
    ],
  },

  parents: {
    eyebrow: 'Parent area',
    title: 'One place for every setting.',
    lead: 'Protected by a PIN. Your child will not get here.',
    bullets: [
      {
        title: 'Set the time',
        body: 'Five to 180 minutes, plus an option to finish the last video (up to 10 extra minutes).',
      },
      {
        title: 'Pick the channels',
        body: 'Turn channels on or off. See how many videos each one has and hide the ones that do not fit.',
      },
      {
        title: 'Check the history',
        body: 'A 30-day summary of what was watched, grouped by day.',
      },
    ],
    screens: {
      timer: 'Time settings screen in the parent area',
      channels: 'Channel list with on and off switches',
      history: 'Watch history for the last 30 days',
    },
    mock: {
      watchTitle: 'Watch time',
      watchSubtitle: 'How long can your child watch?',
      watchEnds: 'Ends at 19:30',
      watchFinish: 'Let the last video finish',
      watchStart: 'Start watching',
      channelsTitle: 'Channels',
      channelsSubtitle: '{on} of {total} turned on',
      on: 'On',
      off: 'Off',
      historyTitle: 'History',
      historyDay: 'Today',
      historyYesterday: 'Yesterday',
      historyTotal: '42 min watched',
    },
  },

  steps: {
    eyebrow: 'How it works',
    title: 'Set it up once, then just watch.',
    lead: 'No subscription, no account, and no server of ours.',
    items: [
      { title: 'Install', body: 'Download the APK and install it on an Android TV, phone, or tablet.' },
      { title: 'Pick channels', body: 'Open the parent area with the PIN and turn on the channels that are allowed.' },
      { title: 'Set the time', body: 'Choose a session length and start. The timer begins right away.' },
      { title: "Time's up", body: 'The screen locks. Enter the PIN for the next session.' },
    ],
  },

  catalog: {
    eyebrow: 'Catalog',
    title: 'Curated channels, not all of YouTube.',
    lead: 'The catalog is rebuilt every day from a curated channel list. The numbers below are baked in when this page is published.',
    channelLabel: 'channels',
    videoLabel: 'videos',
    updatedLabel: 'Updated',
    autoNote: 'Every day at 03:00 WIB (UTC+7).',
    jsonLink: 'View the raw data (JSON)',
    versionLabel: 'Catalog version',
    indexTitle: 'YouStrict catalog',
    indexLead: 'The channels and videos the app consumes. This page is for technical reference.',
    indexBack: 'Back to the landing page',
  },

  install: {
    eyebrow: 'Install',
    title: 'Ready for the living room TV.',
    lead: 'APK builds are published on GitHub Releases. Install on Android TV, a phone, or a tablet.',
    cta: 'Download the latest APK',
    ctaNote: 'Always the newest build from the Releases page.',
    steps: [
      { title: 'Download the APK', body: 'Open the Releases page and download the latest .apk file.' },
      { title: 'Allow the install', body: 'On the TV, enable “Install unknown apps” for the file manager or browser you use.' },
      { title: 'Install and open', body: 'Open YouStrict, create a PIN, and pick your first channel.' },
    ],
    buildTitle: 'Prefer to build it yourself?',
    buildBody: 'The repo ships the EAS config. You need Bun, Expo, and the Android SDK; every step is in the README.',
    buildLink: 'Build guide',
    androidNote: 'For Android TV and Android phones or tablets.',
  },

  faq: {
    eyebrow: 'FAQ',
    title: 'Common questions.',
    items: [
      {
        q: 'Is YouStrict free?',
        a: 'Yes. There is no subscription, no account, and no advertising from YouStrict.',
      },
      {
        q: 'Does it need internet?',
        a: 'Yes, to play videos. Channel names and video titles are cached on the device, so the app still opens offline.',
      },
      {
        q: 'Is this official YouTube?',
        a: 'No. YouStrict is not affiliated with YouTube or Google. Videos play through the YouTube player, so viewers still connect to YouTube while watching.',
      },
      {
        q: 'Can my child leave a session?',
        a: 'No. Leaving a session and opening the parent area both require the PIN.',
      },
      {
        q: 'Which devices does it run on?',
        a: 'Android TV, plus Android phones and tablets. The video grid adapts to the screen size.',
      },
      {
        q: 'How do I add a channel?',
        a: 'In the parent area, open Request a channel and scan the QR code to send a request. On this repo, requests are handled by the owner.',
      },
      {
        q: 'Can I use it for my own family?',
        a: 'Yes. The repo is public and can be forked; you will need to manage your own channel list and catalog page.',
      },
      {
        q: 'Why is there no search?',
        a: 'Search hands control back to the algorithm. YouStrict deliberately shows only what you have already chosen.',
      },
    ],
  },

  footer: {
    tagline: 'YouTube for kids, without the algorithm.',
    productTitle: 'Product',
    sourceTitle: 'Source',
    catalogTitle: 'Catalog',
    links: {
      features: 'Features',
      how: 'How it works',
      install: 'Install',
      github: 'Code on GitHub',
      releases: 'APK releases',
      readme: 'Build guide',
      catalogIndex: 'Catalog data',
      catalogStatus: 'Catalog status',
    },
    disclaimer:
      'YouStrict is a personal project. Not affiliated with YouTube or Google. Videos play through the YouTube player.',
    madeWith: 'Built with Expo for Android TV.',
    langTitle: 'Language',
  },

  notFound: {
    title: 'Page not found',
    body: 'The link may have changed, or this page never existed.',
    back: 'Back to the landing page',
  },
} satisfies LandingContent;

export default content;
