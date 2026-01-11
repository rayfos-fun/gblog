import { defineCollection, z } from 'astro:content';

const postCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    author: z.string().default('Rayfos'),
    tags: z.array(z.string()),
    canonicalId: z.string().optional(), 
  }),
});

export const collections = {
  'post': postCollection,
};