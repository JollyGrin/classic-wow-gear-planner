'use client'

import { useRef, useCallback } from 'react'
import { flexRender, type Table as TanTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/app/lib/utils'
import type { Item } from '@/app/lib/types'
import { ArrowUp, ArrowDown } from 'lucide-react'

const ROW_HEIGHT = 40

interface DataTableProps {
  table: TanTable<Item>
}

export function DataTable({ table }: DataTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { rows } = table.getRowModel()

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  })

  const headerGroups = table.getHeaderGroups()
  const leftPinnedColumns = table.getLeftVisibleLeafColumns()
  const rightPinnedColumns = table.getRightVisibleLeafColumns()
  const getColumnPinStyle = useCallback(
    (columnId: string): React.CSSProperties => {
      const isLeftPinned = leftPinnedColumns.some((c) => c.id === columnId)
      const isRightPinned = rightPinnedColumns.some((c) => c.id === columnId)

      if (isLeftPinned) {
        let left = 0
        for (const col of leftPinnedColumns) {
          if (col.id === columnId) break
          left += col.getSize()
        }
        return {
          position: 'sticky',
          left,
          zIndex: 1,
        }
      }

      if (isRightPinned) {
        let right = 0
        const reversed = [...rightPinnedColumns].reverse()
        for (const col of reversed) {
          if (col.id === columnId) break
          right += col.getSize()
        }
        return {
          position: 'sticky',
          right,
          zIndex: 1,
        }
      }

      return {}
    },
    [leftPinnedColumns, rightPinnedColumns]
  )

  const isLastLeftPinned = (columnId: string) =>
    leftPinnedColumns.length > 0 &&
    leftPinnedColumns[leftPinnedColumns.length - 1].id === columnId

  const isFirstRightPinned = (columnId: string) =>
    rightPinnedColumns.length > 0 && rightPinnedColumns[0].id === columnId

  if (rows.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No items found
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="overflow-auto rounded-md border"
      style={{ height: 'calc(100vh - 280px)' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        {headerGroups.map((headerGroup) => (
          <div key={headerGroup.id} className="flex">
            {headerGroup.headers.map((header) => {
              const canSort = header.column.getCanSort()
              const sorted = header.column.getIsSorted()
              const sortIndex = header.column.getSortIndex()
              const pinStyle = getColumnPinStyle(header.column.id)

              return (
                <div
                  key={header.id}
                  className={cn(
                    'flex items-center px-2 text-xs font-medium text-muted-foreground bg-background select-none',
                    canSort && 'cursor-pointer hover:text-foreground',
                    isLastLeftPinned(header.column.id) && 'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]',
                    isFirstRightPinned(header.column.id) && 'shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.15)]'
                  )}
                  style={{
                    width: header.getSize(),
                    minWidth: header.getSize(),
                    height: ROW_HEIGHT,
                    ...pinStyle,
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {sorted && (
                    <span className="ml-1 inline-flex items-center">
                      {sorted === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      {sortIndex > 0 && (
                        <span className="text-[10px] ml-0.5">{sortIndex + 1}</span>
                      )}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Virtual rows */}
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]
          return (
            <div
              key={row.id}
              data-testid="table-row"
              className="absolute flex w-full border-b hover:bg-accent/50 transition-colors"
              style={{
                height: ROW_HEIGHT,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {row.getVisibleCells().map((cell) => {
                const pinStyle = getColumnPinStyle(cell.column.id)
                return (
                  <div
                    key={cell.id}
                    className={cn(
                      'flex items-center px-2 text-sm bg-background',
                      isLastLeftPinned(cell.column.id) && 'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]',
                      isFirstRightPinned(cell.column.id) && 'shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.15)]'
                    )}
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.getSize(),
                      height: ROW_HEIGHT,
                      ...pinStyle,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
