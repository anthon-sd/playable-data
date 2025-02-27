import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl && supabaseAnonKey && 
                           !supabaseUrl.includes('[your-project-id]') && 
                           !supabaseAnonKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');

// Create a dummy client for development if no valid credentials
export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDummyClient();

// Create a dummy client that returns mock data for development
function createDummyClient() {
  console.log('Using dummy Supabase client for development. Set valid PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY environment variables for production use.');
  
  // Mock data for articles
  const mockArticles = [
    {
      id: '1',
      title: 'Cloud Migration Best Practices for Enterprise Systems',
      slug: 'cloud-migration-best-practices',
      description: 'Learn the essential best practices for successfully migrating enterprise systems to the cloud while minimizing disruption and maximizing ROI.',
      status: 'published',
      author_name: 'Michael Chen',
      created_at: '2025-02-10T00:00:00.000Z',
      updated_at: '2025-02-10T00:00:00.000Z',
      cover_image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
      tags: ['cloud', 'migration', 'enterprise', 'infrastructure'],
      content: '# Cloud Migration Best Practices for Enterprise Systems\n\nCloud migration represents one of the most significant technological shifts for enterprise organizations...'
    },
    {
      id: '2',
      title: 'Cybersecurity Best Practices for B2B Companies in 2025',
      slug: 'cybersecurity-best-practices',
      description: 'Protect your business with these essential cybersecurity strategies and practices.',
      status: 'published',
      author_name: 'Michael Johnson',
      created_at: '2025-02-10T00:00:00.000Z',
      updated_at: '2025-02-10T00:00:00.000Z',
      cover_image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      tags: ['cybersecurity', 'security', 'data-protection', 'compliance', 'risk-management'],
      featured: true,
      content: '# Cybersecurity Best Practices for B2B Companies\n\nIn today\'s interconnected business environment, cybersecurity is no longer just an IT concern...'
    },
    {
      id: '3',
      title: 'Digital Transformation Strategies for B2B Companies in 2025',
      slug: 'digital-transformation-strategies',
      description: 'Explore effective digital transformation strategies that B2B companies can implement to stay competitive in the rapidly evolving technological landscape.',
      status: 'published',
      author_name: 'Sarah Johnson',
      created_at: '2025-01-15T00:00:00.000Z',
      updated_at: '2025-01-15T00:00:00.000Z',
      cover_image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
      tags: ['digital transformation', 'b2b', 'technology', 'strategy'],
      featured: true,
      content: '# Digital Transformation Strategies for B2B Companies in 2025\n\nDigital transformation is no longer optional for B2B companies...'
    }
  ];
  
  return {
    auth: {
      signInWithPassword: () => Promise.resolve({ 
        data: { 
          session: { 
            user: { 
              email: 'admin@example.com', 
              id: '123', 
              user_metadata: { full_name: 'Admin User' } 
            } 
          } 
        }, 
        error: null 
      }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null } }),
      getUser: () => Promise.resolve({ data: { user: null } }),
    },
    from: (tableName) => {
      // Handle different table queries
      if (tableName === 'articles') {
        return {
          select: (columns) => {
            return {
              eq: (column, value) => {
                const filteredArticles = mockArticles.filter(article => 
                  article[column] === value || article.slug === value
                );
                
                return {
                  single: () => Promise.resolve({ 
                    data: filteredArticles[0] || null, 
                    error: null 
                  }),
                  order: () => Promise.resolve({ 
                    data: filteredArticles, 
                    error: null 
                  }),
                };
              },
              order: (column, { ascending }) => Promise.resolve({ 
                data: [...mockArticles].sort((a, b) => {
                  if (ascending) {
                    return new Date(a[column]).getTime() - new Date(b[column]).getTime();
                  } else {
                    return new Date(b[column]).getTime() - new Date(a[column]).getTime();
                  }
                }), 
                error: null 
              }),
            };
          },
          insert: (newArticles) => {
            return {
              select: () => Promise.resolve({ 
                data: newArticles.map(article => ({
                  ...article,
                  id: Math.random().toString(36).substring(2, 15)
                })), 
                error: null 
              }),
            };
          },
          update: (updates) => {
            return {
              eq: (column, value) => {
                return {
                  select: () => {
                    const articleIndex = mockArticles.findIndex(article => 
                      article[column] === value || article.slug === value
                    );
                    
                    if (articleIndex !== -1) {
                      mockArticles[articleIndex] = {
                        ...mockArticles[articleIndex],
                        ...updates,
                        updated_at: new Date().toISOString()
                      };
                    }
                    
                    return Promise.resolve({ 
                      data: articleIndex !== -1 ? [mockArticles[articleIndex]] : [], 
                      error: null 
                    });
                  },
                };
              },
            };
          },
          delete: () => {
            return {
              eq: (column, value) => {
                const articleIndex = mockArticles.findIndex(article => 
                  article[column] === value || article.slug === value
                );
                
                if (articleIndex !== -1) {
                  mockArticles.splice(articleIndex, 1);
                }
                
                return Promise.resolve({ error: null });
              },
            };
          },
        };
      }
      
      // Default handler for other tables
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            order: () => Promise.resolve({ data: [], error: null }),
          }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        insert: () => ({
          select: () => Promise.resolve({ data: [{}], error: null }),
        }),
        update: () => ({
          eq: () => ({
            select: () => Promise.resolve({ data: [{}], error: null }),
          }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      };
    },
    storage: {
      listBuckets: () => Promise.resolve({ data: [], error: null }),
      createBucket: () => Promise.resolve({ data: {}, error: null }),
      from: () => ({
        list: () => Promise.resolve({ 
          data: [
            { name: 'sample-image-1.jpg', id: '1', created_at: new Date().toISOString() },
            { name: 'sample-image-2.jpg', id: '2', created_at: new Date().toISOString() },
            { name: 'sample-image-3.jpg', id: '3', created_at: new Date().toISOString() }
          ], 
          error: null 
        }),
        upload: () => Promise.resolve({ data: {}, error: null }),
        download: () => Promise.resolve({ 
          data: new Blob(['# Mock content'], { type: 'text/markdown' }), 
          error: null 
        }),
        getPublicUrl: () => Promise.resolve({ 
          data: { publicUrl: 'https://placehold.co/600x400?text=Mock+Image' }, 
          error: null 
        }),
        createSignedUrl: () => Promise.resolve({ 
          data: { signedUrl: 'https://placehold.co/600x400?text=Mock+Image' }, 
          error: null 
        }),
        remove: () => Promise.resolve({ data: {}, error: null }),
      }),
    }
  };
}