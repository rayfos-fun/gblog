import { defineCollection, z } from 'astro:content';

const postCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
  }),
});

const gameCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string().optional(),
    bgmSrc: z.string().optional(),
  }).catchall(z.any()),
});

export const collections = {
  'game': gameCollection,
  'post': postCollection,
};