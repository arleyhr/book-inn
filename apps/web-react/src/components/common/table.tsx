import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, forwardRef } from 'react'

interface TableProps extends HTMLAttributes<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className = '', ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={`w-full caption-bottom text-sm ${className}`}
        {...props}
      />
    </div>
  )
)

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className = '', ...props }, ref) => (
    <thead ref={ref} className={`bg-gray-50 dark:bg-gray-800 ${className}`} {...props} />
  )
)

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className = '', ...props }, ref) => (
    <tbody
      ref={ref}
      className={`divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 ${className}`}
      {...props}
    />
  )
)

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className = '', ...props }, ref) => (
    <tr
      ref={ref}
      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${className}`}
      {...props}
    />
  )
)

interface TableHeadProps extends ThHTMLAttributes<HTMLTableHeaderCellElement> {}

export const TableHead = forwardRef<HTMLTableHeaderCellElement, TableHeadProps>(
  ({ className = '', ...props }, ref) => (
    <th
      ref={ref}
      className={`h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400 [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    />
  )
)

interface TableCellProps extends TdHTMLAttributes<HTMLTableDataCellElement> {}

export const TableCell = forwardRef<HTMLTableDataCellElement, TableCellProps>(
  ({ className = '', ...props }, ref) => (
    <td
      ref={ref}
      className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    />
  )
)

Table.displayName = 'Table'
TableHeader.displayName = 'TableHeader'
TableBody.displayName = 'TableBody'
TableRow.displayName = 'TableRow'
TableHead.displayName = 'TableHead'
TableCell.displayName = 'TableCell'
