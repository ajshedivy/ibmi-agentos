'use client'

import { motion } from 'framer-motion'
import { MessageSquareShare } from 'lucide-react'

const ChatBlankState = () => {
  return (
    <section
      className="flex flex-col items-center text-center font-geist"
      aria-label="New session"
    >
      <div className="flex flex-col items-center gap-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MessageSquareShare className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl font-semibold tracking-tight"
        >
          New Session
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-sm text-muted-foreground"
        >
          Enter your input to get started with your agent.
        </motion.p>
      </div>
    </section>
  )
}

export default ChatBlankState
