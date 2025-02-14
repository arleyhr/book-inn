import { KeyboardEvent } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '../common/button'
import { Textarea } from '../common/textarea'
import { Form, FormField, FormItem, FormMessage } from '../common/form'

interface MessageInputProps {
  form: UseFormReturn<{ message: string }>
  onSubmit: () => void
  isSending: boolean
}

export function MessageInput({ form, onSubmit, isSending }: MessageInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="mt-4 pt-4 border-t dark:border-gray-700">
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex gap-4 h-[80px]">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="flex-1">
                <Textarea
                  {...field}
                  placeholder="Type your message..."
                  className="resize-none bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-full focus:ring-1 focus:ring-violet-500 dark:text-gray-100 dark:placeholder-gray-400"
                  onKeyDown={handleKeyDown}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={!form.formState.isValid || isSending}
            className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-800 text-white px-8 transition-colors disabled:dark:bg-gray-700 h-full"
          >
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
