// Account* — compact inline representations
// Profile* — full page-level representations
export {
  AccountCard,
  AccountCarousel,
  AccountDisplayName,
  AccountHandle,
  AccountList,
  AccountListItem,
  CurrentUserCard,
  FollowButton,
  ProfileActions,
  ProfileHeader,
  ProfileInformation,
} from './components/account';

export type { AccountListUser } from './components/account';

// Chat components
export {
  ChatHeader,
  ChatList,
  ChatListItem,
  MessageBubble,
  MessageInput,
  ShareStatusForm,
} from './components/chat';

// Compose components
export {
  AltTextModal,
  CharacterCounter,
  ComposeTextarea,
  ComposeToolbar,
  ContentWarningToggle,
  CustomEmojiPicker,
  EmojiPickerButton,
  MediaPreviewGrid,
  MediaPreviewItem,
  PollEditor,
  ReplyContext,
  VisibilitySelector,
} from './components/compose';
export type { MediaItem } from './components/compose';

// Feed components
export { NewPostsPill } from './components/feed';

// Feedback components
export { FeedbackModal } from './components/feedback';

// Item components
export { ItemCard, ItemHeader, ItemPage, ItemPageActions, ItemPageHeaderLink, Take } from './components/item';

// Media components
export { GifvPlayer, MediaCarousel, MediaGallery, MediaLightbox, VideoPlayer } from './components/media';

// Navigation components
export {
  AppBar,
  BottomNav,
  BottomNavItem,
  NavDrawer,
  NavDrawerItem,
  NavDrawerProfile,
  NavIcon,
  SideNav,
  SideNavItem,
  SideNavProfile,
  TabBar,
} from './components/navigation';

export type {
  BottomNavItemType,
  NavIconName,
  NavMenuItem,
  NavUser,
  TabItem,
} from './components/navigation';

// Notification components
export { NotificationGroup, NotificationList } from './components/notification';
export type { NotificationGroupType } from './components/notification';

// Status components
export {
  DeletedStatusTombstone,
  isConnectedAbove,
  isConnectedBelow,
  PollDisplay,
  QuickReply,
  shapeFeedStatus,
  shapeFeedThreads,
  shapeThreadContext,
  Status,
  StatusActions,
  StatusCard,
  StatusContent,
  StatusDetailMain,
  StatusMedia,
  StatusQuote,
  StatusReply,
  StatusSkeleton,
  StatusStats,
  StatusTags,
  ThreadAvatarColumn,
  ThreadCollapseNode,
  ThreadSkeleton,
} from './components/status';
export type {
  ShapedThreadItem,
  ThreadContext,
  ThreadPosition,
} from './components/status';

// Timeline components
export { Timeline } from './components/timeline';

// Trending components
export { TagList, TagListItem } from './components/trending';

// UI primitives
export { AnimatedCount, Avatar, AvatarStack, AverageRating, Badge, ButtonAction, ButtonText, Divider, Headline, RelativeTime, RichText, SearchInput, Section } from './components/ui';
export type { AvatarStackItem } from './components/ui';
export type { HeadlineVariants } from './components/ui';
export { Button, buttonVariants } from './components/ui/button';
export type { ButtonVariants } from './components/ui/button';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/ui/card';

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog';

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';

export { EmptyState } from './components/ui/empty-state';
export { FullTimestamp } from './components/ui/full-timestamp';

export { Input } from './components/ui/input';
export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './components/ui/input-group';
export { ListHeader } from './components/ui/list-header';
export { PageHeader } from './components/ui/page-header';
export { RatingInput, RatingStars } from './components/ui/rating';
export { SegmentedControl } from './components/ui/segmented-control';
export { Skeleton } from './components/ui/skeleton';
export { TagItem } from './components/ui/tag-item';
export { Textarea } from './components/ui/textarea';
export { Toast, ToastContainer, useToast } from './components/ui/toast';
export type { ToastType } from './components/ui/toast';
export { Toggle } from './components/ui/toggle';

// Composables
export { useInfiniteScroll } from './composables/useInfiniteScroll';
export { useMediaPreferences } from './composables/useMediaPreferences';
export type { MediaVisibility } from './composables/useMediaPreferences';
export { usePullToRefresh } from './composables/usePullToRefresh';

// Directives
export { vFadeOnLoad } from './directives/fadeOnLoad';
// Utilities
export { cn } from './lib/utils';

export { blurhashStyle, decodeBlurhash, isBlurhashValid } from './utils';
