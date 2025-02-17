import { Metadata } from 'next'
import { ProfileClient } from './profile-client'

export const metadata: Metadata = {
  title: 'Profile | Book Inn',
  description: 'View your profile information and account details',
}

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background pt-20">
      <ProfileClient />
    </main>
  )
}
