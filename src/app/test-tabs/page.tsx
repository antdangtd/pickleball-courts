// src/app/test-tabs/page.tsx
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TabsTest() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Tabs Test Page</h1>
      
      <Tabs defaultValue="tab1" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="p-4 border rounded-md mt-2">
          <h3 className="text-lg font-medium">Tab 1 Content</h3>
          <p>This is the content for tab 1.</p>
        </TabsContent>
        <TabsContent value="tab2" className="p-4 border rounded-md mt-2">
          <h3 className="text-lg font-medium">Tab 2 Content</h3>
          <p>This is the content for tab 2.</p>
        </TabsContent>
        <TabsContent value="tab3" className="p-4 border rounded-md mt-2">
          <h3 className="text-lg font-medium">Tab 3 Content</h3>
          <p>This is the content for tab 3.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}