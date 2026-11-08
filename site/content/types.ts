// Shape of the landing copy. Both site/content/id.ts and site/content/en.ts
// satisfy this type, so a missing key or a missing FAQ answer fails typecheck.

export type IconName =
  | 'shield'
  | 'search-off'
  | 'clock'
  | 'lock'
  | 'filter'
  | 'history'
  | 'refresh'
  | 'remote'
  | 'check'
  | 'cross'
  | 'play'
  | 'download'
  | 'github'
  | 'arrow'
  | 'chevron'
  | 'menu'
  | 'close'
  | 'pin'
  | 'spark';

export type Feature = {
  icon: IconName;
  title: string;
  body: string;
};

export type Point = {
  title: string;
  body: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type LandingContent = {
  lang: 'id' | 'en';
  htmlLang: 'id' | 'en';
  switchLabel: string;
  switchName: string;
  skip: string;

  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };

  nav: {
    label: string;
    features: string;
    how: string;
    catalog: string;
    install: string;
    faq: string;
    source: string;
    download: string;
    menu: string;
    close: string;
  };

  hero: {
    eyebrow: string;
    titleHtml: string;
    lead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    note: string;
    stats: { channels: string; videos: string; updated: string };
    tv: {
      all: string;
      label: string;
      timerLabel: string;
      timer: string;
      lockKicker: string;
      lockTitle: string;
      lockBody: string;
      pinLabel: string;
    };
  };

  compare: {
    eyebrow: string;
    title: string;
    lead: string;
    badTitle: string;
    badItems: string[];
    goodTitle: string;
    goodItems: string[];
    footnote: string;
  };

  features: {
    eyebrow: string;
    title: string;
    lead: string;
    items: Feature[];
  };

  parents: {
    eyebrow: string;
    title: string;
    lead: string;
    bullets: Point[];
    screens: {
      timer: string;
      channels: string;
      history: string;
    };
    mock: {
      watchTitle: string;
      watchSubtitle: string;
      watchEnds: string;
      watchFinish: string;
      watchStart: string;
      channelsTitle: string;
      channelsSubtitle: string;
      on: string;
      off: string;
      historyTitle: string;
      historyDay: string;
      historyYesterday: string;
      historyTotal: string;
    };
  };

  steps: {
    eyebrow: string;
    title: string;
    lead: string;
    items: Point[];
  };

  catalog: {
    eyebrow: string;
    title: string;
    lead: string;
    channelLabel: string;
    videoLabel: string;
    updatedLabel: string;
    autoNote: string;
    jsonLink: string;
    versionLabel: string;
    indexTitle: string;
    indexLead: string;
    indexBack: string;
  };

  install: {
    eyebrow: string;
    title: string;
    lead: string;
    cta: string;
    ctaNote: string;
    steps: Point[];
    buildTitle: string;
    buildBody: string;
    buildLink: string;
    androidNote: string;
  };

  faq: {
    eyebrow: string;
    title: string;
    items: FaqItem[];
  };

  footer: {
    tagline: string;
    productTitle: string;
    sourceTitle: string;
    catalogTitle: string;
    links: {
      features: string;
      how: string;
      install: string;
      github: string;
      releases: string;
      readme: string;
      catalogIndex: string;
      catalogStatus: string;
    };
    disclaimer: string;
    madeWith: string;
    langTitle: string;
  };

  notFound: {
    title: string;
    body: string;
    back: string;
  };
};
