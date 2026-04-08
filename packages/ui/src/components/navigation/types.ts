export type NavIconName
  = | 'home'
    | 'search'
    | 'explore'
    | 'new-post'
    | 'notifications'
    | 'profile'
    | 'chat'
    | 'messages'
    | 'favourites'
    | 'saved'
    | 'bookmarks'
    | 'settings'
    | 'menu'
    | 'close'
    | 'back'
    | 'more'
    | 'compose'
    | 'share'
    | 'filter'
    | 'feedback';

export interface NavMenuItem {
  id: string;
  label: string;
  icon: NavIconName;
  to: string;
}

export interface NavUser {
  name: string;
  username: string;
  acct: string;
  avatar: string;
}
