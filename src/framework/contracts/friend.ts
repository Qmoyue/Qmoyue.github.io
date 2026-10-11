export interface FriendLink {
  name: string;
  url: `https://${string}`;
  avatar?: `https://${string}` | `/images/${string}`;
  signature?: string;
  unavailable?: boolean;
}
