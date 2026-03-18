// Account* — compact inline representations (used in lists, statuses, search, etc.)
export { default as AccountCard } from './AccountCard.vue';
export { default as AccountCarousel } from './AccountCarousel.vue';
export { default as AccountDisplayName } from './AccountDisplayName.vue';
export { default as AccountHandle } from './AccountHandle.vue';
export { default as AccountList } from './AccountList.vue';
export { default as AccountListItem } from './AccountListItem.vue';

// Standalone — context-independent
export { default as CurrentUserCard } from './CurrentUserCard.vue';
export { default as FollowButton } from './FollowButton.vue';
// Profile* — full page-level representations (used on profile pages)
export { default as ProfileActions } from './ProfileActions.vue';

export { default as ProfileHeader } from './ProfileHeader.vue';
export { default as ProfileInformation } from './ProfileInformation.vue';
export { default as UserSuggestions } from './UserSuggestions.vue';
export type { UserSuggestion } from './UserSuggestions.vue';
