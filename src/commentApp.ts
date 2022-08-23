export interface commentApp {
  currentUser: {
    image: {
      png: string;
      webp: string;
    };
    username: string;
  };
  comments: commentObject[];
}
export interface commentObject {
  id: number;
  content: string;
  createdAt: string;
  score: number;
  user: {
    image: {
      png: string;
      webp: string;
    };
    username: string;
  };
  replies: replyObject[];
}
export interface replyObject {
  id: number;
  content: string;
  createdAt: string;
  score: number;
  replyingTo: string;
  user: {
    image: {
      png: string;
      webp: string;
    };
    username: string;
  };
}
