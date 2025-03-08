import { defineCollection, z } from 'astro:content';

// Define a schema for blog posts
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    coverImage: z.string().optional(),
    author: z.object({
      name: z.string(),
      image: z.string().optional(),
    }).optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional().default(false),
  }),
});

// Define a schema for authors
const authors = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    title: z.string(),
    bio: z.string(),
    avatar: z.string(),
    social: z.object({
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      github: z.string().optional(),
      website: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { blog, authors };