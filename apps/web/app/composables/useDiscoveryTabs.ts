export function useDiscoveryTabs() {
  const exploreTabs = [
    { label: 'For you', to: '/explore' },
    { label: 'News', to: '/explore/news' },
    { label: 'Tags', to: '/explore/tags' },
    { label: 'People', to: '/explore/people' },
  ] as const;

  return { exploreTabs };
}
