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
    | 'filter';

export interface NavMenuItem {
  id: string;
  label: string;
  icon: string;
  to: string;
}

export interface NavUser {
  name: string;
  username: string;
  acct: string;
  avatar: string;
}
