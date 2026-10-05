export type PageMetadata =
  | {
      kind: "website";
      title: string;
      description: string;
      image?: string;
      noindex?: boolean;
    }
  | {
      kind: "article";
      title: string;
      description: string;
      image: string;
      publishedAt: Date;
      updatedAt?: Date;
    };
