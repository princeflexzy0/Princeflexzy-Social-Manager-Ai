'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Blog } from '@/types';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Trash, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatDateSafe } from '@/lib/utils';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[] | Record<string, Blog>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const data = await apiFetch<Blog[] | Record<string, Blog>>('/admin/blog');
      setBlogs(data);
    } catch (error) {
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishAll = async () => {
    if (!confirm('Publish all pending blogs?')) return;
    try {
      const result = await apiFetch<{ published: number }>('/admin/blog/publish-now', {
        method: 'POST',
      });
      toast.success(`${result.published} blogs published`);
      fetchBlogs();
    } catch (error) {
      toast.error('Failed to publish blogs');
    }
  };

  const columns = [
    {
      header: 'Title',
      accessor: (row: Blog) => (
        <div className="max-w-md font-medium">{row.title || 'Untitled'}</div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Blog) => (
        <Badge variant={row.published ? 'default' : 'secondary'}>
          {row.published ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      header: 'Tags',
      accessor: (row: Blog) => {
        const tags = Array.isArray(row.tags) ? row.tags : [];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      header: 'Created',
        accessor: (row: Blog) => formatDateSafe(row.created_at, 'MMM d, yyyy', 'Invalid date'),
    },
    {
      header: 'Published',
        accessor: (row: Blog) => (row.published_at ? formatDateSafe(row.published_at, 'MMM d, yyyy', 'Invalid date') : 'N/A'),
    },
  ];

  // Defensive: ensure blogs is an array
  const blogsArray = Array.isArray(blogs)
    ? blogs
    : blogs && typeof blogs === 'object'
    ? Object.values(blogs)
    : [];

  // Add blog modal state
  const [genSubmitting, setGenSubmitting] = useState(false);
  // Edit dialog state
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const openEdit = (b: Blog) => setEditingBlog(b);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog? This action cannot be undone.')) return;
    try {
      await apiFetch(`/admin/blog/${id}`, { method: 'DELETE' });
      toast.success('Blog deleted');
      fetchBlogs();
    } catch (err) {
      toast.error('Failed to delete blog');
    }
  };

  const handleEditSubmit = async (e: any) => {
    e.preventDefault();
    if (!editingBlog) return;
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const payload: any = {
      title: String(fd.get('title') || '') || null,
      slug: String(fd.get('slug') || '') || null,
      tags: String(fd.get('tags') || '')
        ? String(fd.get('tags')).split(',').map((s) => s.trim())
        : [],
      image_urls: String(fd.get('image_urls') || '')
        ? String(fd.get('image_urls')).split(',').map((s) => s.trim())
        : [],
      image_prompts: String(fd.get('image_prompts') || '')
        ? String(fd.get('image_prompts')).split(',').map((s) => s.trim())
        : [],
      content_html: String(fd.get('content_html') || '') || null,
      content_markdown: String(fd.get('content_markdown') || '') || null,
      published: String(fd.get('published')) === 'true',
    };
    try {
      setEditSubmitting(true);
      await apiFetch(`/admin/blog/${editingBlog.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      toast.success('Blog updated');
      setEditingBlog(null);
      fetchBlogs();
    } catch (err) {
      toast.error('Failed to update blog');
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blogs</h1>
          <p className="text-gray-600 mt-1">Manage blog posts and content</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePublishAll}>
            <Send className="h-4 w-4 mr-2" />
            Publish All Pending
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Generate Blog</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Generate Blog</DialogTitle>
              </DialogHeader>
              <form
                id="generate-blog-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget as HTMLFormElement;
                  const fd = new FormData(form);
                  const payload: any = {
                    title: String(fd.get('title') || '') || null,
                    slug: String(fd.get('slug') || '') || null,
                    tags: String(fd.get('tags') || '')
                      ? String(fd.get('tags')).split(',').map((s) => s.trim())
                      : [],
                    image_urls: String(fd.get('image_urls') || '')
                      ? String(fd.get('image_urls')).split(',').map((s) => s.trim())
                      : [],
                    image_prompts: String(fd.get('image_prompts') || '')
                      ? String(fd.get('image_prompts')).split(',').map((s) => s.trim())
                      : [],
                    content_html: String(fd.get('content_html') || '') || null,
                    content_markdown: String(fd.get('content_markdown') || '') || null,
                    published: String(fd.get('published')) === 'true',
                    
                  };
                  try {
                    setGenSubmitting(true);
                    await apiFetch('/admin/blog', {
                      method: 'POST',
                      body: JSON.stringify(payload),
                    });
                    toast.success('Blog generated/added');
                    fetchBlogs();
                  } catch (err) {
                    toast.error('Failed to generate blog');
                  } finally {
                    setGenSubmitting(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <Label>Title</Label>
                  <Input name="title" required />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input name="slug" required />
                </div>
                <div>
                  <Label>Tags (comma separated)</Label>
                  <Input name="tags" placeholder="technology,programming" />
                </div>
                <div>
                  <Label>Image URLs (comma separated)</Label>
                  <Input name="image_urls" placeholder="https://img1,https://img2" />
                </div>
                <div>
                  <Label>Image Prompts (comma separated)</Label>
                  <Input name="image_prompts" placeholder="prompt1,prompt2" />
                </div>
                <div>
                  <Label>Content (HTML)</Label>
                  <Textarea name="content_html" rows={3} />
                </div>
                <div>
                  <Label>Content (Markdown)</Label>
                  <Textarea name="content_markdown" rows={3} />
                </div>
                <div>
                  <Label>Published</Label>
                  <select name="published" className="w-full border rounded px-2 py-1">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <DialogClose asChild>
                    <button type="button" className="btn-outline">
                      Cancel
                    </button>
                  </DialogClose>
                  <Button type="submit" disabled={genSubmitting}>
                    {genSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
         
        </div>
      </div>
      

      <Card>
        <CardHeader>
          <CardTitle>All Blogs ({blogsArray.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading blogs...</div>
          ) : (
            <DataTable
              data={blogsArray}
              columns={columns}
              actions={(row: Blog) => (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingBlog(row)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button   className="bg-red-600 hover:bg-red-700 text-white"
                     size="sm" onClick={() => {
                    if (row.id) handleDelete(row.id);
                  }}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>
      {/* Edit Dialog */}
      <Dialog open={!!editingBlog} onOpenChange={(open) => { if (!open) setEditingBlog(null); }}>
        <DialogContent className="max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog</DialogTitle>
          </DialogHeader>
          {editingBlog && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input name="title" defaultValue={editingBlog.title || ''} required />
              </div>
              <div>
                <Label>Slug</Label>
                <Input name="slug" defaultValue={editingBlog.slug || ''} required />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input name="tags" defaultValue={(editingBlog.tags || []).join(',')} />
              </div>
              <div>
                <Label>Image URLs (comma separated)</Label>
                <Input name="image_urls" defaultValue={(editingBlog.image_urls || []).join(',')} />
              </div>
              <div>
                <Label>Image Prompts (comma separated)</Label>
                <Input name="image_prompts" defaultValue={(editingBlog.image_prompts || []).join(',')} />
              </div>
              <div>
                <Label>Content (HTML)</Label>
                <Textarea name="content_html" rows={3} defaultValue={editingBlog.content_html || ''} />
              </div>
              <div>
                <Label>Content (Markdown)</Label>
                <Textarea name="content_markdown" rows={3} defaultValue={editingBlog.content_markdown || ''} />
              </div>
              <div>
                <Label>Published</Label>
                <select name="published" className="w-full border rounded px-2 py-1" defaultValue={editingBlog.published ? 'true' : 'false'}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <DialogClose asChild>
                  <button type="button" className="btn-outline">Cancel</button>
                </DialogClose>
                <Button type="submit" disabled={editSubmitting}>{editSubmitting ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
