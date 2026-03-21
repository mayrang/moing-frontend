'use client'
import { getHomeUserProfile } from '@/entities/trip'
import { useQuery } from '@tanstack/react-query'

export const useUserProfile = (accessToken: string) => {
  const data = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => {
      return getHomeUserProfile(accessToken)
    }
  })
  return data
}
