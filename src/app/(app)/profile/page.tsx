'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { memory } from '@/lib/memory';
import { Card as PreviewCard, CardContent as PreviewCardContent } from '@/components/ui/card';

export default function ProfilePage() {
  const [name, setName] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [bio, setBio] = React.useState('');
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Personal Profile" description="Your contact details and preferences." />
      <PreviewCard>
        <PreviewCardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Live Preview</div>
            <div className="text-lg font-medium">{name || 'Your Name'}</div>
            <div className="text-sm">{title || 'Job title'}</div>
            <div className="text-xs text-muted-foreground mt-1">{bio || 'Short bio'}</div>
          </div>
          <Button variant="outline" onClick={() => memory.rememberUserProfile({ name, title, bio })}>Save</Button>
        </PreviewCardContent>
      </PreviewCard>
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Job title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Input id="bio" placeholder="Short bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Button onClick={() => memory.rememberUserProfile({ name, title, bio })}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

