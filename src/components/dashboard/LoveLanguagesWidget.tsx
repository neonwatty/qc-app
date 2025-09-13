'use client'

import React from 'react'
import { useLoveLanguages } from '@/contexts/LoveLanguagesContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Heart, Plus, CheckCircle2, Sparkles, Calendar } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export function LoveLanguagesWidget() {
  const { languages, actions, partnerLanguages } = useLoveLanguages()
  
  const todayActions = actions.filter(a => 
    a.status === 'planned' || a.status === 'recurring'
  ).slice(0, 2)
  
  const completedThisWeek = actions.filter(a => {
    if (a.status !== 'completed' || !a.lastCompletedAt) return false
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(a.lastCompletedAt) > weekAgo
  }).length
  
  const sharedLanguages = languages.filter(l => l.privacy === 'shared').length
  const totalLanguages = languages.length

  return (
    <Card className="bg-white hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Love Languages
            </CardTitle>
            <CardDescription className="text-gray-700">Express love in meaningful ways</CardDescription>
          </div>
          <Link href="/love-languages">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-red-500">{totalLanguages}</p>
            <p className="text-xs text-gray-600">Languages</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-pink-500">{sharedLanguages}</p>
            <p className="text-xs text-gray-600">Shared</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-500">{completedThisWeek}</p>
            <p className="text-xs text-gray-600">This Week</p>
          </div>
        </div>

        {/* Progress Bar */}
        {totalLanguages > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Sharing Progress</span>
              <span className="font-medium text-gray-900">{Math.round((sharedLanguages / totalLanguages) * 100)}%</span>
            </div>
            <Progress value={(sharedLanguages / totalLanguages) * 100} className="h-2" />
          </div>
        )}

        {/* Today's Actions */}
        {todayActions.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Today's Actions
            </h4>
            {todayActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{action.title}</p>
                  <p className="text-xs text-gray-600 truncate">
                    {action.linkedLanguageTitle}
                  </p>
                </div>
                <Link href="/love-languages/actions">
                  <Button size="sm" variant="ghost">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-700 mb-2">No actions planned for today</p>
            <Link href="/love-languages/actions">
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Action
              </Button>
            </Link>
          </div>
        )}

        {/* Partner Languages Preview */}
        {partnerLanguages.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-600 mb-2">Partner's Top Language:</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs text-gray-700">
                {partnerLanguages[0].category}
              </Badge>
              <span className="text-sm text-gray-900 truncate">{partnerLanguages[0].title}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}