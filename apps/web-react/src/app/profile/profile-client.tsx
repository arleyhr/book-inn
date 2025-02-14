'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/common/card';
import { useAuthStore } from '../../store/auth';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export function ProfileClient() {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not available';

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-48 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10">
        <div className="absolute inset-x-0 bottom-0">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="flex items-center gap-6 py-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-3xl font-semibold text-primary-foreground ring-4 ring-background">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div>
                <h1 className="text-4xl font-bold">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-lg text-muted-foreground capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <EnvelopeIcon className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Email
                    </dt>
                    <dd className="text-sm font-medium">{user.email}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Member Since
                    </dt>
                    <dd className="text-sm">{joinDate}</dd>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Account Type
                    </dt>
                    <dd className="text-sm capitalize">{user.role}</dd>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
