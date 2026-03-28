import { deleteJson, getJson, postJson } from './apiClient'

export type RoadmapItem = {
  id: number
  text: string
  created_at: string
}

type RoadmapListResponse = {
  items: RoadmapItem[]
}

type RoadmapCreateResponse = RoadmapItem

type RoadmapDeleteResponse = {
  ok: boolean
}

export const fetchRoadmap = async () => {
  const data = await getJson<RoadmapListResponse>('/api/roadmap')
  return data.items
}

export const addRoadmapItem = (text: string) => {
  return postJson<RoadmapCreateResponse>('/api/roadmap', { text })
}

export const deleteRoadmapItem = async (itemId: number) => {
  const data = await deleteJson<RoadmapDeleteResponse>(`/api/roadmap/${itemId}`)
  return data.ok
}
