const matter = require('gray-matter');

// Test markdown content with author info
const content = `---
title: Test Article
description: Testing author metadata
pubDate: 2023-10-30
author:
  name: Anthon Fynn-Williams
  image: /images/anthon.jpg
tags: [test]
---

# Test Article

This is a test article with author metadata.`;

// Parse with gray-matter
const { data, content: markdownContent } = matter(content);

console.log("Parsed frontmatter:", JSON.stringify(data, null, 2));
console.log("Author information:", JSON.stringify(data.author, null, 2));

// Test if properly extracting author
if (data.author && typeof data.author === 'object') {
  console.log("Author name:", data.author.name);
  console.log("Author image:", data.author.image);
} else {
  console.log("Author is not correctly formatted:", data.author);
} 